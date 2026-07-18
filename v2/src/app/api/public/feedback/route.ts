import { handler } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { parseBody, publicFeedbackSchema } from "@/lib/validation";
import { LIMITS } from "@/lib/http/rateLimit";
import { createCase } from "@/db/repositories/cases";
import {
  listCategories,
  listChannels,
  listPriorities,
} from "@/db/repositories/referenceData";
import { writeAudit } from "@/db/repositories/audit";
import { classifyCase, isAiConfigured, type CaseClassification } from "@/lib/ai";

/**
 * Anonymous public feedback intake — NET-NEW in v2 (v1's public form only
 * console.logged). Creates a public case with no authenticated submitter; the
 * creation is recorded in audit_logs as a system action.
 */
export const POST = handler(
  async (req) => {
    const parsed = await parseBody(req, publicFeedbackSchema);
    if (!parsed.ok) return parsed.response;
    const { description, name, contact, location } = parsed.data;

    const [categories, channels, priorities] = await Promise.all([
      listCategories(),
      listChannels(),
      listPriorities(),
    ]);
    const category = categories.find((c) => c.name === "Other") ?? categories[0];
    const channel = channels.find((c) => c.name === "Website") ?? channels[0];
    const priority = priorities.find((p) => p.name === "Medium") ?? priorities[0];
    if (!category || !channel || !priority) {
      return fail(500, "Intake is not configured.", "NOT_CONFIGURED");
    }

    const title =
      description.length > 60 ? `${description.slice(0, 60)}…` : description;
    const contactIsEmail = contact?.includes("@") ?? false;

    // AI auto-classification (Phase 6): pick category/priority/urgency from the
    // text. Best-effort — any failure falls back to the static defaults so
    // anonymous intake can never break because of an AI outage.
    let ai: CaseClassification | null = null;
    if (isAiConfigured()) {
      try {
        ai = await classifyCase({ title, description, categories, priorities });
      } catch (err) {
        console.error("[ai] public-intake classification failed:", err);
      }
    }

    const created = await createCase(
      {
        title,
        description,
        categoryId: ai?.categoryId ?? category.id,
        priorityId: ai?.priorityId ?? priority.id,
        channelId: channel.id,
        urgencyLevel: ai?.urgencyLevel,
        isSensitive: ai?.isSensitive ?? false,
        isPublic: true,
        confidentialityLevel: ai?.isSensitive ? "restricted" : "public",
        providerName: name,
        providerEmail: contactIsEmail ? contact : undefined,
        providerPhone: contact && !contactIsEmail ? contact : undefined,
        location,
      },
      null,
    );

    await writeAudit({
      userId: null,
      action: "CREATE",
      entityType: "case",
      entityId: created.id,
      metadata: {
        source: "public_intake",
        aiClassified: !!ai,
        ...(ai ? { aiConfidence: ai.confidence, aiRationale: ai.rationale } : {}),
      },
    });

    // Only return the reference number to the anonymous submitter.
    return ok(
      { caseNumber: created.caseNumber },
      "Thank you — your feedback has been received.",
      { status: 201 },
    );
  },
  { rate: LIMITS.publicIntake, rateScope: "public" },
);
