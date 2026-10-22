import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Eraser, Mail, Smile, Sparkle, Target, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton, Disclaimer, ErrorNote, LoadingLines, PageHeader, errorText } from "@/components/tool-ui";
import { generateEmail } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Generate personalised professional emails in Formal, Friendly or Persuasive tone." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "AI-written professional emails you can edit and copy." },
    ],
  }),
  component: EmailPage,
});

const tones = [
  { id: "Formal", icon: Briefcase, hint: "Polished & respectful" },
  { id: "Friendly", icon: Smile, hint: "Warm & approachable" },
  { id: "Persuasive", icon: Target, hint: "Confident & action-driven" },
] as const;

function EmailPage() {
  const [instructions, setInstructions] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");
  const [tone, setTone] = useState<string>("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!instructions.trim()) return setError("Please describe what the email should say.");
    setLoading(true);
    setError("");
    try {
      const r = await generateEmail({ data: { instructions, tone, recipient, sender } });
      if (r.error) setError(r.error);
      else setOutput(r.text ?? "");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={<Mail className="h-5 w-5" />} title="Smart Email Generator" description="Describe the email you need and choose a tone." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-5 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="ins">What should the email say?</label>
            <textarea
              id="ins"
              rows={6}
              className="field resize-y"
              placeholder="e.g. Ask the client to move Thursday's review meeting to next week and propose two time slots."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={4000}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="rec">Recipient <span className="text-muted-foreground">(optional)</span></label>
              <input id="rec" className="field" placeholder="e.g. Sarah, Head of Ops" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="snd">Your name <span className="text-muted-foreground">(optional)</span></label>
              <input id="snd" className="field" placeholder="e.g. Thabo" value={sender} onChange={(e) => setSender(e.target.value)} />
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium">Tone</span>
            <div className="grid grid-cols-3 gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  aria-pressed={tone === t.id}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
                    tone === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{t.id}</span>
                  <span className={cn("hidden text-[11px] sm:block", tone === t.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{t.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={loading} className="flex-1" size="lg">
              <Wand2 /> {loading ? "Writing…" : "Generate email"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-4"
              onClick={() => { setInstructions(""); setRecipient(""); setSender(""); setError(""); }}
            >
              <Eraser /> Clear
            </Button>
          </div>
          {error && <ErrorNote message={error} />}
        </section>

        <section className="card-surface flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Your email <span className="font-normal text-muted-foreground">· editable</span></h2>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <Button variant="outline" size="sm" disabled={!output} onClick={() => setOutput("")}><Eraser /> Clear</Button>
            </div>
          </div>
          {loading ? (
            <LoadingLines label={`Drafting a ${tone.toLowerCase()} email…`} />
          ) : output ? (
            <textarea className="field min-h-[380px] flex-1 resize-y font-sans leading-relaxed" value={output} onChange={(e) => setOutput(e.target.value)} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <Sparkle className="mb-2 h-5 w-5" />
              Your generated email will appear here.
            </div>
          )}
        </section>
      </div>
      <Disclaimer />
    </div>
  );
}
