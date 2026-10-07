import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Change,
  ErrorBox,
  Loading,
  PageHeader,
  PositionChart,
  PositionDetail,
  Rank,
  ResultPreview,
  Section,
  StatStrip,
} from "@/components/tb/kit";
import {
  buildKeywordStats,
  chartRows,
  downloadFile,
  fmtDateTime,
  rangeFor,
  RANGES,
  toCsv,
  useWorkspaceData,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — Toblerone Rank Tracker" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const [range, setRange] = useState("90");
  const query = useWorkspaceData();
  const stats = useMemo(
    () =>
      buildKeywordStats(
        query.data?.keywords ?? [],
        query.data?.websites ?? [],
        query.data?.runs ?? [],
        rangeFor(range),
      ),
    [query.data, range],
  );

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;

  const ranked = stats.filter((item) => item.current != null);
  const average = ranked.length
    ? Math.round(ranked.reduce((sum, item) => sum + (item.current ?? 0), 0) / ranked.length)
    : null;
  const improved = stats.filter((item) => item.status === "improved").length;
  const dropped = stats.filter((item) => item.status === "dropped").length;
  const series = stats.slice(0, 5).map((item) => ({ key: item.id, label: item.keyword }));

  function exportReport() {
    const rows = [
      [
        "Keyword",
        "Website",
        "Current rank",
        "Google page",
        "Result on page",
        "Previous rank",
        "Change",
        "Best rank",
        "Status",
        "Last checked",
        "Ranked page title",
        "Ranked page URL",
        "Google snippet",
      ],
      ...stats.map((item) => [
        item.keyword,
        item.website?.domain,
        item.current,
        item.latest?.result_page_number,
        item.latest?.result_position_on_page,
        item.prev,
        item.change,
        item.best,
        item.status,
        item.latest?.checked_at ?? "",
        item.latest?.result_title ?? "",
        item.latest?.ranking_url ?? "",
        item.latest?.result_snippet ?? "",
      ]),
    ];
    downloadFile(
      `toblerone-client-report-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows),
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Client-ready reporting" title="Performance report">
        <select
          className="h-10 border border-border bg-card px-3 text-xs font-bold"
          value={range}
          onChange={(event) => setRange(event.target.value)}
        >
          {RANGES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          className="no-print inline-flex h-10 items-center gap-2 border border-border bg-card px-4 text-sm font-bold"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" /> Print / PDF
        </button>
        <button
          className="no-print inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-bold text-primary-foreground"
          onClick={exportReport}
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </PageHeader>

      <div className="border-y-2 border-foreground py-6">
        <div className="grid gap-5 md:grid-cols-[1fr_420px] md:items-end">
          <div>
            <div className="eyebrow">Toblerone SEO report</div>
            <h2 className="num mt-3 text-5xl leading-[.95] tracking-tight md:text-6xl">
              Search visibility
              <br />
              snapshot
            </h2>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Generated {fmtDateTime(new Date())}. This report summarizes manual Google ranking checks
            completed by the Toblerone extension.
          </p>
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Keywords", value: stats.length },
          {
            label: "Top 10",
            value: stats.filter((item) => item.current != null && item.current <= 10).length,
          },
          { label: "Average", value: average == null ? "—" : `#${average}` },
          { label: "Improved", value: improved },
          { label: "Dropped", value: dropped, tone: dropped ? "red" : undefined },
          {
            label: "Best rank",
            value: ranked.length
              ? `#${Math.min(...ranked.map((item) => item.current as number))}`
              : "—",
          },
        ]}
      />

      <Section n="01" eyebrow="Trend" title="Ranking movement">
        <PositionChart rows={chartRows(stats)} series={series} height={320} />
      </Section>

      <Section n="02" eyebrow="Breakdown" title="Current positions" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="label-caps border-b border-border bg-background/60">
              <tr>
                <th className="px-5 py-3">Keyword</th>
                <th className="px-4 py-3">Current</th>
                <th className="px-4 py-3">Ranked page</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3">Best</th>
                <th className="px-5 py-3">Latest check</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-extrabold">{item.keyword}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.website?.domain}</div>
                  </td>
                  <td className="px-4 py-4">
                    <PositionDetail value={item.current} />
                  </td>
                  <td className="w-[360px] px-4 py-4">
                    <ResultPreview run={item.latest} compact />
                  </td>
                  <td className="px-4 py-4">
                    <Change value={item.change} />
                  </td>
                  <td className="px-4 py-4">
                    <Rank value={item.best} className="text-xl" />
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {item.latest ? fmtDateTime(item.latest.checked_at) : "Not checked"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
