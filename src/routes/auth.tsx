import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/tb/kit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Toblerone Rank Tracker" },
      { name: "description", content: "Sign in to your Toblerone SEO rank tracking dashboard." },
      { property: "og:title", content: "Sign in — Toblerone Rank Tracker" },
      { property: "og:description", content: "Sign in to your Toblerone SEO rank tracking dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/overview" });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/overview" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    if (mode === "forgot") {
      const r = z.string().email().safeParse(email.trim());
      if (!r.success) return setErr("Enter a valid email");
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) return setErr(error.message);
      return setInfo("Check your inbox for a password reset link.");
    }
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return setErr(parsed.error.issues[0].message);
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        ...parsed.data,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) return setErr(error.message);
      if (!data.session) setInfo("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setBusy(false);
      if (error) return setErr(error.message);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Google sign-in failed");
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between border-r border-border p-12 lg:flex">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-12" />
          <div className="leading-tight">
            <div className="font-extrabold">Toblerone</div>
            <div className="label-caps text-[10px]">Rank Tracker</div>
          </div>
        </div>
        <div>
          <div className="eyebrow">SEO rank tracker</div>
          <h1 className="mt-4 max-w-lg text-5xl font-extrabold leading-[1.02] tracking-tight">
            Every ranking check, kept in one place.
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Run checks from the Chrome extension. Toblerone stores each result with its original date, graphs the
            movement and turns it into reports your clients understand.
          </p>
        </div>
        <div className="grid grid-cols-3 border-l border-t border-border bg-card">
          {[
            ["01", "Check in Chrome"],
            ["02", "Sync to dashboard"],
            ["03", "Report to clients"],
          ].map(([n, t]) => (
            <div key={n} className="border-b border-r border-border p-4">
              <div className="num text-2xl text-primary">{n}</div>
              <div className="mt-1 text-sm font-bold">{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo className="h-9 w-11" />
            <div className="font-extrabold">Toblerone</div>
          </div>
          <div className="border border-border bg-card">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <div className="eyebrow">{mode === "signup" ? "New account" : mode === "forgot" ? "Reset" : "Welcome back"}</div>
                <h2 className="mt-1 text-xl font-extrabold">
                  {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Sign in"}
                </h2>
              </div>
              <span className="num text-2xl text-primary-soft">01</span>
            </div>
            <form onSubmit={submit} className="space-y-4 px-6 py-6">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="label-caps text-foreground">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pw" className="label-caps text-foreground">Password</Label>
                    {mode === "signin" && (
                      <button type="button" className="text-xs font-bold text-primary" onClick={() => setMode("forgot")}>
                        Forgot?
                      </button>
                    )}
                  </div>
                  <Input
                    id="pw"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}
              {err && <p className="text-sm font-semibold text-destructive">{err}</p>}
              {info && <p className="border border-border bg-background p-3 text-sm">{info}</p>}
              <Button type="submit" className="h-10 w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
              </Button>
              {mode !== "forgot" && (
                <Button type="button" variant="outline" className="h-10 w-full" onClick={google}>
                  Continue with Google
                </Button>
              )}
            </form>
            <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>No account? <button className="font-bold text-primary" onClick={() => setMode("signup")}>Create one</button></>
              ) : (
                <>Already registered? <button className="font-bold text-primary" onClick={() => setMode("signin")}>Sign in</button></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
