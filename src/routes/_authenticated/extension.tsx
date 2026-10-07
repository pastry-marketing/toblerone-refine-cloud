import { createFileRoute } from "@tanstack/react-router";
import { Chrome, Copy, Download, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { toast } from "sonner";
import { ErrorBox, Loading, PageHeader, Section } from "@/components/tb/kit";
import { supabase } from "@/integrations/supabase/client";
import { fmtDateTime, useRefreshWorkspace, useWorkspaceData } from "@/lib/data";
import { disconnectExtension, recallExtensionId } from "@/lib/extension-pairing";

export const Route = createFileRoute("/_authenticated/extension")({
  head: () => ({ meta: [{ title: "Extension — Toblerone Rank Tracker" }] }),
  component: ExtensionPage,
});

function ExtensionPage() {
  const dashboardUrl = typeof window !== "undefined" ? window.location.origin : "";
  const query = useWorkspaceData();
  const refresh = useRefreshWorkspace();

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;

  const activeDevices = (query.data?.devices ?? []).filter((device) => !device.revoked_at);

  async function revoke(id: string) {
    if (!window.confirm("Disconnect this extension? It will stop syncing until paired again.")) return;
    const { error } = await supabase
      .from("extension_devices")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    const pairedId = recallExtensionId();
    if (pairedId) await disconnectExtension(pairedId).catch(() => undefined);
    toast.success("Extension disconnected");
    await refresh();
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Chrome bridge" title="Connect your extension">
        <a
          className="inline-flex h-10 items-center gap-2 bg-foreground px-4 text-sm font-bold text-background"
          href="/downloads/Toblerone-extension.zip"
          download
        >
          <Download className="h-4 w-4" /> Download extension v2.6
        </a>
      </PageHeader>

      <div className="grid gap-4 border border-border bg-card p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="eyebrow">Public download</div>
          <h2 className="mt-2 text-2xl font-serif font-bold tracking-tight text-foreground">Install Toblerone in Chrome or Edge</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Download the ZIP, extract it, then load the folder from the browser's Extensions page
            with Developer mode enabled.
          </p>
        </div>
        <a
          className="inline-flex h-11 items-center justify-center gap-2 bg-primary px-5 text-sm font-extrabold text-primary-foreground"
          href="/downloads/Toblerone-extension.zip"
          download
        >
          <Download className="h-4 w-4" /> Download ZIP
        </a>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <Section
          n="01"
          eyebrow="One-time setup"
          title="Pair your extension"
          bodyClassName="space-y-6"
        >
          <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
            {[
              ["01", "Open Toblerone", "Open the extension's sidebar in Chrome or Edge."],
              ["02", "Paste URL", "Paste the Dashboard URL below into the extension's Connect form."],
              ["03", "Run checks", "Existing history syncs now; new runs sync after each check."],
            ].map(([number, title, body]) => (
              <div key={number} className="bg-card p-4">
                <div className="num text-2xl text-primary">{number}</div>
                <div className="mt-3 font-extrabold">{title}</div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <label className="block">
            <span className="label-caps">Dashboard URL</span>
            <div className="mt-2 flex gap-2">
              <input
                className="h-11 min-w-0 flex-1 border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary text-muted-foreground"
                value={dashboardUrl}
                readOnly
              />
              <button
                aria-label="Copy Dashboard URL"
                className="border border-border bg-card px-3 text-foreground hover:border-primary"
                onClick={() => {
                  navigator.clipboard.writeText(dashboardUrl);
                  toast.success("Dashboard URL copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Tip: selecting <span className="font-bold">Connect dashboard</span> inside the
              extension pairs this browser automatically — no copying required.
            </p>
          </label>
        </Section>

        <Section
          eyebrow="How it works"
          title="Direct Database Sync"
          bodyClassName="space-y-5"
        >
          <div className="flex gap-3">
            <Chrome className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="font-extrabold">Checks stay in Chrome</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The extension visits Google and calculates the position. The web app never scrapes
                Google.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="font-extrabold">One shared dashboard</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Everyone who opens this dashboard, and every connected extension, sees and adds to
                the same keywords and ranking history.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <RefreshCw className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <div className="font-extrabold">Sync after every manual check</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Existing local history syncs during pairing. New runs sync immediately after each
                manual check.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section n="03" eyebrow="Devices" title="Connected extensions" bodyClassName="p-0">
        {activeDevices.length ? (
          <div className="divide-y divide-border">
            {activeDevices.map((device) => (
              <div
                key={device.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 bg-success" />
                  <div>
                    <div className="font-extrabold">{device.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {device.last_sync_at
                        ? `Last sync ${fmtDateTime(device.last_sync_at)}`
                        : `Connected ${fmtDateTime(device.created_at)}`}
                    </div>
                  </div>
                </div>
                <button
                  className="inline-flex h-9 items-center gap-2 border border-border px-3 text-xs font-bold text-primary"
                  onClick={() => revoke(device.id)}
                >
                  <Unplug className="h-3.5 w-3.5" /> Disconnect
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            No extension is connected to this dashboard yet.
          </div>
        )}
      </Section>
    </div>
  );
}
