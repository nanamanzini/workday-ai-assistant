import { useState, type ReactNode } from "react";
import { AlertCircle, Check, Copy, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Disclaimer() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-warning p-3.5 text-xs leading-relaxed text-warning-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong className="font-semibold">Responsible AI:</strong> AI can make mistakes. Always verify facts,
        figures and recommendations before using them, and never share confidential, personal or client
        information.
      </p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export function CopyButton({ text, size = "sm" }: { text: string; size?: "sm" | "icon" }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size={size}
      disabled={!text}
      aria-label="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? <Check /> : <Copy />}
      {size === "sm" && (done ? "Copied" : "Copy")}
    </Button>
  );
}

export function LoadingLines({ label }: { label: string }) {
  return (
    <div className="space-y-3" aria-live="polite">
      <p className="text-sm text-muted-foreground">{label}</p>
      {[90, 75, 85, 60].map((w, i) => (
        <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export function errorText(e: unknown) {
  const m = (e as Error)?.message;
  return m && m.length < 200 ? m : "Something went wrong. Please check your connection and try again.";
}
