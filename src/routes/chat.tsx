import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, Eraser, MessagesSquare, Pencil, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, Disclaimer, ErrorNote, PageHeader, errorText } from "@/components/tool-ui";
import { chatReply } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace AI" },
      { name: "description", content: "An interactive AI assistant for writing, planning, research and productivity questions." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "Ask your AI workplace assistant anything about getting work done." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const starters = [
  "Help me plan my week with 3 major deadlines",
  "How do I give constructive feedback to a colleague?",
  "Outline a project kickoff agenda",
  "Tips to reduce meeting overload",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading]);

  async function send(text: string) {
    const t = text.trim();
    if (!t || loading) return;
    const next = [...messages, { role: "user" as const, content: t }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const r = await chatReply({ data: { messages: next } });
      if (r.error) setError(r.error);
      else setMessages([...next, { role: "assistant", content: r.text ?? "" }]);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<MessagesSquare className="h-5 w-5" />} title="AI Chatbot" description="Your workplace assistant for writing, planning, research and problem-solving." />
      <section className="card-surface flex h-[calc(100dvh-16rem)] min-h-[460px] flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-success" /> Workplace Assistant
          </div>
          <Button variant="ghost" size="sm" disabled={!messages.length || loading} onClick={() => { setMessages([]); setError(""); }}>
            <Eraser /> Clear chat
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary"><BrainCircuit className="h-6 w-6" /></div>
              <p className="text-sm font-medium">How can I help you work smarter today?</p>
              <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {starters.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-lg border border-border bg-card p-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><BrainCircuit className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="prose-ai text-sm text-foreground"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                  <div className="mt-2 flex gap-1.5">
                    <CopyButton text={m.content} />
                    <Button variant="ghost" size="sm" onClick={() => setInput(m.content)}><Pencil /> Edit in box</Button>
                  </div>
                </div>
              </div>
            ),
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary"><BrainCircuit className="h-4 w-4" /></div>
              <div className="flex items-center gap-1 pt-2">
                {[0, 150, 300].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          {error && <ErrorNote message={error} />}
          <div ref={endRef} />
        </div>

        <form className="flex items-end gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <textarea
            rows={1}
            className="field max-h-40 min-h-[44px] flex-1 resize-none"
            placeholder="Ask about writing, planning, research…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={loading || !input.trim()} aria-label="Send">
            <SendHorizontal />
          </Button>
        </form>
      </section>
      <Disclaimer />
    </div>
  );
}
