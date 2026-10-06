import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toblerone — SEO Rank Tracker" },
      { name: "description", content: "Your Google ranking dashboard for the Toblerone Chrome extension." },
      { property: "og:title", content: "Toblerone — SEO Rank Tracker" },
      { property: "og:description", content: "Your Google ranking dashboard for the Toblerone Chrome extension." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/overview" });
  },
});
