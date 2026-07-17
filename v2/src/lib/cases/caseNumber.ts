/**
 * Case-number formatting. v2 makes the prefix settings-authoritative (default
 * `CFM`), resolving the v1 CS-/CFM- inconsistency (docs/v2/IMPROVEMENTS.md).
 * Format: `<PREFIX>-YYYYMMDD-NNNN` (NNNN = daily sequence, zero-padded).
 */
export function formatCaseNumber(
  prefix: string,
  date: Date,
  sequence: number,
): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `${prefix}-${y}${m}${d}-${seq}`;
}

/** The UTC day boundaries [start, end) containing `date`, for sequence counting. */
export function dayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}
