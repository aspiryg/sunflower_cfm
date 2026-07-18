/**
 * AI services (Phase 6): case auto-classification + case summarization via the
 * Claude API. Structured outputs guarantee the classifier's JSON shape.
 * Everything degrades gracefully — callers must handle isAiConfigured()=false
 * and thrown errors (an AI outage must never break intake).
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";

const MODEL = "claude-opus-4-8";

export function isAiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

let cached: Anthropic | null = null;
function client(): Anthropic {
  if (!cached) cached = new Anthropic(); // reads ANTHROPIC_API_KEY
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
    .describe("True for protection-sensitive content: abuse, exploitation, safety threats, discrimination against the reporter"),
  confidence: z.enum(["low", "medium", "high"]),
  rationale: z
    .string()
    .describe("One short sentence explaining the classification, understandable by case staff"),
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
  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 2048,
    system: CLASSIFIER_SYSTEM,
    output_config: { format: zodOutputFormat(classificationSchema) },
    messages: [
      {
        role: "user",
        content: [
          "## Categories",
          JSON.stringify(
            input.categories.map(({ id, name, arabicName, description }) => ({ id, name, arabicName, description })),
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

  const parsed = response.parsed_output;
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
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: `You summarize community-feedback cases for staff. Write a tight
summary: what was reported, what has happened since (comments/history), current
state, and any open action. Max ~120 words, plain prose, no headings.
Respond in ${input.locale === "ar" ? "Arabic" : "English"}.`,
    messages: [
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
            (h) => `- [${h.createdAt}] ${h.actionType}${h.changeDescription ? `: ${h.changeDescription}` : ""}`,
          ),
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!text) throw new Error("Summarizer returned no text");
  return text;
}
