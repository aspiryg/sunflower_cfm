/**
 * Case-embedding service: bridges the OpenAI embedding call and the vector
 * column. Best-effort by design — embedding failures (AI down, quota) must
 * never break case intake, so callers can await this without a try/catch.
 */
import { isAiConfigured, embedText, caseEmbeddingText } from "./index";
import { setCaseEmbedding, similarCases, type CaseWithDistance } from "@/db/repositories/cases";

/**
 * Embed a case's text and persist it. Returns the vector (for immediate reuse,
 * e.g. duplicate detection) or null when AI is unconfigured or the call fails.
 */
export async function embedAndStoreCase(
  caseId: number,
  input: { title: string; description: string },
): Promise<number[] | null> {
  if (!isAiConfigured()) return null;
  try {
    const vector = await embedText(caseEmbeddingText(input));
    await setCaseEmbedding(caseId, vector);
    return vector;
  } catch (err) {
    console.error(`[ai] failed to embed case ${caseId}:`, err);
    return null;
  }
}

/** Possible duplicates of a freshly-created case (best-effort; [] on failure). */
export async function findDuplicatesFor(
  caseId: number,
  vector: number[] | null,
): Promise<CaseWithDistance[]> {
  if (!vector) return [];
  try {
    return await similarCases({ vector, excludeId: caseId, limit: 5 });
  } catch {
    return [];
  }
}
