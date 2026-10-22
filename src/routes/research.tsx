import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eraser, FileText, Globe, Lightbulb, Pencil, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, Disclaimer, ErrorNote, LoadingLines, PageHeader, errorText } from "@/components/tool-ui";
import { runResearch } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Summarise topics, articles and web pages into key insights and practical recommendations." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Turn topics, articles and URLs into insights and recommendations." },
    ],
  }),
  component: ResearchPage,
});

const modes = [
  { id: "topic", label: "Topic", icon: Lightbulb, ph: "e.g. Best practices for running effective hybrid team meetings" },
  { id: "article", label: "Article", icon: FileText, ph: "Paste the full article or document text here…" },
  { id: "url", label: "Website URL", icon: Globe, ph: "https://example.com/article" },
] as const;

type Mode = (typeof modes)[number]["id"];

function ResearchPage() {
  const [mode, setMode] = useState<Mode>("topic");
  const [content, setContent] = useState("");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const current = modes.find((m) => m.id === mode)!;

  async function submit() {
    if (!content.trim()) return setError(mode === "url" ? "Please enter a website URL." : "Please add a topic or some content to analyse.");
    setLoading(true);
    setError("");
    try {
      const r = await runResearch({ data: { mode, content } });
      if (r.error) setError(r.error);
      else { setOutput(r.text ?? ""); setEditing(false); }
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<Search className="h-5 w-5" />} title="AI Research Assistant" description="Get a summary, key insights and practical recommendations." />
      <section className="card-surface space-y-4 p-5">
        <div className="inline-flex w-full rounded-lg bg-muted p-1 sm:w-auto">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setError(""); }}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
                mode === m.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <m.icon className="h-4 w-4" /> {m.label}
            </button>
          ))}
        </div>
        {mode === "url" ? (
          <input className="field" type="url" placeholder={current.ph} value={content} onChange={(e) => setContent(e.target.value)} />
        ) : (
          <textarea className="field resize-y" rows={mode === "article" ? 9 : 3} placeholder={current.ph} value={content} onChange={(e) => setContent(e.target.value)} maxLength={30000} />
        )}
        {mode === "url" && (
          <p className="text-xs text-muted-foreground">Some sites block automated access or need a login. If that happens, you'll see why — then paste the text under "Article".</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="lg" onClick={submit} disabled={loading}><Search /> {loading ? "Analysing…" : "Analyse"}</Button>
          <Button size="lg" variant="outline" onClick={() => { setContent(""); setError(""); }}><Eraser /> Clear input</Button>
        </div>
        {error && <ErrorNote message={error} />}
      </section>

      <section className="card-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Research results</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!output} onClick={() => setEditing((v) => !v)}>
              {editing ? <><Eye /> Preview</> : <><Pencil /> Edit</>}
            </Button>
            <CopyButton text={output} />
            <Button variant="outline" size="sm" disabled={!output} onClick={() => setOutput("")}><Eraser /> Clear</Button>
          </div>
        </div>
        {loading ? (
          <LoadingLines label={mode === "url" ? "Reading the page and analysing…" : "Analysing…"} />
        ) : output ? (
          editing ? (
            <textarea className="field min-h-[420px] resize-y font-mono text-sm" value={output} onChange={(e) => setOutput(e.target.value)} />
          ) : (
            <div className="prose-ai text-sm text-foreground"><ReactMarkdown>{output}</ReactMarkdown></div>
          )
        ) : (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Summary, key insights and recommendations will appear here.
          </div>
        )}
      </section>
      <Disclaimer />
    </div>
  );
}
