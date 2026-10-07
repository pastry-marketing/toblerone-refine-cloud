import { getSupabasePublicConfig, supabase } from "@/integrations/supabase/client";

/**
 * Pairs the Toblerone Chrome extension with this dashboard.
 *
 * The extension keeps its "visit Google and compute the rank" logic in the
 * browser and syncs every completed run straight into the shared Supabase
 * workspace. To write to that workspace it needs a real authenticated session,
 * so the dashboard hands the extension its current (anonymous) Supabase session
 * tokens plus the workspace and device it should write against. The extension's
 * background service worker stores them and replays the local history.
 */

export type ExtensionResponse = {
  ok?: boolean;
  error?: string;
  syncedRuns?: number;
  connected?: boolean;
};

type ChromeRuntime = {
  lastError?: { message?: string };
  sendMessage: (
    extensionId: string,
    message: unknown,
    callback: (response: ExtensionResponse) => void,
  ) => void;
};

export function getChromeRuntime(): ChromeRuntime | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
}

/** True when this page is being viewed in a browser that exposes the extension. */
export function canReachExtension(): boolean {
  return typeof getChromeRuntime()?.sendMessage === "function";
}

export function sendToExtension(extensionId: string, message: unknown) {
  return new Promise<ExtensionResponse>((resolve, reject) => {
    const runtime = getChromeRuntime();
    if (!runtime?.sendMessage) {
      return reject(
        new Error("Open this page in Chrome or Edge with the Toblerone extension installed."),
      );
    }
    try {
      runtime.sendMessage(extensionId, message, (response) => {
        const error = runtime.lastError;
        if (error) return reject(new Error(error.message || "The extension did not respond."));
        if (!response?.ok) {
          return reject(
            new Error(response?.error || "The extension did not accept the connection."),
          );
        }
        resolve(response);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Could not reach the extension."));
    }
  });
}

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * The Supabase origin the extension should talk to.
 *
 * The database is managed by Lovable Cloud and fronted by its `*.lovable.cloud`
 * gateway, so we hand the extension the same URL the dashboard uses rather than
 * a raw `*.supabase.co` endpoint (which the managed project may not expose).
 * The extension's manifest grants host permission for that gateway.
 */
export function extensionSupabaseUrl(): string {
  return getSupabasePublicConfig().url;
}

/**
 * Registers a device row for this browser/extension pair and sends the current
 * dashboard session to the extension so future runs sync. Returns the
 * extension's response (including how many existing runs it replayed).
 */
export async function pairExtension(
  extensionId: string,
  workspaceId: string,
): Promise<ExtensionResponse> {
  const trimmedId = extensionId.trim();
  if (!trimmedId) throw new Error("Open this page from the Toblerone extension first.");

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const session = sessionData.session;
  if (!session) throw new Error("The dashboard session is not ready. Refresh and try again.");

  const { publishableKey } = getSupabasePublicConfig();

  const tokenHash = await sha256(`chrome:${session.user.id}:${trimmedId}`);
  const { data: device, error: deviceError } = await supabase
    .from("extension_devices")
    .upsert(
      {
        workspace_id: workspaceId,
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

  return sendToExtension(trimmedId, {
    type: "TOBLERONE_CONNECT",
    payload: {
      supabaseUrl: extensionSupabaseUrl(),
      publishableKey,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      userId: session.user.id,
      workspaceId,
      deviceId: device.id,
      dashboardUrl: window.location.origin,
    },
  });
}

export function disconnectExtension(extensionId: string) {
  return sendToExtension(extensionId, { type: "TOBLERONE_DISCONNECT" });
}

/** Reads the extension id the extension appended when it opened the dashboard. */
export function readExtensionIdFromUrl(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("extensionId")?.trim() ?? "";
}

const STORED_EXTENSION_ID_KEY = "tobleroneExtensionId";

export function rememberExtensionId(id: string) {
  try {
    if (id) localStorage.setItem(STORED_EXTENSION_ID_KEY, id);
  } catch {
    // Ignore storage access errors (private mode, blocked cookies, etc.).
  }
}

export function recallExtensionId(): string {
  try {
    return localStorage.getItem(STORED_EXTENSION_ID_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}
