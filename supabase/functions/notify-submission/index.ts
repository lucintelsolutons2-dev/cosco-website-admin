// ============================================================
// Supabase Edge Function: notify-submission
// Sends emails when a new website submission arrives, using the
// Cosco Gmail account (coscooverseasedu@gmail.com) over SMTP.
//
//   • New lucky-draw entry  -> emails the STUDENT their lot number
//                              + emails the team a notification
//   • New enquiry           -> emails the team a notification
//
// Wire it with a Database Webhook (Insert) on public.lucky_draw_entries
// and public.enquiries, pointing at this function's URL. Supabase sends
// { type, table, record, ... }.
//
// Required function secrets (supabase secrets set ...):
//   GMAIL_USER          coscooverseasedu@gmail.com
//   GMAIL_APP_PASSWORD  16-char Gmail App Password (needs 2FA on that account)
//   NOTIFY_TO           team inbox (default lucintelsolutions@gmail.com)
//   RESULTS_LABEL       e.g. "July 10" (shown to the student)
// ============================================================
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const GMAIL_USER = Deno.env.get("GMAIL_USER") ?? "";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";
const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "lucintelsolutions@gmail.com";
const RESULTS_LABEL = Deno.env.get("RESULTS_LABEL") ?? "July 10";
const FROM = `Cosco Overseas Education <${GMAIL_USER}>`;

type Payload = { type: string; table: string; record: Record<string, unknown> };

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

Deno.serve(async (req) => {
  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return new Response("GMAIL_USER / GMAIL_APP_PASSWORD not set", { status: 500 });
    }
    const { type, table, record } = (await req.json()) as Payload;
    if (type !== "INSERT") return new Response("ignored", { status: 200 });

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
      },
    });

    if (table === "lucky_draw_entries") {
      // 1) Student confirmation with their lot number
      if (record.email) {
        await client.send({
          from: FROM,
          to: String(record.email),
          subject: `🎟️ Your Cosco Lucky Draw lot number: ${esc(record.lot_number)}`,
          content: `Hi ${record.name}, your lot number is ${record.lot_number}. Winners announced ${RESULTS_LABEL} at coscoedu.com.`,
          html: studentEmail(record),
        });
      }
      // 2) Team notification
      await client.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `New Lucky Draw entry — ${esc(record.name)} (${esc(record.lot_number)})`,
        content: `New lucky draw entry from ${record.name}`,
        html: adminEmail("🎟️ New Lucky Draw entry", record, true),
      });
    } else if (table === "enquiries") {
      await client.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `New website enquiry — ${esc(record.name)}`,
        content: `New enquiry from ${record.name}`,
        html: adminEmail("📩 New website enquiry", record, false),
      });
    }

    await client.close();
    return new Response("sent", { status: 200 });
  } catch (err) {
    return new Response(`error: ${String(err)}`, { status: 500 });
  }
});

function studentEmail(r: Record<string, unknown>): string {
  return `
  <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:14px;overflow:hidden">
    <div style="background:#D10A12;color:#fff;padding:18px 22px">
      <div style="font-size:13px;letter-spacing:.08em;opacity:.85">COSCO MEGA LUCKY DRAW · KOTTAYAM EXPO</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px">You're in the draw! 🎉</div>
    </div>
    <div style="padding:22px">
      <p style="color:#333;font-size:15px">Hi ${esc(r.name)}, thanks for registering. Here is your official lot number:</p>
      <div style="text-align:center;margin:18px 0">
        <div style="display:inline-block;border:3px solid #1E4FA3;color:#1E4FA3;border-radius:10px;padding:12px 26px;font-size:30px;font-weight:800;letter-spacing:.06em">${esc(r.lot_number)}</div>
      </div>
      <div style="background:#fdf3d7;border:1.5px dashed #E8B33C;border-radius:10px;padding:14px;color:#5c4a12;font-size:14px;line-height:1.6">
        📌 <b>Keep this email safe.</b> Winners will be announced on <b>${RESULTS_LABEL}</b> at
        <b>coscoedu.com</b> and by email. Prizes include flight tickets, laptops, free visa assistance,
        IELTS coaching, movie tickets, trolley bags &amp; more!
      </div>
      <p style="color:#888;font-size:12px;margin-top:18px">Cosco Overseas Education · Kottayam, Kerala</p>
    </div>
  </div>`;
}

function adminEmail(title: string, r: Record<string, unknown>, lucky: boolean): string {
  const fields = lucky
    ? [["Lot number", r.lot_number], ["Name", r.name], ["Age", r.age], ["Phone", r.phone], ["Email", r.email], ["Country", r.country], ["Course", r.course]]
    : [["Name", r.name], ["Email", r.email], ["Phone", r.phone], ["Destination", r.destination], ["Message", r.message]];
  const rows = fields
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#6b7280;font-weight:600">${k}</td><td style="padding:6px 12px;color:#111">${esc(v)}</td></tr>`)
    .join("");
  return `
  <div style="max-width:560px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#D10A12;color:#fff;padding:16px 20px;font-size:18px;font-weight:700">${title}</div>
    <table style="width:100%;border-collapse:collapse;margin:8px 0">${rows}</table>
  </div>`;
}
