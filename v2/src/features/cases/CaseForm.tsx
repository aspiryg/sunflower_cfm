"use client";

/**
 * Multi-tab case form (v1 parity): Basic / Classification / Provider / Location.
 * Ported at v1 depth: section cards with icon headers, a guidelines sidebar
 * with smart suggestions, character counters, prev/next tab navigation, and
 * manual validation that jumps to the tab holding the first invalid field
 * (required controls live on hidden panels, so native validation can't run).
 * The Classification tab offers AI-suggested classification (Phase 6).
 */
import { useState, useEffect, type ReactNode, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";
import { TextField, TextAreaField, SelectField, CheckboxField, type SelectOption } from "@/ui/form";
import { TagInput } from "@/ui/TagInput";
import { DatePicker } from "@/ui/DatePicker";
import { EnhancedSelect } from "@/ui/EnhancedSelect";

interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
}

export interface CaseFormValues {
  title: string;
  description: string;
  categoryId: number;
  priorityId: number;
  channelId: number;
  caseDate?: string;
  dueDate?: string;
  impactDescription?: string;
  urgencyLevel?: string;
  affectedBeneficiaries?: number;
  programId?: number;
  projectId?: number;
  activityId?: number;
  providerTypeId?: number;
  providerName?: string;
  providerEmail?: string;
  providerPhone?: string;
  providerOrganization?: string;
  providerAddress?: string;
  individualProviderGender?: string;
  individualProviderAgeGroup?: string;
  individualProviderDisabilityStatus?: string;
  groupProviderSize?: number;
  dataSharingConsent?: boolean;
  followUpConsent?: boolean;
  followUpContactMethod?: string;
  isSensitive?: boolean;
  isAnonymized?: boolean;
  confidentialityLevel?: string;
  communityId?: number;
  location?: string;
  coordinates?: string;
  tags?: string;
  externalReferences?: string;
}

interface AiSuggestion {
  categoryId: number;
  priorityId: number;
  urgencyLevel: string;
  isSensitive: boolean;
  confidence: "low" | "medium" | "high";
  rationale: string;
}

function useReference(resource: string, params?: string, enabled = true) {
  return useQuery({
    queryKey: ["ref", resource, params ?? ""],
    queryFn: () =>
      apiFetch<Ref[]>(`/api/reference/${resource}${params ? `?${params}` : ""}`),
    staleTime: 60 * 60 * 1000,
    enabled,
  });
}

const URGENCY = ["low", "medium", "high", "critical"] as const;
const CONFIDENTIALITY = ["public", "internal", "restricted", "confidential"] as const;
const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
const AGE_GROUPS = ["under_18", "18_25", "26_35", "36_50", "51_65", "over_65"] as const;
const DISABILITIES = ["none", "physical", "visual", "hearing", "cognitive", "multiple", "prefer_not_to_say"] as const;
const FOLLOW_UP = ["email", "phone", "in_person", "sms", "none"] as const;

const TAB_ORDER = ["basic", "classification", "provider", "location"] as const;

/** Narrow an incoming value (ISO date or datetime) to a yyyy-mm-dd input value. */
function toDateInput(v?: string): string | null {
  if (!v) return null;
  return v.slice(0, 10);
}
/** Today as yyyy-mm-dd (local), for bounding the case date. */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** date + n days as yyyy-mm-dd. */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const TITLE_MAX = 255;
const DESC_MAX = 2000;
const IMPACT_MAX = 1000;

/* ---- Small presentational helpers (v1 SectionCard / InfoCard / counters) ---- */

