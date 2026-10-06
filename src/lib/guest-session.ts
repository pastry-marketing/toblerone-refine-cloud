import { supabase } from "@/integrations/supabase/client";

/**
 * Opens the dashboard without asking the visitor to create an account.
 * Anonymous users still receive a session, so the existing RLS policies keep
 * each browser's workspace private.
 */
export async function ensureGuestSession() {
  if (import.meta.env["VITE_TOBLERONE_DEMO"] === "true") return { id: "demo-user" };
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session?.user) return sessionData.session.user;

  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { display_name: "Toblerone workspace" } },
  });

  if (error) {
    throw new Error(`The dashboard could not create its guest workspace: ${error.message}`);
  }
  if (!data.user) throw new Error("The dashboard could not create its guest workspace.");

  return data.user;
}
