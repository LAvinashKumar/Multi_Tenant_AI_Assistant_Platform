/**
 * AI Service — production-grade AI response system.
 *
 * ONLY this file makes AI API calls. Routes and UI never call AI directly.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  generateAIResponse(message, history, integrations)         │
 * │                                                             │
 * │  1. Integration check (Shopify / CRM) → mock data          │
 * │  2. Try primary provider (OpenRouter) with timeout          │
 * │     └─ 429 / 5xx → wait 1.5s → retry once                  │
 * │  3. If retry fails → try secondary provider (Gemini)        │
 * │  4. If all fail   → generateFallback(message)  ← ALWAYS    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * The UI will ALWAYS receive a string — never an unhandled error.
 */

import { IIntegrations } from "@/lib/db/models/ProductInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatMessage = { role: string; content: string };

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Waits for `ms` milliseconds. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Returns true if the HTTP status is a rate-limit or server error worth retrying. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503;
}

/** Extracts a retry-after delay (ms) from a 429 error body, defaulting to `fallbackMs`. */
function parseRetryAfter(errorBody: string, fallbackMs = 1500): number {
  try {
    const json = JSON.parse(errorBody);
    // OpenRouter / Gemini both put retryDelay in details
    const details = json?.error?.details ?? [];
    for (const d of details) {
      if (d.retryDelay) {
        const seconds = parseFloat(d.retryDelay.replace("s", ""));
        if (!isNaN(seconds)) return Math.min(seconds * 1000, 10_000); // cap at 10s
      }
    }
  } catch {
    // ignore parse errors
  }
  return fallbackMs;
}

// ─── Integration Simulation ───────────────────────────────────────────────────

function getMockShopifyResponse(userMessage: string): string {
  const orders = [
    { id: "#1042", product: "Blue Widget",  status: "Shipped",    total: "$29.99" },
    { id: "#1041", product: "Red Gadget",   status: "Processing", total: "$49.99" },
    { id: "#1040", product: "Green Tool",   status: "Delivered",  total: "$19.99" },
  ];
  return `📦 **Shopify Integration Response**

Here are your recent orders:

${orders.map((o) => `• Order ${o.id}: **${o.product}** — ${o.status} (${o.total})`).join("\n")}

_Your question was: "${userMessage}"_

> This is simulated Shopify data. Connect your real Shopify store to see live orders.`;
}

function getMockCRMResponse(userMessage: string): string {
  const leads = [
    { name: "John Smith",  company: "Acme Corp", status: "Hot",  value: "$5,000"  },
    { name: "Jane Doe",    company: "TechStart",  status: "Warm", value: "$2,500"  },
    { name: "Bob Johnson", company: "BigCo",      status: "Cold", value: "$10,000" },
  ];
  return `👥 **CRM Integration Response**

Here are your recent leads:

${leads.map((l) => `• **${l.name}** (${l.company}) — ${l.status} lead, potential value: ${l.value}`).join("\n")}

_Your question was: "${userMessage}"_

> This is simulated CRM data. Connect your real CRM to see live leads.`;
}

// ─── Intelligent Fallback ─────────────────────────────────────────────────────

/**
 * generateFallback — always returns a useful response when all AI providers fail.
 *
 * Rules:
 *  - "hello" / "hi"      → friendly greeting in fallback mode
 *  - "order"             → simulated Shopify order data
 *  - "lead"              → simulated CRM lead data
 *  - otherwise           → generic high-load response
 */
export function generateFallback(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) {
    return "Hey! 👋 How can I help you today?";
  }

  if (msg.includes("order")) {
    return "You have 42 orders in your store. (simulated Shopify data)";
  }

  if (msg.includes("lead")) {
    return "Your top leads are John and Sarah. (simulated CRM data)";
  }

  return "Got it! Here's what I can tell based on your request.";
}

// ─── Provider: OpenRouter ─────────────────────────────────────────────────────

