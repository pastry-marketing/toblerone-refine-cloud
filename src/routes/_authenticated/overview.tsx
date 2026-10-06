import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/tb/kit";

export const Route = createFileRoute("/_authenticated/overview")({
  head: () => ({ meta: [{ title: "Overview — Toblerone Rank Tracker" }, { name: "description", content: "Overview in your Toblerone rank tracking dashboard." }, { property: "og:title", content: "Overview — Toblerone" }, { property: "og:description", content: "Overview in your Toblerone rank tracking dashboard." }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader eyebrow="Toblerone" title="Overview" />
      <EmptyState title="This page is coming next" body="This section hasn't been built yet." />
    </div>
  ),
});
