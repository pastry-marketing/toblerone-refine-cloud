import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/tb/kit";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — Toblerone Rank Tracker" }, { name: "description", content: "Reports in your Toblerone rank tracking dashboard." }, { property: "og:title", content: "Reports — Toblerone" }, { property: "og:description", content: "Reports in your Toblerone rank tracking dashboard." }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader eyebrow="Toblerone" title="Reports" />
      <EmptyState title="This page is coming next" body="This section hasn't been built yet." />
    </div>
  ),
});
