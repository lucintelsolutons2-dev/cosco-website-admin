import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiSearch, FiRefreshCw } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { downloadCSV } from "../utils/csv";

const STATUSES = ["new", "contacted", "closed"];
const statusStyle = {
  new: "bg-brand-50 text-brand-700",
  contacted: "bg-amber-50 text-amber-700",
  closed: "bg-ink-100 text-ink-500",
};

const fmt = (t) => new Date(t).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function Enquiries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else { setRows(data); setError(""); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id, status) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) { setError(error.message); load(); }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.destination, r.message].some((v) => (v || "").toLowerCase().includes(s))
    );
  }, [rows, q]);

  const exportCsv = () =>
    downloadCSV("cosco-enquiries.csv", [
      { key: "created_at", label: "Received", value: (r) => fmt(r.created_at) },
      { key: "name", label: "Name" }, { key: "email", label: "Email" },
      { key: "phone", label: "Phone" }, { key: "destination", label: "Destination" },
      { key: "message", label: "Message" }, { key: "status", label: "Status" },
    ], filtered);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Enquiries</h1>
          <p className="text-sm text-ink-400">{filtered.length} of {rows.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost" title="Refresh"><FiRefreshCw size={16} /></button>
          <button onClick={exportCsv} className="btn-primary"><FiDownload size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="mb-4 relative max-w-sm">
        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input className="input pl-9" placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <div className="mb-4 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{error}</div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Received</th><th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th><th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Message</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">No enquiries yet.</td></tr>
              ) : filtered.map((r) => (
                <tr key={r.id} className="align-top hover:bg-ink-50/50">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-500">{fmt(r.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{r.name}</td>
                  <td className="px-4 py-3 text-ink-600">
                    <a href={`mailto:${r.email}`} className="block text-brand-700 hover:underline">{r.email}</a>
                    <a href={`tel:${r.phone}`} className="block">{r.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{r.destination || "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-ink-600">{r.message || "—"}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}
                      className={`badge cursor-pointer border-0 ${statusStyle[r.status] || "bg-ink-100 text-ink-500"}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
