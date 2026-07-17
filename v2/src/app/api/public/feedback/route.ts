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

    const created = await createCase(
      {
        title,
        description,
        categoryId: category.id,
        priorityId: priority.id,
        channelId: channel.id,
        isPublic: true,
        confidentialityLevel: "public",
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
      metadata: { source: "public_intake" },
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
