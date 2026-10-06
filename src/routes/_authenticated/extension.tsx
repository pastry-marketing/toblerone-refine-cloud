import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/tb/kit";

export const Route = createFileRoute("/_authenticated/extension")({
  head: () => ({ meta: [{ title: "Extension — Toblerone Rank Tracker" }, { name: "description", content: "Extension in your Toblerone rank tracking dashboard." }, { property: "og:title", content: "Extension — Toblerone" }, { property: "og:description", content: "Extension in your Toblerone rank tracking dashboard." }] }),
  component: () => (
    <div className="space-y-6">
      <PageHeader eyebrow="Toblerone" title="Extension" />
      <EmptyState title="This page is coming next" body="This section hasn't been built yet." />
    </div>
  ),
});
