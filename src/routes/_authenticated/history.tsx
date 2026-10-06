import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/tb/kit";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Ranking History — Toblerone Rank Tracker" }, { name: "description", content: "Ranking History in your Toblerone rank tracking dashboard." }, { property: "og:title", content: "Ranking History — Toblerone" }, { property: "og:description", content: "Ranking History in your Toblerone rank tracking dashboard." }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader eyebrow="Toblerone" title="Ranking History" />
      <EmptyState title="This page is coming next" body="This section hasn't been built yet." />
    </div>
  ),
});
