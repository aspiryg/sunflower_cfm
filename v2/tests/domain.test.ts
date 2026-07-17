import { describe, it, expect } from "vitest";
import { formatCaseNumber, dayBounds } from "@/lib/cases/caseNumber";
import { computeDueDate, computeResponseDeadline, addHours } from "@/lib/cases/sla";
import { canTransition, type StatusFlags } from "@/lib/cases/lifecycle";

describe("case number", () => {
  it("formats <PREFIX>-YYYYMMDD-NNNN with padding", () => {
    const d = new Date(Date.UTC(2026, 6, 5)); // 2026-07-05
    expect(formatCaseNumber("CFM", d, 1)).toBe("CFM-20260705-0001");
    expect(formatCaseNumber("CFM", d, 42)).toBe("CFM-20260705-0042");
    expect(formatCaseNumber("OPT", d, 1234)).toBe("OPT-20260705-1234");
  });

  it("computes UTC day bounds", () => {
    const { start, end } = dayBounds(new Date(Date.UTC(2026, 6, 5, 13, 30)));
    expect(start.toISOString()).toBe("2026-07-05T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-07-06T00:00:00.000Z");
  });
});

describe("SLA", () => {
  const base = new Date(Date.UTC(2026, 6, 5, 0, 0, 0));
  it("adds hours", () => {
    expect(addHours(base, 24).toISOString()).toBe("2026-07-06T00:00:00.000Z");
  });
  it("computes due date from resolution hours", () => {
    expect(computeDueDate(base, 48)?.toISOString()).toBe(
      "2026-07-07T00:00:00.000Z",
    );
    expect(computeDueDate(base, null)).toBeNull();
  });
  it("computes response deadline", () => {
    expect(computeResponseDeadline(base, 4)?.toISOString()).toBe(
      "2026-07-05T04:00:00.000Z",
    );
  });
});

describe("lifecycle transitions", () => {
  const NEW: StatusFlags = { id: 1, name: "New", isInitial: true, isFinal: false, allowReopen: true };
  const PROG: StatusFlags = { id: 4, name: "In Progress", isInitial: false, isFinal: false, allowReopen: true };
  const RESOLVED: StatusFlags = { id: 7, name: "Resolved", isInitial: false, isFinal: true, allowReopen: true };
  const CLOSED: StatusFlags = { id: 8, name: "Closed", isInitial: false, isFinal: true, allowReopen: false };
  const REOPENED: StatusFlags = { id: 9, name: "Reopened", isInitial: false, isFinal: false, allowReopen: true };

  it("allows a normal forward transition", () => {
    expect(canTransition(NEW, PROG).ok).toBe(true);
  });
  it("rejects a no-op", () => {
    expect(canTransition(PROG, PROG).code).toBe("SAME_STATUS");
  });
  it("rejects transitioning back to an initial status", () => {
    expect(canTransition(PROG, NEW).code).toBe("TO_INITIAL");
  });
  it("allows reopening a Resolved (final but reopenable) case", () => {
    expect(canTransition(RESOLVED, REOPENED).ok).toBe(true);
  });
  it("locks a Closed (terminal) case", () => {
    expect(canTransition(CLOSED, REOPENED).code).toBe("STATUS_LOCKED");
  });
});
