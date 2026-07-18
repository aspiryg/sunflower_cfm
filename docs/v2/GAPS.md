# v2 Parity Gaps vs v1 (2026-07-18 audit)

Comprehensive v1→v2 gap audit (four domain reviews + cross-check of v1 routes).
Only items where v1 had a capability v2 **lacks** or only **partially** ships.
v2-only wins (AI classify/summarize/embeddings/semantic search, analytics,
attachments table, i18n/RTL, wired public intake) are excluded.

Legend: ☐ open · ◐ partial/in-progress · ☑ done. Priority: [C]ritical [H]igh [M]ed [L]ow.

Recurring pattern: **v2's repo/backend often supports a feature that no route or
UI wires up** — many gaps are "unwire → wire", not new design.

## Tier 1 — Functional gaps / near-bugs — ✅ DONE (2026-07-18)
- ☑ [C] Escalation notified nobody → escalate route now calls
  `notifyCaseStakeholders`.
- ☑ [C] Transactional emails on case events → `notify.ts` now emails
  creator+assignee (+extras) on assign/status/comment/escalation via
  `caseNotificationEmail`; verified live.
- ☑ [H] Welcome email (temp password + verification link) on admin user-create.
- ☑ [H] Comments: edit + delete + internal toggle + follow-up (mark-complete +
  cross-case `/api/comments/follow-up` queue) — routes + UI.
- ☑ [H] Reference data: DELETE (guarded), statuses/priorities management
  (admin), rich fields (color/description/arabicDescription/sortOrder/SLA/flags).
- ☑ [H] Users: reactivate, EditUserModal (email/username/org/role/status),
  role-change audit reason, remember-me, account-locked (423) message,
  email-not-verified state + resend-verification button.
- _Deferred within Tier 1_: distinct `case_resolved` email content (currently
  folded into status-changed); comment threading/reply rendering (parentCommentId
  is persisted but not visualized).

## Tier 2 — Dashboard & lists
- ☐ [C] Dashboard has no filters (v1: date-range/status/priority/category);
  `caseAnalytics` hardcoded to last 30 days.
- ☐ [H] KPI cards: 3 of v1's 7 (missing Active, High-Priority, Sensitive, Today's
  Submissions) + avg resolution/processing time metric (computed nowhere in v2).
- ☐ [H] Recent-cases widget: bare 2-col table vs v1 (status/priority badges,
  assignee, submitter, relative time, per-row nav, refresh).
- ☐ [H] Notifications page: no filters (read-status/type/priority) + no bulk
  mark-read + no total/read summary.
- ☐ [M] Case list filters: assignedTo, urgencyLevel, date range; broader sort set
  (v1 has 14 sort fields, v2 has 7); search covers only title/caseNumber.

## Tier 3 — Case-detail richness
- ☐ [H] Assignment tab + assignment history/timeline UI + assignment stats
  (data is written to `caseAssignments` but never read/shown; no read route).
- ☐ [M] Overview/Location/Settings panels: surface the many stored fields v2
  never displays (impact, affectedBeneficiaries, provider block, program links,
  tags, confidentiality, consent, coordinates/location).
- ☐ [M] Rich activity timeline (grouped/iconized) vs the current flat list.
- ☐ [M] Create form: assign-on-create + submittedBy + status pick + a few
  provider fields (group gender composition, privacyPolicyAccepted).

## Tier 4 — Profile self-service
- ☐ [H] Email change (password-verified, re-verify); 2FA toggle (columns exist,
  no endpoint/UI); self-deactivate.
- ☐ [M] Profile fields with no inputs: phone (submitted but not rendered), bio,
  DOB, address/city/state/country/postal, username change.
- ☐ [L] Profile picture delete (endpoint exists, no button); profile completion %
  + activity/security summary.

## Tier 5 — Public content & misc
- ☐ [M] Landing page: 3 of 9 feature cards; missing hero stats, How-It-Works,
  CTA. About: missing Values grid + Location.
- ☐ [M] Hierarchical resources: nested tree UI (expand/collapse, inline add-child,
  stats) vs the current cascading-dropdown + flat table.
- ☐ [L] Register button in public navbar; register form username/organization;
  profile-picture server-side image optimization (sharp).

## Tier 6 — Requested but never built
- ☐ [H] Chatbot assistant (owner-requested).
- ☐ [H] Very advanced admin section (owner-requested: users, roles, settings,
  reference data, audit-log viewer, system config).

## Deferred / not real v1 capabilities (do NOT build as "parity")
- Reports/Analytics page (v1 button was disabled/"coming soon").
- Notification preferences (mentioned in v1 copy; no model/endpoint/UI existed).
- SLA/overdue/due-date-reminder generation job (type declared, never generated).
- Public case-status tracking by reference (neither version had it) — worth
  adding as a v2 improvement, but not a regression.