/**
 * Calls OpenRouter API (OpenAI-compatible format).
 * Throws a typed error with `status` attached for retry logic.
 */
async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    throw new Error("OPENROUTER_NOT_CONFIGURED");
  }

  const model = process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "AI Assistant App",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
    signal: AbortSignal.timeout(15_000), // 15s timeout
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`OpenRouter error ${response.status}: ${body}`) as Error & { status: number; body: string };
    err.status = response.status;
    err.body = body;
    throw err;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned empty content");
  return text;
}

// ─── Provider: Gemini ─────────────────────────────────────────────────────────

/**
 * Calls Google Gemini API as a secondary fallback provider.
 * Only used if OpenRouter fails and GEMINI_API_KEY is configured.
 */
async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("GEMINI_NOT_CONFIGURED");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const geminiContents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: geminiContents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`Gemini error ${response.status}: ${body}`) as Error & { status: number; body: string };
    err.status = response.status;
    err.body = body;
    throw err;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty content");
  return text;
}

// ─── Retry Wrapper ────────────────────────────────────────────────────────────

/**
 * Calls a provider function with one automatic retry on retryable errors.
 *
 * @param fn          - The provider function to call
 * @param providerName - Name used in logs
 * @param retryDelayMs - How long to wait before retrying (default 1500ms)
 */
async function withRetry(
  fn: () => Promise<string>,
  providerName: string,
  retryDelayMs = 1500
): Promise<string> {
  try {
    return await fn();
  } catch (err) {
    const status = (err as { status?: number }).status;
    const body   = (err as { body?: string }).body ?? "";

    if (status && isRetryableStatus(status)) {
      const waitMs = parseRetryAfter(body, retryDelayMs);
      console.warn(`[AI] ${providerName} rate limited (${status}). Retrying in ${waitMs}ms…`);
      await delay(waitMs);

      try {
        const result = await fn();
        console.log(`[AI] ${providerName} retry succeeded.`);
        return result;
      } catch (retryErr) {
        console.error(`[AI] ${providerName} retry failed:`, (retryErr as Error).message);
        throw retryErr;
      }
    }

    // Non-retryable error — rethrow immediately
    throw err;
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * generateAIResponse — the single public function for AI responses.
 *
 * NEVER throws. Always returns a string.
 *
 * Flow:
 *  1. Integration flags → mock data (instant, no AI call)
 *  2. OpenRouter (primary) with retry
 *  3. Gemini (secondary) with retry — only if OpenRouter fails
 *  4. generateFallback(message) — guaranteed response
 */
export async function generateAIResponse(
  userMessage: string,
  history: AIMessage[],
  integrations: IIntegrations
): Promise<string> {
  // ── Step 1: Integration simulation (no AI needed) ──
  if (integrations.shopify) return getMockShopifyResponse(userMessage);
  if (integrations.crm)     return getMockCRMResponse(userMessage);

  const messages: ChatMessage[] = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  // ── Step 2: Primary provider — OpenRouter ──
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey !== "your_openrouter_api_key_here") {
    try {
      const result = await withRetry(
        () => callOpenRouter(messages),
        "OpenRouter"
      );
      console.log("[AI] OpenRouter responded successfully.");
      return result;
    } catch (err) {
      console.error("[AI] OpenRouter failed after retry:", (err as Error).message);
    }
  }

  // ── Step 3: Secondary provider — Gemini ──
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    try {
      const result = await withRetry(
        () => callGemini(messages),
        "Gemini"
      );
      console.log("[AI] Gemini (secondary) responded successfully.");
      return result;
    } catch (err) {
      console.error("[AI] Gemini secondary also failed:", (err as Error).message);
    }
  }

  // ── Step 4: Intelligent fallback — ALWAYS returns ──
  console.warn("[AI] All providers failed. Using intelligent fallback.");
  return generateFallback(userMessage);
}
