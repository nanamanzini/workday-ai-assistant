import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, Mail, MessagesSquare, Search } from "lucide-react";
import { Disclaimer, PageHeader } from "@/components/tool-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Write emails, research topics and get workplace help with AI tools in one dashboard." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Email generator, research assistant and AI chatbot for professionals." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Turn quick instructions into polished emails in Formal, Friendly or Persuasive tone.", tag: "Writing" },
  { to: "/research", icon: Search, title: "AI Research Assistant", desc: "Summarise topics, pasted articles or web pages into insights and recommendations.", tag: "Analysis" },
  { to: "/chat", icon: MessagesSquare, title: "AI Chatbot", desc: "Ask anything about writing, planning, problem-solving and productivity.", tag: "Assistant" },
] as const;

function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon={<LayoutDashboard className="h-5 w-5" />}
        title="Good to see you"
        description="Pick a tool to get started. Your work stays in this browser tab only."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="card-surface group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <t.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{t.tag}</span>
            </div>
            <h2 className="text-base font-semibold text-foreground">{t.title}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
      <div className="card-surface grid gap-6 p-5 sm:grid-cols-3">
        {[
          ["Structured prompts", "Each tool sends clear, role-based instructions for consistent results."],
          ["Editable outputs", "Refine every result before copying it into your workflow."],
          ["Private by design", "No accounts, no database — closing the tab clears everything."],
        ].map(([h, p]) => (
          <div key={h}>
            <h3 className="text-sm font-semibold text-foreground">{h}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p}</p>
          </div>
        ))}
      </div>
      <Disclaimer />
    </div>
  );
}
