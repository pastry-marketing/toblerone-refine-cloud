import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, FileText, History, LayoutGrid, Menu, Plug, Settings, Tag } from "lucide-react";
import { Brand } from "@/components/tb/kit";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useWorkspaceData } from "@/lib/data";
import { ensureGuestSession } from "@/lib/guest-session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ensureGuestSession,
  component: AppShell,
});

const NAV = [
  { to: "/overview", label: "Overview", icon: LayoutGrid, n: "01" },
  { to: "/keywords", label: "Keywords", icon: Tag, n: "02" },
  { to: "/history", label: "Ranking History", icon: History, n: "03" },
  { to: "/reports", label: "Reports", icon: FileText, n: "04" },
  { to: "/extension", label: "Extension", icon: Plug, n: "05" },
  { to: "/settings", label: "Settings", icon: Settings, n: "06" },
] as const;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { data } = useWorkspaceData();
  const connected = (data?.devices ?? []).some((d) => !d.revoked_at);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Brand />
      </div>
      <nav className="flex-1 px-3 py-4">
        <div className="label-caps px-2 pb-2">Menu</div>
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="group flex items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "!border-primary bg-card !text-foreground" }}
          >
            <span className="num w-5 text-xs text-muted-foreground group-hover:text-primary">{item.n}</span>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mx-5 mb-4 border border-sidebar-border bg-card px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className={connected ? "h-2 w-2 bg-success" : "h-2 w-2 bg-muted-foreground"} />
          {connected ? "Extension connected" : "Extension not connected"}
        </div>
      </div>
      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="text-sm font-bold">Toblerone workspace</div>
        <div className="label-caps text-[10px]">Ready to track</div>
      </div>
    </div>
  );
}

function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarBody />
      </aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
          <Brand />
          <button aria-label="Open menu" className="border border-border bg-card p-2" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </button>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { BarChart3 };
