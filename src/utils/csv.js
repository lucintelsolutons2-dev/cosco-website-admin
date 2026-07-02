// Export an array of row objects to a downloaded CSV file.
export function downloadCSV(filename, columns, rows) {
  if (!rows.length) { window.alert("Nothing to export yet."); return; }
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => esc(typeof c.value === "function" ? c.value(r) : r[c.key])).join(","))
    .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([head + "\n" + body], { type: "text/csv" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
