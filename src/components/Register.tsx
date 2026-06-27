import { useMemo, useRef, useState } from "react";
import type { ModuleDef, Field } from "@/lib/modules";
import { db, nextLoadNumber, useTable } from "@/lib/storage";
import { useAuth, canEdit } from "@/lib/auth";
import { useI18n, tField } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportExcel, exportPDF, printRows } from "@/lib/export";
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  Search,
  ArrowUpDown,
  FileDown,
  FileText,
  Printer,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";

interface Props {
  module: ModuleDef;
}

function emptyRow(fields: Field[]) {
  const r: Record<string, any> = {};
  fields.forEach((f) => (r[f.key] = ""));
  return r;
}

function computeFields(module: ModuleDef, row: Record<string, any>) {
  const out = { ...row };
  module.fields.forEach((f) => {
    if (f.type === "computed" && f.compute) out[f.key] = f.compute(out);
  });
  return out;
}

export function Register({ module }: Props) {
  const rows = useTable(module.table);
  const user = useAuth();
  const editable = canEdit(user);
  const { t } = useI18n();

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>(module.fields[0]?.key ?? "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [viewing, setViewing] = useState<Record<string, any> | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let r = rows;
    if (q) {
      r = r.filter((row) =>
        module.fields.some((f) => f.type !== "image" && String(row[f.key] ?? "").toLowerCase().includes(q)),
      );
    }
    r = [...r].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [rows, search, sortKey, sortDir, module.fields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = module.fields.map((f) => ({ key: f.key, label: tField(t, f.key, f.label) }));
  const imageField = module.fields.find((f) => f.type === "image");

  const moduleTitle = t(`mod.${module.slug}`, module.title);

  function openNew() {
    const r = emptyRow(module.fields);
    r.date = new Date().toISOString().slice(0, 10);
    if (module.slug === "sterilization-load") r.loadNumber = nextLoadNumber();
    if (module.slug === "recall") {
      const n = rows.length + 1;
      r.recallNumber = `RC-${new Date().getFullYear()}-${String(n).padStart(3, "0")}`;
    }
    setEditing(r);
  }

  function save() {
    if (!editing) return;
    const finalRow = computeFields(module, editing);
    if (finalRow.id) {
      db.update(module.table, finalRow.id, finalRow);
    } else {
      db.insert(module.table, finalRow);
    }
    setEditing(null);
  }

  function remove(id: string) {
    if (confirm(t("reg.delete"))) db.remove(module.table, id);
  }

  // Non-image columns for the table (first 6)
  const tableFields = module.fields.filter((f) => f.type !== "image").slice(0, 6);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{moduleTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} {rows.length === 1 ? t("reg.record") : t("reg.records")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportExcel(module.slug, filtered, columns)}>
            <FileDown size={14} /> {t("reg.excel")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportPDF(moduleTitle, filtered, columns, imageField ? { imageKey: imageField.key } : undefined)
            }
          >
            <FileText size={14} /> {t("reg.pdf")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => printRows(moduleTitle, filtered, columns)}>
            <Printer size={14} /> {t("reg.print")}
          </Button>
          {editable && (
            <Button size="sm" onClick={openNew}>
              <Plus size={14} /> {t("reg.add")}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("reg.search")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {tableFields.map((f) => (
                  <TableHead
                    key={f.key}
                    className="cursor-pointer select-none"
                    onClick={() => {
                      if (sortKey === f.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
                      else {
                        setSortKey(f.key);
                        setSortDir("asc");
                      }
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {tField(t, f.key, f.label)} <ArrowUpDown size={12} className="opacity-50" />
                    </span>
                  </TableHead>
                ))}
                {imageField && <TableHead>{tField(t, imageField.key, imageField.label)}</TableHead>}
                <TableHead className="text-right">{t("reg.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={tableFields.length + 1 + (imageField ? 1 : 0)}
                    className="text-center text-muted-foreground py-12"
                  >
                    {t("reg.noRecords")}
                  </TableCell>
                </TableRow>
              )}
              {pageRows.map((row) => (
                <TableRow key={row.id}>
                  {tableFields.map((f) => (
                    <TableCell key={f.key}>{renderCell(module, row, f)}</TableCell>
                  ))}
                  {imageField && (
                    <TableCell>
                      {row[imageField.key] ? (
                        <button
                          onClick={() => setImagePreview(row[imageField.key])}
                          className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
                        >
                          <ImageIcon size={14} />
                          {t("reg.viewImage")}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(row)}>
                        <Eye size={14} />
                      </Button>
                      {editable && (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(row)}>
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => remove(row.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("reg.pageOf").replace("{0}", String(page)).replace("{1}", String(totalPages))}
          </span>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
              {t("reg.prev")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t("reg.next")}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? t("reg.edit") : t("reg.new")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              {module.fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  label={tField(t, f.key, f.label)}
                  value={
                    f.type === "computed" && f.compute ? f.compute(editing) : editing[f.key] ?? ""
                  }
                  onChange={(v) => setEditing({ ...editing, [f.key]: v })}
                  className={f.type === "textarea" || f.type === "image" ? "md:col-span-2" : ""}
                />
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("reg.cancel")}
            </Button>
            <Button onClick={save}>{t("reg.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("reg.details")}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {module.fields.map((f) => (
                <div
                  key={f.key}
                  className={`border border-border rounded-md p-3 bg-muted/30 ${f.type === "image" || f.type === "textarea" ? "md:col-span-2" : ""}`}
                >
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {tField(t, f.key, f.label)}
                  </div>
                  {f.type === "image" ? (
                    viewing[f.key] ? (
                      <img
                        src={viewing[f.key]}
                        alt={f.label}
                        className="max-h-64 rounded-md border border-border mt-1 cursor-zoom-in"
                        onClick={() => setImagePreview(viewing[f.key])}
                      />
                    ) : (
                      <div className="text-muted-foreground text-xs">{t("reg.noImage")}</div>
                    )
                  ) : (
                    <div className="font-medium break-words">
                      {renderCell(module, viewing, f) || "—"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image preview dialog */}
      <Dialog open={!!imagePreview} onOpenChange={(o) => !o && setImagePreview(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t("reg.viewImage")}</span>
              <button onClick={() => setImagePreview(null)} className="p-1">
                <X size={16} />
              </button>
            </DialogTitle>
          </DialogHeader>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-full max-h-[75vh] object-contain rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderCell(module: ModuleDef, row: Record<string, any>, f: Field): React.ReactNode {
  let v: any = f.type === "computed" && f.compute ? f.compute(row) : row[f.key];
  if (v === undefined || v === null || v === "") return "";

  if (["ciResult", "biResult", "testResult", "result"].includes(f.key)) {
    const cls =
      v === "Pass"
        ? "bg-success/15 text-success"
        : v === "Fail"
          ? "bg-destructive/15 text-destructive"
          : "bg-warning/20 text-warning-foreground";
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{v}</span>;
  }
  if (f.key === "status" && module.slug === "equipment-maintenance") {
    const cls =
      v === "VALID" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive";
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{v}</span>;
  }
  if (module.slug === "sterile-store" && f.key === "temperature") {
    const n = Number(v);
    const ok = n >= 18 && n <= 24;
    return <span className={ok ? "text-success font-medium" : "text-destructive font-medium"}>{v}°C</span>;
  }
  if (module.slug === "sterile-store" && f.key === "humidity") {
    const n = Number(v);
    const ok = n >= 35 && n <= 70;
    return <span className={ok ? "text-success font-medium" : "text-destructive font-medium"}>{v}%</span>;
  }
  return String(v);
}

function FieldInput({
  field,
  label,
  value,
  onChange,
  className,
}: {
  field: Field;
  label: string;
  value: any;
  onChange: (v: any) => void;
  className?: string;
}) {
  const id = `f-${field.key}`;
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") onChange(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs mb-1.5 block">
        {label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {field.type === "textarea" ? (
        <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : field.type === "select" ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "image" ? (
        <div className="space-y-2">
          {value ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt={label}
                className="max-h-48 rounded-md border border-border bg-muted/30"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow"
                aria-label={t("reg.remove")}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-md p-6 text-center text-xs text-muted-foreground">
              {t("reg.noImage")}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={14} /> {value ? t("reg.replace") : t("reg.upload")}
          </Button>
        </div>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={field.readonly || field.type === "computed"}
          className={field.readonly || field.type === "computed" ? "bg-muted" : ""}
        />
      )}
    </div>
  );
}
