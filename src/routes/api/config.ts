import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createAPIFileRoute("/api/config")({
  GET: async () => {
    const { data } = await supabase.from("workspaces").select("id").order("created_at").limit(1).maybeSingle();
    return json({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      workspaceId: data?.id,
    });
  },
});
