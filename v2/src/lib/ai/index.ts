/**
 * AI services (Phase 6): case auto-classification + case summarization via the
 * OpenAI API (owner decision 2026-07-17 — switched from the original Claude
 * implementation because the owner uses an OpenAI key). Structured outputs
 * guarantee the classifier's JSON shape. Everything degrades gracefully —
 * callers must handle isAiConfigured()=false and thrown errors (an AI outage
 * must never break intake).
 */
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
/** Must match the DB column width (cases.embedding vector(1024)). */
export const EMBEDDING_DIMENSIONS = 1024;

export function isAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

let cached: OpenAI | null = null;
function client(): OpenAI {
  if (!cached) cached = new OpenAI(); // reads OPENAI_API_KEY
  return cached;
}

// ---- Classification ----

export interface RefOption {
  id: number;
  name: string;
  arabicName: string | null;
  description?: string | null;
  /** priorities only: 1 = most urgent */
  level?: number;
}

const classificationSchema = z.object({
  categoryId: z.number().int(),
  priorityId: z.number().int(),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]),
  isSensitive: z
    .boolean()
    .describe(
      "True for protection-sensitive content: abuse, exploitation, safety threats, discrimination against the reporter",
    ),
  confidence: z.enum(["low", "medium", "high"]),
  rationale: z
    .string()
    .describe(
      "One short sentence explaining the classification, understandable by case staff",
    ),
});

export type CaseClassification = z.infer<typeof classificationSchema>;

const CLASSIFIER_SYSTEM = `You classify community feedback cases for a humanitarian
organization operating in the Occupied Palestinian Territories. Cases may be
written in English or Arabic (or mixed). Read the case and assign:
- categoryId: the single best-fitting category from the provided list
- priorityId: from the provided list; level 1 is the most urgent. Safety threats,
  protection risks, and acute service failures warrant high urgency; general
  feedback and appreciation are low.
- urgencyLevel: your independent read of urgency (low/medium/high/critical)
- isSensitive: protection-relevant content that should be restricted
Choose IDs strictly from the provided lists.`;

export async function classifyCase(input: {
  title: string;
  description: string;
  categories: RefOption[];
  priorities: RefOption[];
}): Promise<CaseClassification> {
  const completion = await client().chat.completions.parse({
    model: MODEL,
    max_completion_tokens: 2048,
    response_format: zodResponseFormat(classificationSchema, "classification"),
    messages: [
      { role: "system", content: CLASSIFIER_SYSTEM },
      {
        role: "user",
        content: [
          "## Categories",
          JSON.stringify(
            input.categories.map(({ id, name, arabicName, description }) => ({
              id,
              name,
              arabicName,
              description,
            })),
          ),
          "## Priorities (level 1 = most urgent)",
          JSON.stringify(
            input.priorities.map(({ id, name, level }) => ({ id, name, level })),
          ),
          "## Case",
          `Title: ${input.title}`,
          `Description: ${input.description}`,
        ].join("\n"),
      },
    ],
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) throw new Error("Classifier returned no parseable output");

  // Guard against hallucinated ids even though the prompt pins the lists.
  if (!input.categories.some((c) => c.id === parsed.categoryId)) {
    throw new Error(`Classifier returned unknown categoryId ${parsed.categoryId}`);
  }
  if (!input.priorities.some((p) => p.id === parsed.priorityId)) {
    throw new Error(`Classifier returned unknown priorityId ${parsed.priorityId}`);
  }
  return parsed;
}

// ---- Summarization ----

export async function summarizeCase(input: {
  caseNumber: string;
  title: string;
  description: string;
  statusName?: string;
  comments: { comment: string; createdAt: string }[];
  history: { actionType: string; changeDescription: string | null; createdAt: string }[];
  /** Respond in this language ("en" | "ar"). */
  locale: string;
}): Promise<string> {
  const completion = await client().chat.completions.create({
    model: MODEL,
    max_completion_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You summarize community-feedback cases for staff. Write a tight
summary: what was reported, what has happened since (comments/history), current
state, and any open action. Max ~120 words, plain prose, no headings.
Respond in ${input.locale === "ar" ? "Arabic" : "English"}.`,
      },
      {
        role: "user",
        content: [
          `Case ${input.caseNumber}: ${input.title}`,
          input.statusName ? `Current status: ${input.statusName}` : "",
          `Description: ${input.description}`,
          "## Comments (oldest first)",
          ...input.comments.map((c) => `- [${c.createdAt}] ${c.comment}`),
          "## History",
          ...input.history.map(
            (h) =>
              `- [${h.createdAt}] ${h.actionType}${h.changeDescription ? `: ${h.changeDescription}` : ""}`,
          ),
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Summarizer returned no text");
  return text;
}

// ---- Embeddings (semantic search / duplicate detection) ----

/** The text a case is embedded from — title carries the most signal. */
export function caseEmbeddingText(input: { title: string; description: string }): string {
  return `${input.title}\n\n${input.description}`.slice(0, 8000);
}

/**
 * Embed arbitrary text into a 1024-dim vector (pinned to the DB column width).
 * Callers must gate on isAiConfigured(); throws on API failure.
 */
export async function embedText(text: string): Promise<number[]> {
  const res = await client().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  const vector = res.data[0]?.embedding;
  if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Embedding response had an unexpected shape");
  }
  return vector;
}
