import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Website = Tables<"websites">;
export type Keyword = Tables<"keywords">;
export type Run = Tables<"ranking_runs">;
export type Device = Tables<"extension_devices">;

export type KeywordStat = Keyword & {
  website: Website | undefined;
  runs: Run[]; // ascending by checked_at
  latest: Run | undefined;
  previous: Run | undefined;
  current: number | null;
  prev: number | null;
  change: number | null; // positive = improved
  best: number | null;
  status: "improved" | "dropped" | "unchanged" | "not_found" | "new" | "unchecked";
};

export async function fetchWorkspaceData() {
  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (wsErr) throw wsErr;
  if (!ws) return null;
  const [sites, kws, runs, devices] = await Promise.all([
    supabase.from("websites").select("*").eq("workspace_id", ws.id).order("domain"),
    supabase.from("keywords").select("*").eq("workspace_id", ws.id).order("created_at"),
    supabase.from("ranking_runs").select("*").eq("workspace_id", ws.id).order("checked_at").limit(5000),
    supabase.from("extension_devices").select("*").eq("workspace_id", ws.id).order("created_at", { ascending: false }),
  ]);
  for (const r of [sites, kws, runs, devices]) if (r.error) throw r.error;
  return {
    workspace: ws,
    websites: sites.data ?? [],
    keywords: kws.data ?? [],
    runs: runs.data ?? [],
    devices: devices.data ?? [],
  };
}

export const workspaceQueryKey = ["workspace-data"];

export function useWorkspaceData() {
  return useQuery({ queryKey: workspaceQueryKey, queryFn: fetchWorkspaceData });
}

export function useRefreshWorkspace() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: workspaceQueryKey });
}

export function buildKeywordStats(
  keywords: Keyword[],
  websites: Website[],
  runs: Run[],
  range?: { from: Date; to: Date },
): KeywordStat[] {
  return keywords.map((k) => {
    let kr = runs.filter((r) => r.keyword_id === k.id);
    if (range) kr = kr.filter((r) => new Date(r.checked_at) >= range.from && new Date(r.checked_at) <= range.to);
    const latest = kr[kr.length - 1];
    const previous = kr[kr.length - 2];
    const current = latest?.found ? latest.position : null;
    const prev = previous ? (previous.found ? previous.position : null) : null;
    const change = current != null && prev != null ? prev - current : null;
    const found = kr.filter((r) => r.found && r.position != null).map((r) => r.position as number);
    const best = found.length ? Math.min(...found) : null;
    let status: KeywordStat["status"] = "unchecked";
    if (latest) {
      if (!latest.found) status = "not_found";
      else if (!previous) status = "new";
      else if (prev == null) status = "improved";
      else if (change! > 0) status = "improved";
      else if (change! < 0) status = "dropped";
      else status = "unchanged";
    }
    return {
      ...k,
      website: websites.find((w) => w.id === k.website_id),
      runs: kr,
      latest,
      previous,
      current,
      prev,
      change,
      best,
      status,
    };
  });
}

export const RANGES = [
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "90", label: "Last 90 days", days: 90 },
  { value: "180", label: "Last 6 months", days: 180 },
  { value: "all", label: "All time", days: 3650 },
] as const;

export function rangeFor(value: string) {
  const r = RANGES.find((x) => x.value === value) ?? RANGES[1];
  const to = new Date();
  const from = new Date(to.getTime() - r.days * 86400000);
  return { from, to };
}

export function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function fmtShort(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

/** Chart series: one row per date (day), one column per keyword id. */
export function chartRows(stats: KeywordStat[]) {
  const map = new Map<string, Record<string, number | string | null>>();
  for (const s of stats)
    for (const r of s.runs) {
      const day = r.checked_at.slice(0, 10);
      const row = map.get(day) ?? { day };
      row[s.id] = r.found ? r.position : null;
      map.set(day, row);
    }
  return [...map.values()].sort((a, b) => String(a.day).localeCompare(String(b.day)));
}

export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((r) => r.map((c) => (c == null ? "" : `"${String(c).replace(/"/g, '""')}"`)).join(","))
    .join("\n");
}

export function downloadFile(name: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
