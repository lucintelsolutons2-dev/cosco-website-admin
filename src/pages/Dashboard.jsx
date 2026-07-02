import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiInbox, FiGift, FiClock, FiAward } from "react-icons/fi";
import { supabase } from "../lib/supabase";

const fmt = (t) => new Date(t).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function Stat({ icon: Icon, label, value, tint }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}><Icon size={22} /></div>
      <div>
        <div className="text-2xl font-extrabold text-ink-900">{value}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ enq: 0, newEnq: 0, lucky: 0, winners: 0 });
  const [recentEnq, setRecentEnq] = useState([]);
  const [recentLucky, setRecentLucky] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all([
          supabase.from("enquiries").select("id", { count: "exact", head: true }),
          supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
          supabase.from("lucky_draw_entries").select("id", { count: "exact", head: true }),
          supabase.from("lucky_draw_entries").select("id", { count: "exact", head: true }).eq("is_winner", true),
          supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(5),
          supabase.from("lucky_draw_entries").select("*").order("created_at", { ascending: false }).limit(5),
        ]);
        const failed = results.find((r) => r.error);
        if (failed) throw failed.error;
        const [enqCount, newCount, luckyCount, winnersCount, enq, lucky] = results;
        setStats({
          enq: enqCount.count ?? 0, newEnq: newCount.count ?? 0,
          lucky: luckyCount.count ?? 0, winners: winnersCount.count ?? 0,
        });
        setRecentEnq(enq.data ?? []);
        setRecentLucky(lucky.data ?? []);
      } catch (e) {
        setError(e?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Dashboard</h1>
      <p className="mb-6 text-sm text-ink-400">Overview of website submissions</p>

      {error && <div className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={FiInbox} label="Total enquiries" value={loading ? "…" : stats.enq} tint="bg-brand-50 text-brand-600" />
        <Stat icon={FiClock} label="New / unactioned" value={loading ? "…" : stats.newEnq} tint="bg-amber-50 text-amber-600" />
        <Stat icon={FiGift} label="Lucky draw entries" value={loading ? "…" : stats.lucky} tint="bg-indigo-50 text-indigo-600" />
        <Stat icon={FiAward} label="Winners marked" value={loading ? "…" : stats.winners} tint="bg-green-50 text-green-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentCard title="Recent enquiries" to="/enquiries" empty="No enquiries yet." loading={loading}>
          {recentEnq.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink-900">{r.name}</div>
                <div className="truncate text-xs text-ink-400">{r.email} · {r.destination || "—"}</div>
              </div>
              <div className="shrink-0 text-xs text-ink-400">{fmt(r.created_at)}</div>
            </li>
          ))}
        </RecentCard>

        <RecentCard title="Recent lucky draw" to="/lucky-draw" empty="No entries yet." loading={loading}>
          {recentLucky.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink-900">
                  <span className="font-mono text-brand-700">{r.lot_number}</span> · {r.name}
                </div>
                <div className="truncate text-xs text-ink-400">{r.country || "—"} · {r.course || "—"}</div>
              </div>
              <div className="shrink-0 text-xs text-ink-400">{fmt(r.created_at)}</div>
            </li>
          ))}
        </RecentCard>
      </div>
    </div>
  );
}

function RecentCard({ title, to, empty, loading, children }) {
  const hasItems = Array.isArray(children) && children.length > 0;
  return (
    <div className="card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-bold text-ink-900">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-brand-700 hover:underline">View all →</Link>
      </div>
      {loading ? <p className="py-6 text-center text-sm text-ink-400">Loading…</p>
        : hasItems ? <ul className="divide-y divide-ink-100">{children}</ul>
        : <p className="py-6 text-center text-sm text-ink-400">{empty}</p>}
    </div>
  );
}
