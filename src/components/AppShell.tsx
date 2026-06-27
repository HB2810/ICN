import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth, logout } from "@/lib/auth";
import { MODULES } from "@/lib/modules";
import { useI18n } from "@/lib/i18n";
import logoAsset from "@/assets/stavya-logo.jpg.asset.json";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  FlaskConical,
  CheckSquare,
  Droplet,
  ScanLine,
  Truck,
  AlertTriangle,
  Wrench,
  Thermometer,
  Settings2,
  Activity,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Languages,
} from "lucide-react";

const ICONS: Record<string, any> = {
  "sterilization-load": ClipboardList,
  "biological-indicator": FlaskConical,
  "bowie-dick": CheckSquare,
  "leak-test": Droplet,
  "instrument-tracking": ScanLine,
  distribution: Truck,
  recall: AlertTriangle,
  "instrument-damage": Wrench,
  "sterile-store": Thermometer,
  "equipment-maintenance": Settings2,
  "quality-capa": Activity,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted && !user) navigate({ to: "/login" });
  }, [user, navigate, mounted]);

  useEffect(() => setOpen(false), [location.pathname]);

  if (!mounted || !user) {
    return <div className="min-h-screen bg-background" />;
  }

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard, slug: "dashboard" },
    ...MODULES.map((m) => ({
      to: `/m/${m.slug}`,
      label: t(`mod.${m.slug}.short`, m.short),
      icon: ICONS[m.slug],
      slug: m.slug,
    })),
    { to: "/reports", label: t("nav.reports"), icon: FileBarChart, slug: "reports" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={logoAsset.url} alt="Stavya" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-1">
          <LangToggle lang={lang} setLang={setLang} />
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" className="p-2">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 shrink-0
        bg-sidebar border-r border-sidebar-border flex flex-col transition-transform`}
      >
        <div className="px-5 py-5 border-b border-sidebar-border">
          <img src={logoAsset.url} alt="Stavya Spine Hospital" className="h-12 w-auto" />
          <div className="mt-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              {t("brand.tag")}
            </div>
            <div className="text-sm font-semibold text-foreground">{t("brand.subtitle")}</div>
          </div>
          <div className="mt-3 hidden md:flex">
            <LangToggle lang={lang} setLang={setLang} />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon ?? LayoutDashboard;
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                ${active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.designation}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="p-2 rounded-md hover:bg-sidebar-accent text-muted-foreground"
              aria-label={t("nav.logout")}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: "en" | "gu"; setLang: (l: "en" | "gu") => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-sidebar-border bg-background/60 p-0.5 text-xs">
      <Languages size={12} className="ml-1 text-muted-foreground" />
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        onClick={() => setLang("gu")}
        className={`px-2 py-1 rounded ${lang === "gu" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={lang === "gu"}
      >
        ગુ
      </button>
    </div>
  );
}
