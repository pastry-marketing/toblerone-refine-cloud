import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Chrome, Copy, Link2, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorBox, Loading, PageHeader, Section } from "@/components/tb/kit";
import { fmtDateTime, useRefreshWorkspace, useWorkspaceData } from "@/lib/data";
import { getSupabasePublicConfig, supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/extension")({
  head: () => ({ meta: [{ title: "Extension — Toblerone Rank Tracker" }] }),
  component: ExtensionPage,
});

type ExtensionResponse = { ok?: boolean; error?: string; syncedRuns?: number; connected?: boolean };
type ChromeRuntime = {
  lastError?: { message?: string };
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback: (response: ExtensionResponse) => void,
  ) => void;
};

function getChromeRuntime() {
  return (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
}

function sendToExtension(extensionId: string, message: unknown) {
  return new Promise<ExtensionResponse>((resolve, reject) => {
    const runtime = getChromeRuntime();
    if (!runtime) return reject(new Error("Open this page in Chrome to connect the extension."));
    runtime.sendMessage(extensionId, message, (response) => {
      const error = runtime.lastError;
      if (error) return reject(new Error(error.message || "The extension did not respond."));
      if (!response?.ok)
        return reject(new Error(response?.error || "The extension did not accept the connection."));
      resolve(response);
    });
  });
}

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function ExtensionPage() {
  const query = useWorkspaceData();
  const refresh = useRefreshWorkspace();
  const [extensionId, setExtensionId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectedNow, setConnectedNow] = useState(false);

  useEffect(() => {
    const id =
      new URLSearchParams(window.location.search).get("extensionId") ??
      localStorage.getItem("tobleroneExtensionId") ??
      "";
    setExtensionId(id);
    if (id) localStorage.setItem("tobleroneExtensionId", id);
  }, []);

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;

  const workspace = query.data?.workspace;
  const activeDevices = (query.data?.devices ?? []).filter((device) => !device.revoked_at);

  async function connect() {
    if (!extensionId.trim())
      return void toast.error("Open this page from the Toblerone extension first.");
    if (!workspace) return void toast.error("The dashboard workspace is not ready yet.");
    setConnecting(true);
    try {
      const [{ data: sessionData, error: sessionError }, config] = await Promise.all([
        supabase.auth.getSession(),
        Promise.resolve(getSupabasePublicConfig()),
      ]);
      if (sessionError) throw sessionError;
      const session = sessionData.session;
      if (!session) throw new Error("The dashboard session is not ready. Refresh and try again.");

      const tokenHash = await sha256(`chrome:${session.user.id}:${extensionId.trim()}`);
      const { data: device, error: deviceError } = await supabase
        .from("extension_devices")
        .upsert(
          {
            workspace_id: workspace.id,
            user_id: session.user.id,
            name: "Toblerone Chrome extension",
            token_hash: tokenHash,
            revoked_at: null,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "token_hash" },
        )
        .select()
        .single();
      if (deviceError) throw deviceError;

      const response = await sendToExtension(extensionId.trim(), {
        type: "TOBLERONE_CONNECT",
        payload: {
          supabaseUrl: config.url,
          publishableKey: config.publishableKey,
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
          userId: session.user.id,
          workspaceId: workspace.id,
          deviceId: device.id,
          dashboardUrl: window.location.origin,
        },
      });

      localStorage.setItem("tobleroneExtensionId", extensionId.trim());
      setConnectedNow(true);
      await refresh();
      toast.success(
        `Extension connected${response.syncedRuns ? ` · ${response.syncedRuns} runs synced` : ""}`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not connect the extension.");
    } finally {
      setConnecting(false);
    }
  }

  async function revoke(id: string) {
    const { error } = await supabase
      .from("extension_devices")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return void toast.error(error.message);
    if (extensionId) {
      await sendToExtension(extensionId, { type: "TOBLERONE_DISCONNECT" }).catch(() => undefined);
    }
    await refresh();
    toast.success("Extension disconnected from this dashboard");
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Chrome bridge" title="Connect your extension" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
        <Section
          n="01"
          eyebrow="One-time setup"
          title="Pair this browser"
          bodyClassName="space-y-6"
        >
          <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
            {[
              ["01", "Open Toblerone", "Click Open dashboard inside the extension."],
              ["02", "Pair once", "The extension ID is filled automatically."],
              ["03", "Run checks", "Every completed run syncs to this dashboard."],
            ].map(([number, title, body]) => (
              <div key={number} className="bg-card p-4">
                <div className="num text-2xl text-primary">{number}</div>
                <div className="mt-3 font-extrabold">{title}</div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <label className="block">
            <span className="label-caps">Extension ID</span>
            <div className="mt-2 flex gap-2">
              <input
                className="h-11 min-w-0 flex-1 border border-border bg-background px-3 font-mono text-xs outline-none focus:border-primary"
                placeholder="Open this page from the extension"
                value={extensionId}
                onChange={(event) => setExtensionId(event.target.value.trim())}
              />
              <button
                aria-label="Copy extension ID"
                className="border border-border bg-card px-3 text-muted-foreground"
                onClick={() => navigator.clipboard.writeText(extensionId)}
                disabled={!extensionId}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </label>

          <button
            className="inline-flex h-11 items-center gap-2 bg-primary px-5 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
            onClick={connect}
            disabled={!extensionId || connecting}
          >
            {connecting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : connectedNow ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            {connecting
              ? "Connecting and syncing…"
              : connectedNow
                ? "Connected"
                : "Connect extension"}
          </button>
        </Section>

        <Section
          n="02"
          eyebrow="How it works"
          title="Private browser-to-cloud sync"
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
              <div className="font-extrabold">Your workspace stays isolated</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The extension receives only this dashboard’s private guest session and cannot access
                another workspace.
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
