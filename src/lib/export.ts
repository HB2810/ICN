// Export helpers for PDF / Excel / Print.
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportExcel(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  // Skip image columns in Excel (data URLs are huge); replace with "[image]" marker.
  const data = rows.map((r) => {
    const obj: Record<string, any> = {};
    columns.forEach((c) => {
      const v = r[c.key];
      if (typeof v === "string" && v.startsWith("data:image/")) obj[c.label] = "[image attached]";
      else obj[c.label] = v ?? "";
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportPDF(
  title: string,
  rows: any[],
  columns: { key: string; label: string }[],
  options?: { imageKey?: string },
) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 14);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);

  // For the main table, omit the image column (too large for table cells).
  const tableCols = columns.filter((c) => c.key !== options?.imageKey);
  autoTable(doc, {
    startY: 26,
    head: [tableCols.map((c) => c.label)],
    body: rows.map((r) =>
      tableCols.map((c) => {
        const v = r[c.key];
        if (options?.imageKey && c.key === options.imageKey) return v ? "Yes" : "No";
        // Mark presence of any image data URL
        if (typeof v === "string" && v.startsWith("data:image/")) return "[image]";
        return String(v ?? "");
      }),
    ),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [5, 97, 172] },
  });

  // Append an "Attachments" section with each image, one per page.
  if (options?.imageKey) {
    const withImages = rows.filter((r) => typeof r[options.imageKey!] === "string" && r[options.imageKey!].startsWith("data:image/"));
    withImages.forEach((r, idx) => {
      doc.addPage();
      doc.setFontSize(13);
      doc.text(`Attachment ${idx + 1} — ${title}`, 14, 14);
      doc.setFontSize(10);
      const meta: string[] = [];
      if (r.date) meta.push(`Date: ${r.date}`);
      if (r.sterilizer) meta.push(`Sterilizer: ${r.sterilizer}`);
      if (r.testResult) meta.push(`Result: ${r.testResult}`);
      if (r.checkedBy) meta.push(`Checked By: ${r.checkedBy}`);
      doc.text(meta.join("   |   "), 14, 22);
      try {
        const img: string = r[options.imageKey!];
        const fmt = img.includes("image/png") ? "PNG" : "JPEG";
        // Fit within page; landscape A4 ~ 297x210mm
        doc.addImage(img, fmt, 14, 30, 180, 130, undefined, "FAST");
      } catch (e) {
        doc.text("(image could not be embedded)", 14, 40);
      }
    });
  }

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}

export function printRows(title: string, rows: any[], columns: { key: string; label: string }[]) {
  const cell = (v: any) => {
    if (typeof v === "string" && v.startsWith("data:image/")) {
      return `<img src="${v}" style="max-height:80px;max-width:120px;object-fit:contain"/>`;
    }
    return String(v ?? "").replace(/</g, "&lt;");
  };
  const html = `<!doctype html><html><head><title>${title}</title>
  <style>body{font-family:Inter,sans-serif;padding:24px;color:#222}
  h1{color:#0561AC;font-size:18px;margin:0 0 4px}
  .meta{color:#666;font-size:11px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}
  th{background:#0561AC;color:#fff}</style></head><body>
  <h1>${title}</h1><div class="meta">Generated: ${new Date().toLocaleString()}</div>
  <table><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
  <tbody>${rows
    .map(
      (r) =>
        `<tr>${columns.map((c) => `<td>${cell(r[c.key])}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}
