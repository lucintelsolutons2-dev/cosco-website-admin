// Vercel serverless function — sends the Lucky Draw confirmation email
// FROM info@coscoedu.com via the Cosco mail server (SMTP). Token-gated:
// only requests with ?key=<MAIL_SECRET> are honoured.
//
// Env vars (set in the Vercel project, never committed):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_SECRET
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  if (!process.env.MAIL_SECRET || req.query.key !== process.env.MAIL_SECRET) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const r = (body && body.record) || body || {};
  const to = r.email;
  const name = r.name || "there";
  const lot = r.lot_number || r.lot || "";
  if (!to) return res.status(400).json({ ok: false, error: "no email" });

  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#D10A12;color:#fff;padding:16px 20px;font-size:18px;font-weight:bold">COSCO MEGA LUCKY DRAW · Kottayam Expo</div>
    <div style="padding:22px;color:#333">
      <p style="font-size:16px">Hi ${escapeHtml(name)}, <b>thanks for registering!</b> 🎉</p>
      <p>Here is your official lot number:</p>
      <div style="text-align:center;margin:16px 0"><span style="display:inline-block;border:3px solid #1E4FA3;color:#1E4FA3;border-radius:10px;padding:12px 26px;font-size:30px;font-weight:bold;letter-spacing:2px">${escapeHtml(lot)}</span></div>
      <div style="background:#fdf3d7;border:1px dashed #E8B33C;border-radius:10px;padding:14px;color:#5c4a12">
        📌 Keep this email safe. Winners are announced on <b>July 20</b> at <b>coscoedu.com</b> and by email.<br>
        Prizes: iPhone 17, Laptop, Flight ticket, Visa assistance, Free scholarship application, Fee waiver, Free IELTS coaching &amp; more!
      </div>
      <p style="color:#888;font-size:12px;margin-top:18px">Cosco Overseas Education · Kottayam, Kerala</p>
    </div>
  </div>`;

  try {
    await transport.sendMail({
      from: `"Cosco Overseas Education" <${process.env.SMTP_USER}>`,
      to,
      subject: "Thanks for registering — your Cosco Lucky Draw lot number",
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
