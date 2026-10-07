import { createFileRoute } from "@tanstack/react-router";
import { Database, Globe2, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBox, Loading, PageHeader, Section } from "@/components/tb/kit";
import { downloadFile, toCsv, useWorkspaceData, useRefreshWorkspace } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Toblerone Rank Tracker" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const query = useWorkspaceData();
  const refresh = useRefreshWorkspace();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (query.isLoading) return <Loading />;
  if (query.error) return <ErrorBox message={query.error.message} />;
  const data = query.data;

  function exportBackup() {
    if (!data) return;
    const rows = [
      ["Checked at", "Keyword", "Domain", "Rank", "Change", "Pages", "URL"],
      ...data.runs.map((run) => [
        run.checked_at,
        data.keywords.find((item) => item.id === run.keyword_id)?.keyword,
        data.websites.find((item) => item.id === run.website_id)?.domain,
        run.position,
        run.position_change,
        run.pages_checked,
        run.ranking_url,
      ]),
    ];
    downloadFile(`toblerone-backup-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
    toast.success("Dashboard backup downloaded");
  }

  async function generateCode() {
    if (!data?.workspace) return;
    setLoading(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      const { data: session } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("connection_codes").insert({
        workspace_id: data.workspace.id,
        user_id: session.session!.user.id,
        code,
        expires_at: expiresAt.toISOString(),
      });
      if (error) throw error;
      setInviteCode(code);
      toast.success("Connection code generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setLoading(false);
    }
  }

  async function joinWorkspace() {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const { data: result, error } = await (supabase.rpc as any)("join_workspace", { invite_code: joinCode.trim() });
      if (error) throw error;
      if (!result) throw new Error("Invalid or expired code.");
      toast.success("Successfully joined the workspace!");
      setJoinCode("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Workspace" title="Dashboard settings" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Section n="01" eyebrow="Storage" title="Cloud data">
          <Database className="h-6 w-6 text-primary" />
          <div className="mt-5 grid grid-cols-2 gap-px border border-border bg-border">
            <div className="bg-card p-3">
              <div className="label-caps">Keywords</div>
              <div className="num mt-1 text-2xl">{data?.keywords.length ?? 0}</div>
            </div>
            <div className="bg-card p-3">
              <div className="label-caps">Runs</div>
              <div className="num mt-1 text-2xl">{data?.runs.length ?? 0}</div>
            </div>
          </div>
          <button
            className="mt-5 h-10 w-full border border-border text-sm font-bold hover:border-primary"
            onClick={exportBackup}
          >
            Download CSV backup
          </button>
        </Section>
        <Section n="02" eyebrow="Team" title="Share Workspace">
          <Users className="h-6 w-6 text-primary" />
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Generate a connection code to let a teammate join this workspace, or join someone else's workspace.
          </p>
          <div className="mt-4 space-y-4">
            {inviteCode ? (
              <div className="border border-border bg-background p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your Code</div>
                <div className="text-2xl font-extrabold tracking-widest">{inviteCode}</div>
              </div>
            ) : (
              <button
                className="h-10 w-full bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
                onClick={generateCode}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Code"}
              </button>
            )}
            <div className="border-t border-border pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="h-10 flex-1 border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <button
                  className="h-10 border border-border px-4 text-sm font-bold hover:border-primary disabled:opacity-50"
                  onClick={joinWorkspace}
                  disabled={loading || !joinCode.trim()}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </Section>
        <Section n="03" eyebrow="Search market" title="Current coverage">
          <Globe2 className="h-6 w-6 text-primary" />
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Google results are checked in English with personalization disabled where Google
            supports it. The extension records the configured market for future filtering.
          </p>
          <div className="mt-4 border border-border bg-background p-3 text-sm font-extrabold">
            Default market: United States
          </div>
        </Section>
      </div>
    </div>
  );
}
