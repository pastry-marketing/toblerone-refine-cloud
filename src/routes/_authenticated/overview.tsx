import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Clock3, PlugZap } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Change,
  ErrorBox,
  Legend,
  Loading,
  PageHeader,
  PositionChart,
  PositionDetail,
  ResultPreview,
  Section,
  StatStrip,
  StatusBadge,
} from "@/components/tb/kit";
import {
  buildKeywordStats,
  chartRows,
  fmtDateTime,
  rangeFor,
  RANGES,
  useWorkspaceData,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({
    meta: [
      { title: "Overview — Toblerone Rank Tracker" },
      {
        name: "description",
        content: "Your current Google ranking performance and recent movement.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const [range, setRange] = useState("90");
  const query = useWorkspaceData();
  const data = query.data;
  const stats = useMemo(
    () =>
      buildKeywordStats(
        data?.keywords ?? [],
        data?.websites ?? [],
        data?.runs ?? [],
        rangeFor(range),
      ),
    [data, range],
  );

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;

  const ranked = stats.filter((item) => item.current != null);
  const improved = stats.filter((item) => item.status === "improved").length;
  const dropped = stats.filter((item) => item.status === "dropped").length;
  const notFound = stats.filter((item) => item.status === "not_found").length;
  const average = ranked.length
    ? Math.round(
        (ranked.reduce((sum, item) => sum + (item.current ?? 0), 0) / ranked.length) * 10,
      ) / 10
    : null;
  const latestRun = [...(data?.runs ?? [])].sort((a, b) =>
    b.checked_at.localeCompare(a.checked_at),
  )[0];
  const chartSeries = stats.slice(0, 5).map((item) => ({ key: item.id, label: item.keyword }));
  const recent = [...stats]
    .filter((item) => item.latest)
    .sort((a, b) => (b.latest?.checked_at ?? "").localeCompare(a.latest?.checked_at ?? ""))
    .slice(0, 7);
  const connected = (data?.devices ?? []).some((device) => !device.revoked_at);
  const distribution = [
    {
      label: "Top 3",
      value: stats.filter((item) => item.current != null && item.current <= 3).length,
    },
    {
      label: "4–10",
      value: stats.filter((item) => item.current != null && item.current >= 4 && item.current <= 10)
        .length,
    },
    {
      label: "11–20",
      value: stats.filter(
        (item) => item.current != null && item.current >= 11 && item.current <= 20,
      ).length,
    },
    {
      label: "21–50",
      value: stats.filter(
        (item) => item.current != null && item.current >= 21 && item.current <= 50,
      ).length,
    },
    {
      label: "51+",
      value: stats.filter((item) => item.current != null && item.current >= 51).length,
    },
    { label: "Not found", value: notFound },
  ];

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="SEO position tracking" title="Your search visibility">
        <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-xs font-semibold">
          <Clock3 className="h-3.5 w-3.5 text-primary" />
          {latestRun
            ? `Last check ${fmtDateTime(latestRun.checked_at)}`
            : "Waiting for first check"}
        </div>
        <select
          aria-label="Dashboard date range"
          className="h-9 border border-border bg-card px-3 text-xs font-bold outline-none focus:border-primary"
          value={range}
          onChange={(event) => setRange(event.target.value)}
        >
          {RANGES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </PageHeader>

      <StatStrip
        items={[
          { label: "Tracked keywords", value: stats.length },
          {
            label: "Top 3",
            value: stats.filter((item) => item.current != null && item.current <= 3).length,
          },
          {
            label: "Top 10",
            value: stats.filter((item) => item.current != null && item.current <= 10).length,
          },
          { label: "Average rank", value: average == null ? "—" : `#${average}` },
          { label: "Improved", value: improved },
          { label: "Drops", value: dropped, tone: dropped ? "red" : undefined },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.7fr)]">
        <Section
          n="01"
          eyebrow="Performance"
          title="Position trend"
          action={<Legend series={chartSeries} />}
          bodyClassName="pb-3"
        >
          <PositionChart rows={chartRows(stats)} series={chartSeries} height={340} />
        </Section>

        <Section n="02" eyebrow="Connection" title="Extension status" bodyClassName="space-y-5">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 h-2.5 w-2.5 shrink-0 ${connected ? "bg-success" : "bg-primary"}`}
            />
            <div>
              <div className="font-extrabold">
                {connected ? "Connected and syncing" : "Connect the Chrome extension"}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {connected
                  ? "Completed ranking checks are saved here automatically."
                  : "Pair the extension once, then every manual run will appear in this dashboard."}
              </p>
            </div>
          </div>
          <Link
            to="/extension"
            className="inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            <PlugZap className="h-4 w-4" />
            {connected ? "Manage connection" : "Connect extension"}
          </Link>
          <div className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            Checks stay manual. The web app stores, graphs, and exports the results; it does not
            search Google itself.
          </div>
        </Section>
      </div>

      <Section n="03" eyebrow="Coverage" title="Ranking distribution">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
          {distribution.map((band) => (
            <div key={band.label} className="bg-card px-4 py-5">
              <div className="label-caps">{band.label}</div>
              <div className="num mt-2 text-3xl">{band.value}</div>
              <div className="mt-3 h-1.5 bg-border">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${stats.length ? (band.value / stats.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        n="04"
        eyebrow="Latest activity"
        title="Recent ranking checks"
        action={
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            Full history <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
        bodyClassName="p-0"
      >
        {recent.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead className="label-caps border-b border-border bg-background/60">
                <tr>
                  <th className="px-5 py-3">Keyword</th>
                  <th className="px-4 py-3">Current</th>
                  <th className="px-4 py-3">Ranked page</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Depth</th>
                  <th className="px-5 py-3">Checked</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-extrabold">{item.keyword}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.website?.domain}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <PositionDetail value={item.current} />
                    </td>
                    <td className="max-w-sm px-4 py-4 text-xs">
                      <ResultPreview run={item.latest} compact />
                    </td>
                    <td className="px-4 py-4">
                      <Change value={item.change} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">
                      Top {item.pages_to_check * 10}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {item.latest ? fmtDateTime(item.latest.checked_at) : "Not checked"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
            <Activity className="h-7 w-7 text-primary" />
            <div className="font-extrabold">No ranking checks yet</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Connect the extension and run a keyword manually.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
