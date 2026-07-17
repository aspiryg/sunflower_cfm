/**
 * Case status-transition rules. v2 enforces the lifecycle that v1 only modeled
 * as data (isInitial/isFinal/allowReopen) but never validated
 * (docs/v2/IMPROVEMENTS.md). Pure: takes the two status rows and decides.
 */

export interface StatusFlags {
  id: number;
  name?: string;
  isInitial: boolean;
  isFinal: boolean;
  allowReopen: boolean;
}

export interface TransitionResult {
  ok: boolean;
  code?:
    | "SAME_STATUS"
    | "TO_INITIAL"
    | "STATUS_LOCKED";
  reason?: string;
}

/**
 * Rules:
 *  - No-op transitions are rejected (SAME_STATUS).
 *  - An initial status (e.g. "New") is creation-only; nothing transitions *to*
 *    it — reopening uses a dedicated "Reopened" status (TO_INITIAL).
 *  - A final status that disallows reopening (e.g. "Closed") is terminal; no
 *    transition leaves it (STATUS_LOCKED). A final status that allows reopening
 *    (e.g. "Resolved") can move on.
 */
export function canTransition(
  from: StatusFlags,
  to: StatusFlags,
): TransitionResult {
  if (from.id === to.id) {
    return { ok: false, code: "SAME_STATUS", reason: "Status is unchanged." };
  }
  if (to.isInitial) {
    return {
      ok: false,
      code: "TO_INITIAL",
      reason: "Cannot move a case back to the initial status.",
    };
  }
  if (from.isFinal && !from.allowReopen) {
    return {
      ok: false,
      code: "STATUS_LOCKED",
      reason: `Status "${from.name ?? from.id}" is terminal and cannot be changed.`,
    };
  }
  return { ok: true };
}
