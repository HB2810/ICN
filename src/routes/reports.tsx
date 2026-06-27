import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useMemo, useState } from "react";
import { MODULES, getModule } from "@/lib/modules";
import { useTable } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FileDown, FileText, Printer } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — CSSD Management" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [slug, setSlug] = useState(MODULES[0].slug);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dept, setDept] = useState("");
  const [sterilizer, setSterilizer] = useState("");
  const [operator, setOperator] = useState("");
  const [status, setStatus] = useState("");
  const [generated, setGenerated] = useState(false);

  const module = getModule(slug)!;
  const rows = useTable(module.table);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (from && r.date && r.date < from) return false;
      if (to && r.date && r.date > to) return false;
      if (dept && String(r.department ?? "").toLowerCase() !== dept.toLowerCase()) return false;
      if (
        sterilizer &&
        !String(r.sterilizerId ?? r.sterilizer ?? r.sterilizerNumber ?? "")
          .toLowerCase()
          .includes(sterilizer.toLowerCase())
      )
        return false;
      if (operator && !String(r.operator ?? "").toLowerCase().includes(operator.toLowerCase()))
        return false;
      if (status) {
        const sVal = String(r.status ?? r.result ?? r.testResult ?? r.ciResult ?? r.biResult ?? "");
        if (sVal !== status) return false;
      }
      return true;
    });
  }, [rows, from, to, dept, sterilizer, operator, status]);

  const columns = module.fields.map((f) => ({ key: f.key, label: f.label }));

  const kpis = useMemo(() => {
    const total = filtered.length;
    const passLike = filtered.filter((r) =>
      ["Pass", "VALID"].includes(String(r.ciResult ?? r.biResult ?? r.result ?? r.testResult ?? r.status ?? "")),
    ).length;
    const failLike = filtered.filter((r) =>
      ["Fail", "OVERDUE"].includes(String(r.ciResult ?? r.biResult ?? r.result ?? r.testResult ?? r.status ?? "")),
    ).length;
    return { total, passLike, failLike };
  }, [filtered]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Filter, generate and export audit-ready reports for any register.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs">Module</Label>
            <Select value={slug} onValueChange={setSlug}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODULES.map((m) => (
                  <SelectItem key={m.slug} value={m.slug}>{m.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Date From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className="text-xs">Date To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className="text-xs">Department</Label>
            <Input value={dept} onChange={(e) => setDept(e.target.value)} className="mt-1.5" placeholder="Any" />
          </div>
          <div>
            <Label className="text-xs">Sterilizer</Label>
            <Input value={sterilizer} onChange={(e) => setSterilizer(e.target.value)} className="mt-1.5" placeholder="Any" />
          </div>
          <div>
            <Label className="text-xs">Operator</Label>
            <Input value={operator} onChange={(e) => setOperator(e.target.value)} className="mt-1.5" placeholder="Any" />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="Pass">Pass</SelectItem>
                <SelectItem value="Fail">Fail</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="VALID">Valid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <Button onClick={() => setGenerated(true)}>Generate Report</Button>
          <Button variant="outline" onClick={() => exportExcel(`${module.slug}-report`, filtered, columns)}>
            <FileDown size={14} /> Export Excel
          </Button>
          <Button variant="outline" onClick={() => exportPDF(`${module.title} Report`, filtered, columns)}>
            <FileText size={14} /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => printRows(`${module.title} Report`, filtered, columns)}>
            <Printer size={14} /> Print
          </Button>
        </div>
      </div>

      {generated && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Kpi label="Total Records" value={kpis.total} />
            <Kpi label="Pass / Valid" value={kpis.passLike} tone="success" />
            <Kpi label="Fail / Overdue" value={kpis.failLike} tone="destructive" />
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                      No records match the filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    {columns.map((c) => {
                      const f = module.fields.find((x) => x.key === c.key)!;
                      const v = f.type === "computed" && f.compute ? f.compute(r) : r[c.key];
                      return <TableCell key={c.key}>{v ?? ""}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: "success" | "destructive" }) {
  const colorClass =
    tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${colorClass}`}>{value}</div>
    </div>
  );
}
