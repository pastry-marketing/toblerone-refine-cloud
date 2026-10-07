import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/config")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          supabaseUrl: process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"],
          supabaseKey:
            process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
          // Workspaces are private (row-level security), so an unauthenticated
          // request can never see one; the extension gets its workspace after pairing.
          workspaceId: null,
        }),
    },
  },
});
