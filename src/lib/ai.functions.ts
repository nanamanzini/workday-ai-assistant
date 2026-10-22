import { createServerFn } from "@tanstack/react-start";

const MODEL = "openai/gpt-6-astra" as const;

type Msg = { role: "user" | "assistant"; content: string };

function extractText(res: unknown): string {
  const out = (res as { output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }> }).output ?? [];
  return out
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("")
    .trim();
}

async function callAI(instructions: string, input: Msg[]): Promise<{ text?: string; error?: string; urlFailed?: boolean }> {
  if (!process.env["LOVABLE_API_KEY"]) {
    return { error: "No AI service is configured for this app yet. The interface is ready — connect an AI service to enable responses." };
  }
  try {
    const { generateResponse } = await import("@lovable.dev/ai-gateway");
    const res = await generateResponse({
      model: MODEL,
      instructions,
      input: input.map((m) => ({ role: m.role, content: m.content })),
    });
    const text = extractText(res);
    if (!text) return { error: "The AI returned an empty response. Please try rephrasing your request." };
    return { text };
  } catch (e) {
    const name = (e as { name?: string })?.name ?? "";
    console.error("AI call failed", e);
    if (name === "RateLimitError") return { error: "Too many requests right now. Please wait a moment and try again." };
    if (name === "PaymentRequiredError") return { error: "AI usage credits have run out for this workspace. Please top up to continue." };
    return { error: "The AI service could not complete this request. Please try again shortly." };
  }
}

const SAFETY = "Never invent facts, statistics, or sources. If unsure, say so. Keep output professional and workplace-appropriate.";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: { instructions: string; tone: string; recipient?: string; sender?: string }) => {
    if (!d.instructions?.trim()) throw new Error("Instructions are required");
    if (d.instructions.length > 4000) throw new Error("Instructions are too long");
    return d;
  })
  .handler(async ({ data }) => {
    const sys = `You are an expert business email writer. Write one complete professional email.
Tone: ${data.tone}.
- Formal: polished, respectful, concise, no slang.
- Friendly: warm, approachable, still professional.
- Persuasive: clear value, confident, a strong call to action.
Format exactly:
Subject: <subject line>

<greeting>,

<body in short paragraphs>

<sign-off>,
<sender name>
Output plain text only, no markdown, no commentary. Use [placeholders] for unknown specifics. ${SAFETY}`;
    const user = `Instructions: ${data.instructions}
Recipient: ${data.recipient || "not specified"}
Sender: ${data.sender || "not specified"}`;
    return callAI(sys, [{ role: "user", content: user }]);
  });

async function fetchUrlText(url: string): Promise<{ text?: string; reason?: string }> {
  let u: URL;
  try {
    u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return { reason: "Only http and https links are supported." };
  } catch {
    return { reason: "That doesn't look like a valid web address." };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(u.toString(), {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WorkplaceAssistant/1.0)", Accept: "text/html,text/plain" },
    });
    clearTimeout(t);
    if (!r.ok) return { reason: `The website responded with status ${r.status}${r.status === 403 ? " (access blocked)" : r.status === 404 ? " (page not found)" : ""}.` };
    const ct = r.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) return { reason: `The link points to unsupported content (${ct || "unknown type"}).` };
    const html = await r.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length < 200) return { reason: "The page loaded but had almost no readable text (it may require JavaScript, a login, or a paywall)." };
    return { text: text.slice(0, 20000) };
  } catch (e) {
    return { reason: (e as Error)?.name === "AbortError" ? "The website took too long to respond." : "The website could not be reached (it may block automated access or be offline)." };
  }
}

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: { mode: "topic" | "article" | "url"; content: string }) => {
    if (!d.content?.trim()) throw new Error("Content is required");
    if (d.content.length > 30000) throw new Error("Content is too long (max 30,000 characters)");
    return d;
  })
  .handler(async ({ data }) => {
    let material = data.content.trim();
    let sourceNote = "";
    if (data.mode === "url") {
      const f = await fetchUrlText(material);
      if (!f.text) {
        const r: { text?: string; error?: string; urlFailed?: boolean } = { error: `This URL could not be accessed: ${f.reason} Try copying the article text and pasting it under "Article" instead.`, urlFailed: true };
        return r;
      }
      sourceNote = `Source URL: ${material}\n\n`;
      material = f.text;
    }
    const sys = `You are a rigorous workplace research analyst. Respond in Markdown with exactly these sections:
## Summary
(3–5 sentence overview)
## Key Insights
(5–7 bullet points)
## Practical Recommendations
(4–6 actionable bullets for a professional audience)
## Limitations
(brief note on what to verify or what the source does not cover)
${data.mode === "topic" ? "This is a topic from general knowledge — you have no live web access, so note that facts may be outdated and should be verified." : "Base your analysis only on the provided content."} ${SAFETY}`;
    const label = data.mode === "topic" ? "Topic" : "Content";
    return callAI(sys, [{ role: "user", content: `${sourceNote}${label}:\n${material}` }]);
  });

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: Msg[] }) => {
    if (!Array.isArray(d.messages) || d.messages.length === 0) throw new Error("Messages are required");
    const msgs = d.messages.slice(-30).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 8000) })) as Msg[];
    return { messages: msgs };
  })
  .handler(async ({ data }) => {
    const sys = `You are a helpful AI workplace productivity assistant. Help with writing, planning, research, problem-solving, and productivity. Be concise, structured, and practical; use Markdown headings, lists, and short paragraphs where helpful. Ask a clarifying question when a request is ambiguous. Remind users not to share confidential data if they appear to. ${SAFETY}`;
    return callAI(sys, data.messages);
  });
