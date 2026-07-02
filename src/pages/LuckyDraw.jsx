import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiSearch, FiRefreshCw, FiAward } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { downloadCSV } from "../utils/csv";

const fmt = (t) => new Date(t).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function LuckyDraw() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [winnersOnly, setWinnersOnly] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("lucky_draw_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else { setRows(data); setError(""); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleWinner(row) {
    const is_winner = !row.is_winner;
    let prize = row.prize;
    if (is_winner) {
      prize = window.prompt(`Prize for ${row.name} (${row.lot_number}):`, row.prize || "");
      if (prize === null) return; // cancelled
    } else {
      prize = null;
    }
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_winner, prize } : r)));
    const { error } = await supabase.from("lucky_draw_entries").update({ is_winner, prize }).eq("id", row.id);
    if (error) { setError(error.message); load(); }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (winnersOnly && !r.is_winner) return false;
      if (!s) return true;
      return [r.lot_number, r.name, r.email, r.phone, r.country, r.course].some((v) => (v || "").toLowerCase().includes(s));
    });
  }, [rows, q, winnersOnly]);

  const exportCsv = () =>
    downloadCSV("cosco-lucky-draw.csv", [
      { key: "created_at", label: "Registered", value: (r) => fmt(r.created_at) },
      { key: "lot_number", label: "Lot" }, { key: "name", label: "Name" }, { key: "age", label: "Age" },
      { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
      { key: "country", label: "Country" }, { key: "course", label: "Course" },
      { key: "is_winner", label: "Winner", value: (r) => (r.is_winner ? "YES" : "") },
      { key: "prize", label: "Prize" },
    ], filtered);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Lucky Draw entries</h1>
          <p className="text-sm text-ink-400">
            {rows.length} total · {rows.filter((r) => r.is_winner).length} winners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost" title="Refresh"><FiRefreshCw size={16} /></button>
          <button onClick={exportCsv} className="btn-primary"><FiDownload size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search lot, name, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={winnersOnly} onChange={(e) => setWinnersOnly(e.target.checked)} />
          Winners only
        </label>
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{error}</div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Lot</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Age</th>
                <th className="px-4 py-3">Contact</th><th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Course</th><th className="px-4 py-3">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-400">No entries yet.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className={`align-top hover:bg-ink-50/50 ${r.is_winner ? "bg-green-50/40" : ""}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-ink-900">{r.lot_number}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{r.name}</td>
                  <td className="px-4 py-3 text-ink-600">{r.age ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-600">
                    <a href={`mailto:${r.email}`} className="block text-brand-700 hover:underline">{r.email}</a>
                    <a href={`tel:${r.phone}`} className="block">{r.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{r.country || "—"}</td>
                  <td className="px-4 py-3 text-ink-600">{r.course || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleWinner(r)}
                      className={`badge gap-1 ${r.is_winner ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-500 hover:bg-ink-200"}`}>
                      <FiAward size={13} /> {r.is_winner ? (r.prize || "Winner") : "Mark winner"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
