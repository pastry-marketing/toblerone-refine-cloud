import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRefreshWorkspace, useWorkspaceData } from "@/lib/data";
import { Section, useConfirm } from "@/components/tb/kit";

export function normalizeDomain(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

const field =
  "h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary";

/** Manage the shared list of websites. */
export function SitesManager({ n }: { n?: string }) {
  const query = useWorkspaceData();
  const refresh = useRefreshWorkspace();
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const ws = query.data?.workspace;
  const sites = query.data?.websites ?? [];
  const keywords = query.data?.keywords ?? [];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const d = normalizeDomain(domain);
    if (!d) return void toast.error("Enter a valid website, for example example.com");
    if (!ws) return;
    if (sites.some((s) => s.domain === d)) return void toast.error(`${d} is already added`);
    setBusy(true);
    const { error } = await supabase.from("websites").insert({ workspace_id: ws.id, domain: d });
    setBusy(false);
    if (error) return void toast.error(error.message);
    setDomain("");
    await refresh();
    toast.success(`${d} added`);
  }

  async function remove(id: string, d: string) {
    const count = keywords.filter((k) => k.website_id === id).length;
    if (!window.confirm(count ? `Remove ${d} and its ${count} keyword(s) with all ranking history?` : `Remove ${d}?`)) return;
    const { error } = await supabase.from("websites").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    await refresh();
    toast.success(`${d} removed`);
  }

  return (
    <Section {...(n ? { n } : {})} eyebrow="Our sites" title="Websites" bodyClassName="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          className={field}
          placeholder="example.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          aria-label="Website domain"
        />
        <button disabled={busy} className="h-10 shrink-0 bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50">
          Add site
        </button>
      </form>
      {sites.length ? (
        <div className="divide-y divide-border border border-border">
          {sites.map((s) => (
            <div key={s.id} className="flex items-center justify-between bg-card px-4 py-3">
              <div>
                <div className="font-extrabold">{s.domain}</div>
                <div className="text-xs text-muted-foreground">
                  {keywords.filter((k) => k.website_id === s.id).length} keywords
                </div>
              </div>
              <button
                aria-label={`Remove ${s.domain}`}
                className="border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary"
                onClick={() => remove(s.id, s.domain)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No sites yet. Add your first website above.</p>
      )}
    </Section>
  );
}

/** Add a keyword, choosing the website from a dropdown. */
export function AddKeywordForm() {
  const query = useWorkspaceData();
  const refresh = useRefreshWorkspace();
  const sites = query.data?.websites ?? [];
  const ws = query.data?.workspace;
  const [keyword, setKeyword] = useState("");
  const [siteId, setSiteId] = useState("");
  const [pages, setPages] = useState(5);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const k = keyword.trim();
    if (!k) return void toast.error("Enter a keyword");
    if (!siteId) return void toast.error("Choose a website");
    if (!ws) return;
    setBusy(true);
    const { error } = await supabase
      .from("keywords")
      .insert({ workspace_id: ws.id, website_id: siteId, keyword: k, pages_to_check: pages });
    setBusy(false);
    if (error)
      return void toast.error(
        error.code === "23505" ? "That keyword is already tracked for this site" : error.message,
      );
    setKeyword("");
    await refresh();
    toast.success("Keyword added — run the check from the extension");
  }

  return (
    <Section n="01" eyebrow="New tracker" title="Add a keyword">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1.4fr_1fr_160px_auto] md:items-end">
        <label className="block">
          <span className="label-caps">Keyword</span>
          <input className={`${field} mt-1.5`} placeholder="best swiss chocolate" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </label>
        <label className="block">
          <span className="label-caps">Website</span>
          <select className={`${field} mt-1.5 font-semibold`} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
            <option value="">{sites.length ? "Choose a website" : "Add a site in Settings first"}</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.domain}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-caps">Pages to check</span>
          <select className={`${field} mt-1.5`} value={pages} onChange={(e) => setPages(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
              <option key={p} value={p}>{p} pages · top {p * 10}</option>
            ))}
          </select>
        </label>
        <button disabled={busy} className="h-10 bg-primary px-5 text-sm font-bold text-primary-foreground disabled:opacity-50">
          Add tracker
        </button>
      </form>
    </Section>
  );
}
