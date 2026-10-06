import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/tb/kit";

export const Route = createFileRoute("/_authenticated/keywords")({
  head: () => ({ meta: [{ title: "Keywords — Toblerone Rank Tracker" }, { name: "description", content: "Keywords in your Toblerone rank tracking dashboard." }, { property: "og:title", content: "Keywords — Toblerone" }, { property: "og:description", content: "Keywords in your Toblerone rank tracking dashboard." }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader eyebrow="Toblerone" title="Keywords" />
      <EmptyState title="This page is coming next" body="This section hasn't been built yet." />
    </div>
  ),
});
