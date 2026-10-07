import { createFileRoute } from "@tanstack/react-router";
import { Database, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { ErrorBox, Loading, PageHeader, Section } from "@/components/tb/kit";
import { SitesManager } from "@/components/tb/sites";
import { downloadFile, toCsv, useWorkspaceData } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Toblerone Rank Tracker" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const query = useWorkspaceData();

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;
  const data = query.data;

  function exportBackup() {
    if (!data) return;
    const rows = [
      ["Checked at", "Keyword", "Domain", "Rank", "Change", "Pages", "URL"],
      ...data.runs.map((run) => [
        run.checked_at,
        data.keywords.find((item) => item.id === run.keyword_id)?.keyword,
        data.websites.find((item) => item.id === run.website_id)?.domain,
        run.position,
        run.position_change,
        run.pages_checked,
        run.ranking_url,
      ]),
    ];
    downloadFile(`toblerone-backup-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    toast.success("Dashboard backup downloaded");
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Workspace" title="Dashboard settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <SitesManager />
        <Section eyebrow="Storage" title="Cloud data">
          <Database className="h-6 w-6 text-primary" />
          <div className="mt-5 grid grid-cols-2 gap-px border border-border bg-border">
            <div className="bg-card p-3">
              <div className="label-caps">Keywords</div>
              <div className="num mt-1 text-2xl">{data?.keywords.length ?? 0}</div>
            </div>
            <div className="bg-card p-3">
              <div className="label-caps">Runs</div>
              <div className="num mt-1 text-2xl">{data?.runs.length ?? 0}</div>
            </div>
          </div>
          <button
            className="mt-5 h-10 w-full border border-border text-sm font-bold hover:border-primary"
            onClick={exportBackup}
          >
            Download CSV backup
          </button>
        </Section>
        <Section eyebrow="Search market" title="Current coverage">
          <Globe2 className="h-6 w-6 text-primary" />
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Google results are checked in English with personalization disabled where Google
            supports it. The extension records the configured market for future filtering.
          </p>
          <div className="mt-4 border border-border bg-background p-3 text-sm font-extrabold">
            Default market: United States
          </div>
        </Section>
      </div>
    </div>
  );
}
