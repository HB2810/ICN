import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { login, useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Languages } from "lucide-react";
import logoAsset from "@/assets/stavya-logo.jpg.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — CSSD Management" }] }),
  component: LoginPage,
});

function LoginPage() {
  const user = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
  const [username, setUsername] = useState("icn");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = login(username, password);
    if (!u) setErr(t("login.invalid"));
    else navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card p-0.5 text-xs">
            <Languages size={12} className="ml-1 text-muted-foreground" />
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("gu")}
              className={`px-2 py-1 rounded ${lang === "gu" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              ગુ
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center mb-6">
            <img src={logoAsset.url} alt="Stavya Spine Hospital" className="h-16 w-auto" />
            <div className="mt-4 text-center">
              <h1 className="text-lg font-semibold">{t("login.title")}</h1>
              <p className="text-xs text-muted-foreground mt-1">{t("login.subtitle")}</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-xs">{t("login.username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" className="w-full">{t("login.signin")}</Button>
          </form>


        </div>
      </div>
    </div>
  );
}
