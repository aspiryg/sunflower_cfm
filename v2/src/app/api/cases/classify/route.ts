import { z } from "zod";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { parseBody } from "@/lib/validation";
import { listCategories, listPriorities } from "@/db/repositories/referenceData";
import { classifyCase, isAiConfigured } from "@/lib/ai";

const schema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
});

/** AI classification suggestion for the case form. */
export const POST = authed(
  async (req) => {
    if (!isAiConfigured()) {
      return fail(503, "AI classification is not configured.", "AI_UNAVAILABLE");
    }
    const parsed = await parseBody(req, schema);
    if (!parsed.ok) return parsed.response;

    const [categories, priorities] = await Promise.all([
      listCategories(),
      listPriorities(),
    ]);
    try {
      const suggestion = await classifyCase({
        title: parsed.data.title,
        description: parsed.data.description,
        categories,
        priorities: priorities.map((p) => ({ ...p, level: p.level })),
      });
      return ok({ suggestion });
    } catch (err) {
      console.error("[ai] classify failed:", err);
      return fail(502, "AI classification failed.", "AI_ERROR");
    }
  },
  { resource: "cases", action: "create" },
);
