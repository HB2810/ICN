import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Register } from "@/components/Register";
import { getModule } from "@/lib/modules";

export const Route = createFileRoute("/m/$slug")({
  component: ModulePage,
});

function ModulePage() {
  const { slug } = useParams({ from: "/m/$slug" });
  const module = getModule(slug);
  return (
    <AppShell>
      {module ? (
        <Register module={module} />
      ) : (
        <div className="text-center py-16">
          <h1 className="text-xl font-semibold">Module not found</h1>
          <Link to="/" className="text-primary text-sm mt-2 inline-block">Back to dashboard</Link>
        </div>
      )}
    </AppShell>
  );
}
