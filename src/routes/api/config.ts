import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization",
};

export const Route = createFileRoute("/api/config")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const url = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        let workspaceId: string | null = null;
        try {
          const client = createClient<Database>(url, key, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
                h.set("apikey", key);
                return fetch(input, { ...init, headers: h });
              },
            },
          });
          const { data } = await client.rpc("global_workspace_id");
          workspaceId = (data as string | null) ?? null;
        } catch (e) {
          console.error(e);
        }
        // The extension's service worker only holds host permission for the
        // project's canonical *.supabase.co endpoint, so hand it that URL
        // rather than the dashboard's internal proxy. Tokens and the
        // publishable key are project-scoped, so they are valid on both.
        const projectId =
          process.env["SUPABASE_PROJECT_ID"] ?? import.meta.env["VITE_SUPABASE_PROJECT_ID"];
        const publicUrl = projectId ? `https://${projectId}.supabase.co` : url;
        return Response.json(
          { supabaseUrl: publicUrl, supabaseKey: key, workspaceId },
          { headers: cors },
        );
      },
    },
  },
});
