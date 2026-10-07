import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Change,
  EmptyState,
  ErrorBox,
  Loading,
  PageHeader,
  PositionDetail,
  ResultPreview,
  Section,
} from "@/components/tb/kit";
import { downloadFile, fmtDateTime, toCsv, useWorkspaceData } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Ranking History — Toblerone Rank Tracker" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [search, setSearch] = useState("");
  const query = useWorkspaceData();
  const rows = useMemo(() => {
    const data = query.data;
    if (!data) return [];
    const keywordMap = new Map(data.keywords.map((item) => [item.id, item]));
    const websiteMap = new Map(data.websites.map((item) => [item.id, item]));
    return [...data.runs]
      .sort((a, b) => b.checked_at.localeCompare(a.checked_at))
      .map((run) => ({
        run,
        keyword: keywordMap.get(run.keyword_id),
        website: websiteMap.get(run.website_id),
      }))
      .filter((item) =>
        `${item.keyword?.keyword ?? ""} ${item.website?.domain ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
  }, [query.data, search]);

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;

  function exportHistory() {
    const data = [
      [
        "Date",
        "Keyword",
        "Website",
        "Rank",
        "Google page",
        "Result on page",
        "Previous rank",
        "Change",
        "Pages checked",
        "Found URL",
        "Result title",
        "Result domain",
        "Result snippet",
      ],
      ...rows.map(({ run, keyword, website }) => [
        run.checked_at,
        keyword?.keyword,
        website?.domain,
        run.position,
        run.result_page_number,
        run.result_position_on_page,
        run.previous_position,
        run.position_change,
        run.pages_checked,
        run.ranking_url,
        run.result_title,
        run.result_domain,
        run.result_snippet,
      ]),
    ];
    downloadFile(`toblerone-history-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(data));
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Audit trail" title="Ranking history">
        <button
          className="inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-bold text-primary-foreground"
          onClick={exportHistory}
        >
          <Download className="h-4 w-4" /> Export history
        </button>
      </PageHeader>

      <Section
        n="01"
        eyebrow="Complete log"
        title={`${rows.length} recorded runs`}
        bodyClassName="p-0"
      >
        <div className="border-b border-border p-4">
          <label className="flex h-10 max-w-sm items-center gap-2 border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="Filter keyword or domain"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px] border-collapse text-left">
              <thead className="label-caps border-b border-border bg-background/60">
                <tr>
                  <th className="px-5 py-3">Date and time</th>
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Exact ranking page</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Depth</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ run, keyword, website }) => (
                  <tr key={run.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 text-xs font-semibold">
                      {fmtDateTime(run.checked_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-extrabold">{keyword?.keyword ?? "Deleted keyword"}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{website?.domain}</div>
                    </td>
                    <td className="px-4 py-4">
                      <PositionDetail value={run.found ? run.position : null} />
                    </td>
                    <td className="w-[380px] px-4 py-4">
                      <ResultPreview run={run} />
                    </td>
                    <td className="px-4 py-4">
                      <Change value={run.position_change} />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      Top {run.pages_checked * 10}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No matching ranking runs"
              body="Run a keyword check in the connected extension to build this history."
            />
          </div>
        )}
      </Section>
    </div>
  );
}
