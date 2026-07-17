/**
 * SLA computation. v2 makes due-date derivation a first-class, tested function
 * driven by the case's priority (v1 did this ad hoc; see IMPROVEMENTS.md).
 */

/** Add `hours` to `from`, returning a new Date. */
export function addHours(from: Date, hours: number): Date {
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Resolution due date from a priority's resolutionTimeHours. Returns null when
 * the priority has no SLA target (open-ended).
 */
export function computeDueDate(
  caseDate: Date,
  resolutionTimeHours: number | null | undefined,
): Date | null {
  if (resolutionTimeHours == null) return null;
  return addHours(caseDate, resolutionTimeHours);
}

/** First-response deadline from a priority's responseTimeHours. */
export function computeResponseDeadline(
  caseDate: Date,
  responseTimeHours: number | null | undefined,
): Date | null {
  if (responseTimeHours == null) return null;
  return addHours(caseDate, responseTimeHours);
}
