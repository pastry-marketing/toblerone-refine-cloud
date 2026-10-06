import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/tb/kit";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Toblerone Rank Tracker" }, { name: "description", content: "Settings in your Toblerone rank tracking dashboard." }, { property: "og:title", content: "Settings — Toblerone" }, { property: "og:description", content: "Settings in your Toblerone rank tracking dashboard." }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader eyebrow="Toblerone" title="Settings" />
      <EmptyState title="This page is coming next" body="This section hasn't been built yet." />
    </div>
  ),
});
