import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Change,
  EmptyState,
  ErrorBox,
  Loading,
  PageBar,
  PageHeader,
  PositionDetail,
  ResultPreview,
  Section,
  StatusBadge,
} from "@/components/tb/kit";
import {
  buildKeywordStats,
  downloadFile,
  fmtDateTime,
  toCsv,
  useRefreshWorkspace,
  useWorkspaceData,
} from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { AddKeywordForm, SitesManager } from "@/components/tb/sites";

export const Route = createFileRoute("/_authenticated/keywords")({
  head: () => ({ meta: [{ title: "Keywords — Toblerone Rank Tracker" }] }),
  component: KeywordsPage,
});

function KeywordsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const query = useWorkspaceData();
  const refresh = useRefreshWorkspace();
  const stats = useMemo(
    () =>
      buildKeywordStats(
        query.data?.keywords ?? [],
        query.data?.websites ?? [],
        query.data?.runs ?? [],
      ),
    [query.data],
  );
  const filtered = stats.filter((item) => {
    const matchesText = `${item.keyword} ${item.website?.domain ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesText && (status === "all" || item.status === status);
  });

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;

  function exportKeywords() {
    const rows = [
      [
        "Keyword",
        "Website",
        "Current rank",
        "Google page",
        "Result on page",
        "Previous rank",
        "Change",
        "Status",
        "Pages checked",
        "Last checked",
        "Ranking URL",
        "Result title",
        "Result domain",
        "Result snippet",
      ],
      ...filtered.map((item) => [
        item.keyword,
        item.website?.domain,
        item.current,
        item.latest?.result_page_number,
        item.latest?.result_position_on_page,
        item.prev,
        item.change,
        item.status,
        item.latest?.pages_checked ?? item.pages_to_check,
        item.latest?.checked_at ?? "",
        item.latest?.ranking_url ?? "",
        item.latest?.result_title ?? "",
        item.latest?.result_domain ?? "",
        item.latest?.result_snippet ?? "",
      ]),
    ];
    downloadFile(`toblerone-keywords-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  }

  async function removeKeyword(id: string, keyword: string) {
    if (!window.confirm(`Remove “${keyword}” and all of its ranking history?`)) return;
    const { error } = await supabase.from("keywords").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await refresh();
    toast.success("Keyword removed");
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Portfolio" title="Tracked keywords">
        <Link
          to="/extension"
          className="h-10 bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Add through extension
        </Link>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
        <AddKeywordForm />
        <SitesManager />
      </div>

      <Section
        n="02"
        eyebrow="Keyword portfolio"
        title={`${stats.length} active trackers`}
        bodyClassName="p-0"
      >
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-border bg-background px-3 sm:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Search keyword or domain"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <select
              className="h-10 border border-border bg-background px-3 text-xs font-bold outline-none focus:border-primary"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="improved">Improved</option>
              <option value="dropped">Dropped</option>
              <option value="unchanged">No change</option>
              <option value="not_found">Not found</option>
              <option value="unchecked">Not checked</option>
            </select>
            <button
              className="inline-flex h-10 items-center gap-2 border border-border bg-card px-3 text-xs font-bold"
              onClick={exportKeywords}
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] border-collapse text-left">
              <thead className="label-caps border-b border-border bg-background/60">
                <tr>
                  <th className="px-5 py-3">Keyword</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Ranking page</th>
                  <th className="px-4 py-3">Movement</th>
                  <th className="px-4 py-3">Search depth</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last checked</th>
                  <th className="w-14 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-background/50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-extrabold">{item.keyword}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.website?.domain}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <PositionDetail value={item.current} />
                    </td>
                    <td className="w-[360px] px-4 py-4">
                      <ResultPreview run={item.latest} />
                    </td>
                    <td className="px-4 py-4">
                      <Change value={item.change} />
                    </td>
                    <td className="min-w-44 px-4 py-4">
                      <PageBar position={item.current} pages={item.pages_to_check} />
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        {item.pages_to_check} pages · top {item.pages_to_check * 10}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {item.latest ? fmtDateTime(item.latest.checked_at) : "Not checked"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        aria-label={`Remove ${item.keyword}`}
                        className="border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"
                        onClick={() => removeKeyword(item.id, item.keyword)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title={
                stats.length ? "No keywords match these filters" : "No keywords have synced yet"
              }
              body={
                stats.length
                  ? "Change the search or status filter."
                  : "Connect the extension, add a tracker, and run a manual check."
              }
            />
          </div>
        )}
      </Section>
    </div>
  );
}
