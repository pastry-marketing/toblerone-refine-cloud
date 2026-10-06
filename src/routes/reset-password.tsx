import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/tb/kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Toblerone" },
      { name: "description", content: "Choose a new password for your Toblerone account." },
      { property: "og:title", content: "Set a new password — Toblerone" },
      { property: "og:description", content: "Choose a new password for your Toblerone account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <form
        className="w-full max-w-sm border border-border bg-card p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (pw.length < 8) { toast.error("Use at least 8 characters"); return; }
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) { toast.error(error.message); return; }
          toast.success("Password updated");
          navigate({ to: "/overview" });
        }}
      >
        <Logo className="mb-6 h-9 w-11" />
        <div className="eyebrow">Account</div>
        <h1 className="mt-1 mb-5 text-xl font-extrabold">Set a new password</h1>
        <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button className="mt-4 h-10 w-full" disabled={busy}>Update password</Button>
      </form>
    </div>
  );
}
