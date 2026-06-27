import { useTable } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Package,
  FlaskConical,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
  Wrench,
  CalendarCheck,
} from "lucide-react";

function pct(num: number, denom: number) {
  if (!denom) return "0%";
  return ((num / denom) * 100).toFixed(1) + "%";
}

export function Dashboard() {
  const { t } = useI18n();
  const loads = useTable("sterilization_load");
  const bi = useTable("biological_indicator");
  const recall = useTable("recall");
  const damage = useTable("instrument_damage");
  const distribution = useTable("distribution");
  const equipment = useTable("equipment_maintenance");

  const biPass = bi.filter((r) => r.result === "Pass").length;
  const biTotal = bi.length;
  const failedLoads = loads.filter(
    (l) => l.ciResult === "Fail" || l.biResult === "Fail",
  ).length;
  const pmCompliant = equipment.filter((e) => {
    if (!e.calibrationDate) return false;
    const next = new Date(e.calibrationDate);
    next.setFullYear(next.getFullYear() + 1);
    return next.getTime() >= Date.now();
  }).length;

  const cards = [
    { label: t("kpi.totalLoads"), value: loads.length, icon: Package },
    { label: t("kpi.totalBI"), value: biTotal, icon: FlaskConical },
    { label: t("kpi.biPass"), value: pct(biPass, biTotal), icon: CheckCircle2 },
    { label: t("kpi.failRate"), value: pct(failedLoads, loads.length), icon: AlertOctagon },
    { label: t("kpi.recallRate"), value: pct(recall.length, loads.length), icon: ShieldAlert },
    { label: t("kpi.damageRate"), value: pct(damage.length, distribution.length), icon: Wrench },
    { label: t("kpi.pm"), value: pct(pmCompliant, equipment.length), icon: CalendarCheck },
  ];

  // Monthly load trend
  const monthly = aggregateByMonth(loads, () => 1);
  // BI compliance trend by month
  const biMonthly = aggregateByMonth(bi, (r) => (r.result === "Pass" ? 1 : 0), "incubationStart");
  const biMonthlyTotal = aggregateByMonth(bi, () => 1, "incubationStart");
  const biTrend = biMonthly.map((m, i) => ({
    month: m.month,
    compliance: biMonthlyTotal[i]?.value ? (m.value / biMonthlyTotal[i].value) * 100 : 0,
  }));
  // Failure trend
  const failTrend = aggregateByMonth(
    loads,
    (r) => (r.ciResult === "Fail" || r.biResult === "Fail" ? 1 : 0),
  );

  // Dept distribution
  const deptMap: Record<string, number> = {};
  distribution.forEach((d) => {
    const k = d.department || "Unspecified";
    deptMap[k] = (deptMap[k] || 0) + (Number(d.quantityIssued) || 0);
  });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  // Equipment status
  const eqValid = equipment.length - (equipment.length - pmCompliant);
  const eqOverdue = equipment.length - eqValid;
  const eqData = [
    { name: "Valid", value: eqValid },
    { name: "Overdue", value: eqOverdue },
  ];

  const COLORS = ["#0561AC", "#0B8A8E", "#16a34a", "#ea9b14", "#dc2626", "#7c3aed", "#0891b2"];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t("dash.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dash.subtitle")}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-md bg-primary/10 text-primary`}>
                <c.icon size={18} />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t("chart.monthlyLoad")}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#0561AC" radius={[4, 4, 0, 0]} name="Loads" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("chart.dept")}>
          {deptData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={deptData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title={t("chart.biTrend")}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={biTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="compliance" stroke="#0B8A8E" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("chart.failTrend")}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={failTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} name="Failures" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("chart.equipStatus")} className="lg:col-span-2">
          {equipment.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={eqData} dataKey="value" nameKey="name" outerRadius={90} label>
                  <Cell fill="#16a34a" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg p-5 shadow-sm ${className ?? ""}`}>
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
      No data yet
    </div>
  );
}

function aggregateByMonth(
  rows: any[],
  valFn: (r: any) => number,
  dateKey = "date",
): { month: string; value: number }[] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const d = r[dateKey];
    if (!d) return;
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return;
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + valFn(r));
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, value]) => ({ month, value }));
}