const ICONS: Record<string, ReactNode> = {
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M15.5 5.6a3.2 3.2 0 1 1 0 5.3M16.5 14.7c2 .4 3.4 1.8 4 4.3" strokeLinecap="round" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 4h7l9 9-7 7-9-9V4z" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5" strokeLinecap="round" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.5a6.5 6.5 0 0 1 6.5 6.3C18.5 15.6 12 21 12 21z" strokeLinejoin="round" />
      <circle cx="12" cy="10.7" r="2.2" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z" strokeLinejoin="round" />
      <path d="M9.2 12l2 2 3.6-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

function Section({
  icon,
  title,
  sub,
  children,
}: {
  icon: keyof typeof ICONS;
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <section className="cform-section">
      <header className="cform-section__head">
        <span className="cform-section__icon">{ICONS[icon]}</span>
        <div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function CharCounter({ len, max, hint }: { len: number; max: number; hint?: string }) {
  const cls =
    len > max ? "is-over" : len > max * 0.9 ? "is-near" : "";
  return (
    <div className="char-count">
      <span className="char-count__hint">{hint}</span>
      <span className={`char-count__num ${cls}`}>
        {len}/{max}
      </span>
    </div>
  );
}

function InfoCard({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "danger";
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className={`info-card info-card--${variant}`}>
      <h4>{title}</h4>
      {children}
    </aside>
  );
}

/* -------------------------------- Form -------------------------------- */

export function CaseForm({
  initial,
  submitLabel,
  busyLabel,
  busy,
  error,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<CaseFormValues>;
  submitLabel: string;
  busyLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (values: CaseFormValues) => void;
  onCancel?: () => void;
}) {
  const t = useTranslations("cases");
  const tf = useTranslations("caseForm");
  const tAi = useTranslations("ai");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [tab, setTab] = useState<string>("basic");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string }>({});

  // Controlled core fields (needed for AI suggestions + cascades).
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [impact, setImpact] = useState(initial?.impactDescription ?? "");
  const [beneficiaries, setBeneficiaries] = useState(
    initial?.affectedBeneficiaries != null ? String(initial.affectedBeneficiaries) : "",
  );
  const [categoryId, setCategoryId] = useState<number | "">(initial?.categoryId ?? "");
  const [priorityId, setPriorityId] = useState<number | "">(initial?.priorityId ?? "");
  const [urgencyLevel, setUrgencyLevel] = useState(initial?.urgencyLevel ?? "");
  const [isSensitive, setIsSensitive] = useState(initial?.isSensitive ?? false);
  const [programId, setProgramId] = useState<number | undefined>(initial?.programId ?? undefined);
  const [projectId, setProjectId] = useState<number | undefined>(initial?.projectId ?? undefined);
  const [activityId, setActivityId] = useState<number | undefined>(initial?.activityId ?? undefined);
  const [regionId, setRegionId] = useState<number | undefined>(undefined);
  const [governorateId, setGovernorateId] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>(
    (initial?.tags ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  );
  const [caseDate, setCaseDate] = useState<string | null>(toDateInput(initial?.caseDate));
  const [dueDate, setDueDate] = useState<string | null>(toDateInput(initial?.dueDate));

  // AI suggestion state.
  const [suggesting, setSuggesting] = useState(false);
  const [aiNote, setAiNote] = useState<AiSuggestion | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const categories = useReference("categories");
  const priorities = useReference("priorities");
  const channels = useReference("channels");
  const providerTypes = useReference("provider-types");
  const programs = useReference("programs");
  const projects = useReference("projects", `programId=${programId}`, !!programId);
  const activities = useReference("activities", `projectId=${projectId}`, !!projectId);
  const regions = useReference("regions");
  const governorates = useReference("governorates", `regionId=${regionId}`, !!regionId);
  const communities = useReference("communities", `governorateId=${governorateId}`, !!governorateId);

  const loading = categories.isLoading || priorities.isLoading || channels.isLoading;

  // Required classification selects live on a non-default tab; if they started
  // empty the browser would block submit on a hidden control with no visible
  // feedback. Default them to the first reference option (v1 behavior) so a
  // quick create from the Basic tab alone is always valid.
  useEffect(() => {
    if (loading) return;
    setCategoryId((v) => (v === "" ? categories.data?.data?.[0]?.id ?? "" : v));
    setPriorityId((v) => (v === "" ? priorities.data?.data?.[0]?.id ?? "" : v));
  }, [loading, categories.data, priorities.data]);

  const label = (r: Ref) => (locale === "ar" && r.arabicName ? r.arabicName : r.name);
  const refOptions = (list: Ref[] | undefined): SelectOption[] =>
    (list ?? []).map((r) => ({ value: r.id, label: label(r) }));
  // EnhancedSelect requires string labels (it filters/searches on them).
  const refOptionsE = (list: Ref[] | undefined): { value: number; label: string }[] =>
    (list ?? []).map((r) => ({ value: r.id, label: label(r) }));
  const enumOptions = (values: readonly string[], ns: string): SelectOption[] =>
    values.map((v) => ({ value: v, label: tf(`${ns}.${v}`) }));

  const canSuggest = title.trim().length >= 3 && description.trim().length >= 10;

  async function suggestWithAi() {
    setAiError(null);
    setSuggesting(true);
    try {
      const res = await apiFetch<{ suggestion: AiSuggestion }>("/api/cases/classify", {
        method: "POST",
        body: { title: title.trim(), description: description.trim() },
      });
      const s = res.data.suggestion;
      setCategoryId(s.categoryId);
      setPriorityId(s.priorityId);
      setUrgencyLevel(s.urgencyLevel);
      setIsSensitive(s.isSensitive);
      setAiNote(s);
    } catch (err) {
      const e = err as ApiError;
      setAiError(e.error === "AI_UNAVAILABLE" ? tAi("unavailable") : tAi("error"));
    } finally {
      setSuggesting(false);
    }
  }

  // Smart suggestions (v1 parity): gentle guidance based on what's typed.
  const suggestions: string[] = [];
  if (title.trim() && title.trim().length < 10) suggestions.push(tf("suggestions.title"));
  if (description.trim() && description.trim().length < 50)
    suggestions.push(tf("suggestions.description"));
  const beneficiariesNum = beneficiaries ? Number(beneficiaries) : 0;

  const str = (f: FormData, k: string) => {
    const v = String(f.get(k) ?? "").trim();
    return v || undefined;
  };
  const num = (f: FormData, k: string) => {
    const v = str(f, k);
    return v ? Number(v) : undefined;
  };
  const bool = (f: FormData, k: string) => f.get(k) === "on";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Manual validation: required text fields sit on the Basic panel, which
    // may be hidden when submitting from another tab.
    const errs: typeof fieldErrors = {};
    if (title.trim().length < 3) errs.title = tf("errors.titleMin");
    if (description.trim().length < 10) errs.description = tf("errors.descriptionMin");
    if (title.length > TITLE_MAX) errs.title = tf("errors.tooLong");
    if (description.length > DESC_MAX) errs.description = tf("errors.tooLong");
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setTab("basic");
      return;
    }
    const f = new FormData(e.currentTarget);
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      categoryId: Number(categoryId),
      priorityId: Number(priorityId),
      channelId: Number(f.get("channelId")),
      caseDate: caseDate ?? undefined,
      dueDate: dueDate ?? undefined,
      impactDescription: impact.trim() || undefined,
      urgencyLevel: urgencyLevel || undefined,
      affectedBeneficiaries: beneficiaries ? Number(beneficiaries) : undefined,
      programId,
      projectId,
      activityId,
      providerTypeId: num(f, "providerTypeId"),
      providerName: str(f, "providerName"),
      providerEmail: str(f, "providerEmail"),
      providerPhone: str(f, "providerPhone"),
      providerOrganization: str(f, "providerOrganization"),
      providerAddress: str(f, "providerAddress"),
      individualProviderGender: str(f, "individualProviderGender"),
      individualProviderAgeGroup: str(f, "individualProviderAgeGroup"),
      individualProviderDisabilityStatus: str(f, "individualProviderDisabilityStatus"),
      groupProviderSize: num(f, "groupProviderSize"),
      dataSharingConsent: bool(f, "dataSharingConsent"),
      followUpConsent: bool(f, "followUpConsent"),
      followUpContactMethod: str(f, "followUpContactMethod"),
      isSensitive,
      isAnonymized: bool(f, "isAnonymized"),
      confidentialityLevel: str(f, "confidentialityLevel"),
      communityId: num(f, "communityId"),
      location: str(f, "location"),
      coordinates: str(f, "coordinates"),
      tags: tags.length ? tags.join(", ") : undefined,
      externalReferences: str(f, "externalReferences"),
    });
  }

  if (loading) return <p className="muted">{tc("loading")}</p>;

  const tabIndex = TAB_ORDER.indexOf(tab as (typeof TAB_ORDER)[number]);
  const basicHasErrors = !!(fieldErrors.title || fieldErrors.description);

  return (
    <div className="cform-shell">
      {error && (
        <div className="auth-card__error cform-error" role="alert">
          {error}
        </div>
      )}
      {basicHasErrors && !error && (
        <div className="auth-card__error cform-error" role="alert">
          {tf("errors.summary")}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <Tabs defaultValue="basic" value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="basic" badge={basicHasErrors ? "!" : undefined}>
              {tf("tabs.basic")}
            </TabsTrigger>
            <TabsTrigger value="classification">{tf("tabs.classification")}</TabsTrigger>
            <TabsTrigger value="provider">{tf("tabs.provider")}</TabsTrigger>
            <TabsTrigger value="location">{tf("tabs.location")}</TabsTrigger>
          </TabsList>

          {/* ---- Basic ---- */}
          <TabsContent value="basic" keepMounted>
            <div className="cform-grid">
              <div className="cform-main">
                <Section icon="info" title={tf("sections.identification")} sub={tf("sections.identificationSub")}>
                  <TextField
                    id="title"
                    label={t("titleLabel")}
                    required
                    maxLength={TITLE_MAX + 1}
                    dir="auto"
                    value={title}
                    error={fieldErrors.title}
                    placeholder={tf("titlePlaceholder")}
                    onChange={(e) => setTitle(e.target.value)}
                    fieldStyle={{ marginBottom: "0.4rem" }}
                  />
                  <CharCounter len={title.length} max={TITLE_MAX} hint={tf("titleHint")} />
                  <TextAreaField
                    id="description"
                    label={t("descriptionLabel")}
                    required
                    dir="auto"
                    value={description}
                    error={fieldErrors.description}
                    placeholder={tf("descriptionPlaceholder")}
                    onChange={(e) => setDescription(e.target.value)}
                    fieldStyle={{ marginBottom: "0.4rem" }}
                    style={{ minHeight: "14rem" }}
                  />
                  <CharCounter len={description.length} max={DESC_MAX} hint={tf("descriptionHint")} />
                </Section>

                <Section icon="info" title={tf("sections.timeline")} sub={tf("sections.timelineSub")}>
                  <div className="field-row">
                    <DatePicker
                      id="caseDate"
                      label={tf("caseDate")}
                      hint={tf("caseDateHint")}
                      value={caseDate}
                      max={todayISO()}
                      onChange={(v) => {
                        setCaseDate(v);
                        // Suggest a due date 7 days out if none set yet (v1 behavior).
                        if (v && !dueDate) setDueDate(addDays(v, 7));
                      }}
                    />
                    <DatePicker
                      id="dueDate"
                      label={tf("dueDate")}
                      hint={tf("dueDateHint")}
                      value={dueDate}
                      min={caseDate ? addDays(caseDate, 1) : undefined}
                      onChange={setDueDate}
                    />
                  </div>
                </Section>

                <Section icon="users" title={tf("sections.impact")} sub={tf("sections.impactSub")}>
                  <TextAreaField
                    id="impactDescription"
                    name="impactDescription"
                    label={tf("impactDescription")}
                    dir="auto"
                    style={{ minHeight: "9rem" }}
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    fieldStyle={{ marginBottom: "0.4rem" }}
                  />
                  <CharCounter len={impact.length} max={IMPACT_MAX} />
                  <div className="field-row">
                    <TextField
                      id="affectedBeneficiaries"
                      name="affectedBeneficiaries"
                      label={tf("affectedBeneficiaries")}
                      type="number"
                      min={0}
                      step={1}
                      value={beneficiaries}
                      onChange={(e) => setBeneficiaries(e.target.value)}
                      hint={tf("beneficiariesHint")}
                    />
                    <SelectField
                      id="urgencyLevel"
                      label={tf("urgencyLevel")}
                      options={enumOptions(URGENCY, "urgency")}
                      placeholder="—"
                      value={urgencyLevel}
                      onChange={(e) => setUrgencyLevel(e.target.value)}
                    />
                  </div>
                </Section>
              </div>

              {/* Guidelines / smart-suggestions sidebar (v1 parity). */}
              <div className="cform-side">
                <InfoCard title={tf("guide.title")}>
                  <ul>
                    <li>{tf("guide.g1")}</li>
                    <li>{tf("guide.g2")}</li>
                    <li>{tf("guide.g3")}</li>
                    <li>{tf("guide.g4")}</li>
                  </ul>
                </InfoCard>
                {suggestions.length > 0 && (
                  <InfoCard variant="warning" title={tf("suggestions.title0")}>
                    <ul>
                      {suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </InfoCard>
                )}
                {beneficiariesNum > 50 && (
                  <InfoCard variant="danger" title={tf("suggestions.highImpactTitle")}>
                    <p>{tf("suggestions.highImpact")}</p>
                  </InfoCard>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ---- Classification ---- */}
          <TabsContent value="classification" keepMounted>
            <Section icon="tag" title={tf("sections.classification")} sub={tf("sections.classificationSub")}>
              {/* AI suggestion (Phase 6) */}
              <div className="ai-suggest">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={!canSuggest || suggesting}
                  onClick={suggestWithAi}
                  title={canSuggest ? undefined : tAi("needsText")}
                >
                  ✨ {suggesting ? tAi("suggesting") : tAi("suggest")}
                </button>
                {aiError && <span className="field__error">{aiError}</span>}
                {aiNote && !aiError && (
                  <p className="ai-suggest__note" dir="auto">
                    <span className={`badge ai-confidence--${aiNote.confidence}`}>
                      {tAi(`confidence.${aiNote.confidence}`)}
                    </span>{" "}
                    {aiNote.rationale}
                  </p>
                )}
              </div>

              <div className="field-row">
                <EnhancedSelect
                  id="categoryId"
                  label={t("category")}
                  searchable
                  options={refOptionsE(categories.data?.data)}
                  placeholder="—"
                  value={categoryId === "" ? null : categoryId}
                  onChange={(v) => setCategoryId(v == null ? "" : Number(v))}
                />
                <EnhancedSelect
                  id="priorityId"
                  label={t("priorityLabel")}
                  options={refOptionsE(priorities.data?.data)}
                  placeholder="—"
                  value={priorityId === "" ? null : priorityId}
                  onChange={(v) => setPriorityId(v == null ? "" : Number(v))}
                />
              </div>
              <div className="field-row">
                <SelectField
                  id="channelId"
                  name="channelId"
                  label={t("channel")}
                  required
                  options={refOptions(channels.data?.data)}
                  defaultValue={initial?.channelId ?? channels.data?.data?.[0]?.id ?? ""}
                />
                <SelectField
                  id="confidentialityLevel"
                  name="confidentialityLevel"
                  label={tf("confidentiality")}
                  options={enumOptions(CONFIDENTIALITY, "confidentialityLevels")}
                  placeholder="—"
                  defaultValue={initial?.confidentialityLevel ?? ""}
                />
              </div>
              <CheckboxField
                id="isSensitive"
                label={tf("isSensitive")}
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
              />
            </Section>

            <Section icon="shield" title={tf("sections.programLinks")} sub={tf("sections.programLinksSub")}>
              <div className="field-row">
                <EnhancedSelect
                  id="programSel"
                  label={tf("program")}
                  searchable
                  clearable
                  options={refOptionsE(programs.data?.data)}
                  placeholder="—"
                  value={programId ?? null}
                  onChange={(v) => {
                    setProgramId(v == null ? undefined : Number(v));
                    setProjectId(undefined);
                    setActivityId(undefined);
                  }}
                />
                <EnhancedSelect
                  id="projectSel"
                  label={tf("project")}
                  searchable
                  clearable
                  options={refOptionsE(projects.data?.data)}
                  placeholder="—"
                  disabled={!programId}
                  value={projectId ?? null}
                  onChange={(v) => {
                    setProjectId(v == null ? undefined : Number(v));
                    setActivityId(undefined);
                  }}
                />
              </div>
              <EnhancedSelect
                id="activityId"
                label={tf("activity")}
                searchable
                clearable
                options={refOptionsE(activities.data?.data)}
                placeholder="—"
                disabled={!projectId}
                value={activityId ?? null}
                onChange={(v) => setActivityId(v == null ? undefined : Number(v))}
              />
            </Section>

            <Section icon="tag" title={tf("sections.tagsRefs")} sub={tf("sections.tagsRefsSub")}>
              <TagInput
                id="tags"
                label={tf("tags")}
                value={tags}
                onChange={setTags}
              />
              <TextField
                id="externalReferences"
                name="externalReferences"
                label={tf("externalReferences")}
                dir="auto"
                defaultValue={initial?.externalReferences ?? ""}
              />
            </Section>
          </TabsContent>

          {/* ---- Provider ---- */}
          <TabsContent value="provider" keepMounted>
            <Section icon="user" title={tf("sections.provider")} sub={tf("sections.providerSub")}>
              <SelectField
                id="providerTypeId"
                name="providerTypeId"
                label={tf("providerType")}
                options={refOptions(providerTypes.data?.data)}
                placeholder="—"
                defaultValue={initial?.providerTypeId ?? ""}
              />
              <div className="field-row">
                <TextField id="providerName" name="providerName" label={tf("providerName")} dir="auto" defaultValue={initial?.providerName ?? ""} />
                <TextField id="providerOrganization" name="providerOrganization" label={tf("providerOrganization")} dir="auto" defaultValue={initial?.providerOrganization ?? ""} />
              </div>
              <div className="field-row">
                <TextField id="providerEmail" name="providerEmail" label={tf("providerEmail")} type="email" dir="ltr" defaultValue={initial?.providerEmail ?? ""} />
                <TextField id="providerPhone" name="providerPhone" label={tf("providerPhone")} dir="ltr" defaultValue={initial?.providerPhone ?? ""} />
              </div>
              <TextField id="providerAddress" name="providerAddress" label={tf("providerAddress")} dir="auto" defaultValue={initial?.providerAddress ?? ""} />
            </Section>

            <Section icon="users" title={tf("sections.demographics")} sub={tf("sections.demographicsSub")}>
              <div className="field-row">
                <SelectField id="individualProviderGender" name="individualProviderGender" label={tf("gender")} options={enumOptions(GENDERS, "genders")} placeholder="—" defaultValue={initial?.individualProviderGender ?? ""} />
                <SelectField id="individualProviderAgeGroup" name="individualProviderAgeGroup" label={tf("ageGroup")} options={enumOptions(AGE_GROUPS, "ageGroups")} placeholder="—" defaultValue={initial?.individualProviderAgeGroup ?? ""} />
              </div>
              <div className="field-row">
                <SelectField id="individualProviderDisabilityStatus" name="individualProviderDisabilityStatus" label={tf("disability")} options={enumOptions(DISABILITIES, "disabilities")} placeholder="—" defaultValue={initial?.individualProviderDisabilityStatus ?? ""} />
                <TextField id="groupProviderSize" name="groupProviderSize" label={tf("groupSize")} type="number" min={0} defaultValue={initial?.groupProviderSize ?? ""} />
              </div>
            </Section>

            <Section icon="shield" title={tf("sections.consent")} sub={tf("sections.consentSub")}>
              <CheckboxField id="dataSharingConsent" name="dataSharingConsent" label={tf("dataSharingConsent")} defaultChecked={initial?.dataSharingConsent ?? false} />
              <CheckboxField id="followUpConsent" name="followUpConsent" label={tf("followUpConsent")} defaultChecked={initial?.followUpConsent ?? false} />
              <SelectField id="followUpContactMethod" name="followUpContactMethod" label={tf("followUpMethod")} options={enumOptions(FOLLOW_UP, "followUpMethods")} placeholder="—" defaultValue={initial?.followUpContactMethod ?? ""} />
              <CheckboxField id="isAnonymized" name="isAnonymized" label={tf("isAnonymized")} defaultChecked={initial?.isAnonymized ?? false} />
            </Section>
          </TabsContent>

          {/* ---- Location ---- */}
          <TabsContent value="location" keepMounted>
            <Section icon="pin" title={tf("sections.location")} sub={tf("sections.locationSub")}>
              <div className="field-row">
                <SelectField
                  id="regionSel"
                  label={tf("region")}
                  options={refOptions(regions.data?.data)}
                  placeholder="—"
                  value={regionId ?? ""}
                  onChange={(e) => {
                    setRegionId(e.target.value ? Number(e.target.value) : undefined);
                    setGovernorateId(undefined);
                  }}
                />
                <SelectField
                  id="governorateSel"
                  label={tf("governorate")}
                  options={refOptions(governorates.data?.data)}
                  placeholder="—"
                  disabled={!regionId}
                  value={governorateId ?? ""}
                  onChange={(e) => setGovernorateId(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <SelectField
                id="communityId"
                name="communityId"
                label={tf("community")}
                options={refOptions(communities.data?.data)}
                placeholder="—"
                disabled={!governorateId}
                defaultValue=""
                hint={tf("communityHint")}
              />
              <div className="field-row">
                <TextField id="location" name="location" label={tf("locationText")} dir="auto" defaultValue={initial?.location ?? ""} />
                <TextField id="coordinates" name="coordinates" label={tf("coordinates")} dir="ltr" placeholder="31.9, 35.2" defaultValue={initial?.coordinates ?? ""} />
              </div>
            </Section>
          </TabsContent>
        </Tabs>

        {/* Footer action bar (v1 FormActions): prev/next + cancel/submit. */}
        <div className="cform-actions">
          <div className="cform-actions__nav">
            <button
              type="button"
              className="btn btn-outline"
              disabled={tabIndex <= 0}
              onClick={() => setTab(TAB_ORDER[Math.max(0, tabIndex - 1)])}
            >
              {tf("nav.prev")}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={tabIndex >= TAB_ORDER.length - 1}
              onClick={() => setTab(TAB_ORDER[Math.min(TAB_ORDER.length - 1, tabIndex + 1)])}
            >
              {tf("nav.next")}
            </button>
          </div>
          <div className="cform-actions__main">
            {onCancel && (
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                {tc("cancel")}
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? busyLabel : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
