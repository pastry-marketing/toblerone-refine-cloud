import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Check,
  Download,
  ExternalLink,
  FileSpreadsheet,
  SearchCheck,
} from "lucide-react";
import { Brand } from "@/components/tb/kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toblerone — Free Google Keyword Rank Tracker" },
      {
        name: "description",
        content:
          "Download the Toblerone Chrome extension and track exact Google positions, ranking pages, result titles, snippets, history and movement.",
      },
      { property: "og:title", content: "Toblerone — Google Keyword Rank Tracker" },
      {
        property: "og:description",
        content: "Track the exact Google result and landing page for every keyword.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: SearchCheck,
    title: "Exact ranked result",
    body: "See the result title, full landing-page URL, domain and Google snippet—not only a position number.",
  },
  {
    icon: BarChart3,
    title: "Position with page context",
    body: "Rank #37 is shown clearly as Page 4 · Result 7, with selectable depth up to the top 100.",
  },
  {
    icon: FileSpreadsheet,
    title: "History and client reports",
    body: "Keep dated checks, ranking movement, charts, CSV exports and printable PDF-ready reports.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-sidebar">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 md:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <Link
              to="/overview"
              className="hidden h-10 items-center border border-border bg-card px-4 text-sm font-bold sm:inline-flex"
            >
              Open dashboard
            </Link>
            <a
              className="inline-flex h-10 items-center gap-2 bg-primary px-4 text-sm font-bold text-primary-foreground"
              href="/downloads/Toblerone-extension.zip"
              download
            >
              <Download className="h-4 w-4" /> Download ZIP
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="eyebrow">Chrome SEO position tracker</div>
              <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[.96] tracking-[-.055em] md:text-7xl">
                Know the exact page that ranks.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Track Google keyword positions manually, keep every dated run, and see the real
                landing page, search-result title and snippet that earned the ranking.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="inline-flex h-12 items-center gap-2 bg-primary px-6 text-sm font-extrabold text-primary-foreground"
                  href="/downloads/Toblerone-extension.zip"
                  download
                >
                  <Download className="h-4 w-4" /> Download extension v2.5
                </a>
                <Link
                  to="/overview"
                  className="inline-flex h-12 items-center gap-2 border border-foreground px-6 text-sm font-extrabold"
                >
                  View dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
                {["Chrome and Edge", "Manual checks only", "Top 10–100", "CSV and PDF reports"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-success" /> {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="border border-border bg-card p-5 shadow-[14px_14px_0_var(--color-primary-soft)] md:p-7">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <div className="eyebrow">Live ranking example</div>
                  <div className="mt-1 font-extrabold">best team workspace</div>
                </div>
                <div className="text-right">
                  <div className="num text-4xl">#37</div>
                  <div className="label-caps mt-1 text-primary">Page 4 · Result 7</div>
                </div>
              </div>
              <div className="mt-6 border-l-4 border-primary bg-background p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-success">
                  notion.so <ExternalLink className="h-3.5 w-3.5" />
                </div>
                <div className="mt-3 text-xl font-extrabold text-[#1748b5]">
                  Notion AI — Your connected workspace for work
                </div>
                <div className="mt-2 break-all text-xs text-success">
                  https://www.notion.so/product/ai
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Write, plan, organize, and turn ideas into action with one connected AI workspace.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-px bg-border text-center">
                <div className="bg-card p-3">
                  <div className="label-caps">Previous</div>
                  <div className="num mt-1 text-xl">#41</div>
                </div>
                <div className="bg-card p-3">
                  <div className="label-caps">Movement</div>
                  <div className="mt-1 text-sm font-extrabold text-success">↑ 4</div>
                </div>
                <div className="bg-card p-3">
                  <div className="label-caps">Depth</div>
                  <div className="num mt-1 text-xl">Top 50</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-16 md:px-8 md:py-20">
          <div className="max-w-2xl">
            <div className="eyebrow">Commercial-grade essentials</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
              The useful detail, without enterprise-tool clutter.
            </h2>
          </div>
          <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className="bg-card p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <span className="num text-2xl text-primary-soft">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-extrabold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="download" className="border-y border-border bg-sidebar">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <div className="eyebrow">Install in three steps</div>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
                Download. Extract. Track.
              </h2>
              <a
                className="mt-7 inline-flex h-12 items-center gap-2 bg-primary px-6 text-sm font-extrabold text-primary-foreground"
                href="/downloads/Toblerone-extension.zip"
                download
              >
                <Download className="h-4 w-4" /> Download Toblerone extension
              </a>
            </div>
            <ol className="grid gap-px border border-border bg-border sm:grid-cols-3">
              {[
                [
                  "01",
                  "Extract the ZIP",
                  "Save the downloaded file and extract the Toblerone folder.",
                ],
                [
                  "02",
                  "Load the extension",
                  "Open chrome://extensions, enable Developer mode, and choose Load unpacked.",
                ],
                [
                  "03",
                  "Connect dashboard",
                  "Open Toblerone, select Connect dashboard once, then run a manual check.",
                ],
              ].map(([number, title, body]) => (
                <li key={number} className="bg-card p-5">
                  <div className="num text-2xl text-primary">{number}</div>
                  <div className="mt-5 font-extrabold">{title}</div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <Brand />
        <span>Manual Google rank checks · exact ranked-page details · no scheduled cycles</span>
      </footer>
    </div>
  );
}
