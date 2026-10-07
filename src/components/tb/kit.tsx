import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Minus } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { fmtShort, rankLocation, type KeywordStat, type Run } from "@/lib/data";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 58"
      role="img"
      aria-label="Toblerone"
      className={cn("object-contain text-primary", className)}
    >
      <path d="M3 52 23 20l7 9L43 6l16 22-8 7 13 17H39V35H32v17H3Z" fill="currentColor" />
      <path d="m43 31 14-14-5-5h17v17l-5-5-13 14-8-7Z" fill="currentColor" />
      <path d="M24 29h22v6H38v17h-7V35h-7v-6Z" fill="var(--background)" />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Logo className="h-9 w-11" />
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight">Toblerone</div>
        <div className="label-caps text-[10px]">Rank Tracker</div>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-[40px] md:leading-none">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Section({
  n,
  eyebrow,
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  n?: string;
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("border border-border bg-card", className)}>
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {action}
          {n && <span className="num text-2xl text-primary-soft">{n}</span>}
        </div>
      </header>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatStrip({
  items,
}: {
  items: { label: string; value: ReactNode; tone?: "red" | "dark" | undefined }[];
}) {
  return (
    <div className="grid grid-cols-2 border-l border-t border-border bg-card sm:grid-cols-3 xl:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="border-b border-r border-border px-5 py-4">
          <div className="label-caps">{it.label}</div>
          <div
            className={cn(
              "num mt-2 text-[40px] leading-none",
              it.tone === "red" && "text-primary",
              it.tone === "dark" && "text-destructive",
            )}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Rank({ value, className }: { value: number | null; className?: string }) {
  if (value == null) return <span className={cn("num text-muted-foreground", className)}>—</span>;
  return (
    <span className={cn("num", className)}>
      <span className="text-[0.7em] align-[0.15em]">#</span>
      {value}
    </span>
  );
}

export function PositionDetail({ value, className }: { value: number | null; className?: string }) {
  const location = rankLocation(value);
  return (
    <div className={className}>
      <Rank value={value} className="text-3xl" />
      <div className="mt-1 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {location?.label ?? "Not ranked"}
      </div>
    </div>
  );
}

export function ResultPreview({ run, compact = false }: { run?: Run; compact?: boolean }) {
  if (!run?.ranking_url) {
    return <span className="text-xs text-muted-foreground">No ranked page captured</span>;
  }
  return (
    <div className="min-w-0 max-w-xl">
      <a
        className="group inline-flex max-w-full items-center gap-1.5 font-bold text-[#1748b5] hover:underline"
        href={run.ranking_url}
        target="_blank"
        rel="noreferrer"
      >
        <span className="truncate">{run.result_title || run.ranking_url}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
      <div className="mt-1 truncate text-[11px] font-semibold text-success">
        {run.result_domain || run.ranking_url}
      </div>
      {!compact && run.result_snippet ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {run.result_snippet}
        </p>
      ) : null}
    </div>
  );
}

export function Change({ value, className }: { value: number | null; className?: string }) {
  if (value == null)
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  if (value === 0)
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-sm font-bold text-muted-foreground",
          className,
        )}
      >
        <Minus className="h-3.5 w-3.5" />0
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-extrabold tabular-nums",
        up ? "text-success" : "text-primary",
        className,
      )}
    >
      {up ? (
        <ArrowUp className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <ArrowDown className="h-3.5 w-3.5" strokeWidth={3} />
      )}
      {Math.abs(value)}
    </span>
  );
}

const statusMap: Record<KeywordStat["status"], { label: string; cls: string }> = {
  improved: { label: "Improved", cls: "border-success/40 text-success" },
  dropped: { label: "Dropped", cls: "border-primary/40 text-primary" },
  unchanged: { label: "No change", cls: "border-border text-muted-foreground" },
  not_found: {
    label: "Not found",
    cls: "border-destructive bg-destructive text-destructive-foreground",
  },
  new: { label: "First check", cls: "border-foreground text-foreground" },
  unchecked: { label: "Not checked", cls: "border-dashed border-border text-muted-foreground" },
};

export function StatusBadge({ status }: { status: KeywordStat["status"] }) {
  const s = statusMap[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center border px-2 text-[10px] font-bold uppercase tracking-wider",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

/** Five-segment bar like the extension: filled segments show how close to #1. */
export function PageBar({ position, pages }: { position: number | null; pages: number }) {
  const segs = Array.from({ length: Math.max(pages, 1) });
  const page = position == null ? null : Math.ceil(position / 10);
  return (
    <div className="flex gap-1">
      {segs.map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1",
            page == null
              ? "bg-border"
              : i + 1 === page
                ? "bg-primary"
                : i + 1 < page
                  ? "bg-primary-soft"
                  : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border border-dashed border-border bg-background/50 p-8">
      <div className="eyebrow">Nothing here yet</div>
      <div className="text-lg font-extrabold">{title}</div>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export const LINE_COLORS = [
  "var(--color-primary)",
  "var(--color-foreground)",
  "var(--color-muted-foreground)",
  "var(--color-destructive)",
  "var(--color-chart-5)",
];

export function PositionChart({
  rows,
  series,
  height = 300,
}: {
  rows: Record<string, number | string | null>[];
  series: { key: string; label: string }[];
  height?: number;
}) {
  if (!rows.length)
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No ranking checks in this period.
      </div>
    );
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(d) => fmtShort(d)}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            reversed
            domain={[1, "dataMax"]}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `#${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 0,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              boxShadow: "none",
            }}
            labelFormatter={(d) => fmtShort(d as string)}
            formatter={(v, name) => [
              v == null ? "Not found" : `#${v}`,
              series.find((s) => s.key === name)?.label ?? name,
            ]}
          />
          {series.map((s, i) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="linear"
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={i === 0 ? 2.25 : 1.5}
              dot={{ r: 2.5, strokeWidth: 0, fill: LINE_COLORS[i % LINE_COLORS.length] }}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Legend({ series }: { series: { key: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {series.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2 text-xs font-semibold">
          <span className="h-0.5 w-4" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
          {s.label}
        </div>
      ))}
    </div>
  );
}

export function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse bg-muted" />
      <div className="h-28 animate-pulse bg-muted" />
      <div className="h-80 animate-pulse bg-muted" />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="border border-destructive bg-card p-5">
      <div className="eyebrow text-destructive">Something went wrong</div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
