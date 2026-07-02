// Export an array of row objects to a downloaded CSV file.
export function downloadCSV(filename, columns, rows) {
  if (!rows.length) { window.alert("Nothing to export yet."); return; }

  const esc = (v) => {
    let s = String(v ?? "");
    // Neutralize CSV/formula injection — website form input is untrusted, so a
    // value starting with = + - @ (or a tab/CR) must not run as a spreadsheet
    // formula when the export is opened in Excel/Sheets.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };

  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows
    .map((r) => columns.map((c) => esc(typeof c.value === "function" ? c.value(r) : r[c.key])).join(","))
    .join("\n");

  // Leading BOM (﻿) so Excel reads UTF-8 correctly (names/messages may be non-ASCII).
  const blob = new Blob(["﻿" + head + "\n" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
