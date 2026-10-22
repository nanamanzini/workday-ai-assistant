import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BrainCircuit, LayoutDashboard, Mail, Menu, MessagesSquare, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chatbot", icon: MessagesSquare },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((n) => {
        const active = path === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <BrainCircuit className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-sm font-semibold text-sidebar-accent-foreground">Workplace AI</div>
        <div className="text-[11px] text-sidebar-foreground/70">Productivity Assistant</div>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <p className="rounded-lg border border-sidebar-border p-3 text-[11px] leading-relaxed text-sidebar-foreground/70">
      Session-only: nothing is saved. Refreshing clears your work.
    </p>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col justify-between bg-sidebar p-4 lg:flex">
        <div className="space-y-8">
          <Brand />
          <NavList />
        </div>
        <SidebarFooter />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
        <Brand />
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-sidebar-accent-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-sidebar p-4">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-2 text-sidebar-accent-foreground hover:bg-sidebar-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
