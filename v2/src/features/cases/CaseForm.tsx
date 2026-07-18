"use client";

/**
 * Multi-tab case form (v1 parity): Basic / Classification / Provider / Location.
 * Core fields are controlled and built from the shared form components; the
 * Classification tab offers AI-suggested classification (Phase 6).
 * All panels stay mounted so one <form> submits every field.
 */
import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";
import { TextField, TextAreaField, SelectField, CheckboxField, type SelectOption } from "@/ui/form";

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

export function CaseForm({
  initial,
  submitLabel,
  busyLabel,
  busy,
  error,
  onSubmit,
}: {
  initial?: Partial<CaseFormValues>;
  submitLabel: string;
  busyLabel: string;
  busy: boolean;
  error: string | null;
  onSubmit: (values: CaseFormValues) => void;
}) {
  const t = useTranslations("cases");
  const tf = useTranslations("caseForm");
  const tAi = useTranslations("ai");
  const tc = useTranslations("common");
  const locale = useLocale();

  // Controlled core fields (needed for AI suggestions + cascades).
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(initial?.categoryId ?? "");
  const [priorityId, setPriorityId] = useState<number | "">(initial?.priorityId ?? "");
  const [urgencyLevel, setUrgencyLevel] = useState(initial?.urgencyLevel ?? "");
  const [isSensitive, setIsSensitive] = useState(initial?.isSensitive ?? false);
  const [programId, setProgramId] = useState<number | undefined>(initial?.programId ?? undefined);
  const [projectId, setProjectId] = useState<number | undefined>(initial?.projectId ?? undefined);
  const [regionId, setRegionId] = useState<number | undefined>(undefined);
  const [governorateId, setGovernorateId] = useState<number | undefined>(undefined);

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
  const label = (r: Ref) => (locale === "ar" && r.arabicName ? r.arabicName : r.name);
  const refOptions = (list: Ref[] | undefined): SelectOption[] =>
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
    const f = new FormData(e.currentTarget);
    onSubmit({
      title,
      description,
      categoryId: Number(categoryId),
      priorityId: Number(priorityId),
      channelId: Number(f.get("channelId")),
      impactDescription: str(f, "impactDescription"),
      urgencyLevel: urgencyLevel || undefined,
      affectedBeneficiaries: num(f, "affectedBeneficiaries"),
      programId,
      projectId,
      activityId: num(f, "activityId"),
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
      tags: str(f, "tags"),
      externalReferences: str(f, "externalReferences"),
    });
  }

  if (loading) return <p className="muted">{tc("loading")}</p>;

  return (
    <>
      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">{tf("tabs.basic")}</TabsTrigger>
            <TabsTrigger value="classification">{tf("tabs.classification")}</TabsTrigger>
            <TabsTrigger value="provider">{tf("tabs.provider")}</TabsTrigger>
            <TabsTrigger value="location">{tf("tabs.location")}</TabsTrigger>
          </TabsList>

          {/* ---- Basic ---- */}
          <TabsContent value="basic" keepMounted>
            <TextField
              id="title"
              label={t("titleLabel")}
              required
              minLength={3}
              dir="auto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextAreaField
              id="description"
              label={t("descriptionLabel")}
              required
              minLength={10}
              dir="auto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextAreaField
              id="impactDescription"
              name="impactDescription"
              label={tf("impactDescription")}
              dir="auto"
              style={{ minHeight: "8rem" }}
              defaultValue={initial?.impactDescription ?? ""}
            />
            <div className="field-row">
              <SelectField
                id="urgencyLevel"
                label={tf("urgencyLevel")}
                options={enumOptions(URGENCY, "urgency")}
                placeholder="—"
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
              />
              <TextField
                id="affectedBeneficiaries"
                name="affectedBeneficiaries"
                label={tf("affectedBeneficiaries")}
                type="number"
                min={0}
                defaultValue={initial?.affectedBeneficiaries ?? ""}
              />
            </div>
          </TabsContent>

          {/* ---- Classification ---- */}
          <TabsContent value="classification" keepMounted>
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
              <SelectField
                id="categoryId"
                label={t("category")}
                required
                options={refOptions(categories.data?.data)}
                placeholder="—"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              />
              <SelectField
                id="priorityId"
                label={t("priorityLabel")}
                required
                options={refOptions(priorities.data?.data)}
                placeholder="—"
                value={priorityId}
                onChange={(e) => setPriorityId(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div className="field-row">
              <SelectField
                id="channelId"
                name="channelId"
                label={t("channel")}
                required
                options={refOptions(channels.data?.data)}
                defaultValue={initial?.channelId ?? ""}
                placeholder="—"
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
            <div className="field-row">
              <SelectField
                id="programSel"
                label={tf("program")}
                options={refOptions(programs.data?.data)}
                placeholder="—"
                value={programId ?? ""}
                onChange={(e) => {
                  setProgramId(e.target.value ? Number(e.target.value) : undefined);
                  setProjectId(undefined);
                }}
              />
              <SelectField
                id="projectSel"
                label={tf("project")}
                options={refOptions(projects.data?.data)}
                placeholder="—"
                disabled={!programId}
                value={projectId ?? ""}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <SelectField
              id="activityId"
              name="activityId"
              label={tf("activity")}
              options={refOptions(activities.data?.data)}
              placeholder="—"
              disabled={!projectId}
              defaultValue=""
            />
            <TextField
              id="tags"
              name="tags"
              label={tf("tags")}
              placeholder={tf("tagsPlaceholder")}
              dir="auto"
              defaultValue={initial?.tags ?? ""}
            />
            <TextField
              id="externalReferences"
              name="externalReferences"
              label={tf("externalReferences")}
              dir="auto"
              defaultValue={initial?.externalReferences ?? ""}
            />
            <CheckboxField
              id="isSensitive"
              label={tf("isSensitive")}
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
            />
          </TabsContent>

          {/* ---- Provider ---- */}
          <TabsContent value="provider" keepMounted>
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
            <div className="field-row">
              <SelectField id="individualProviderGender" name="individualProviderGender" label={tf("gender")} options={enumOptions(GENDERS, "genders")} placeholder="—" defaultValue={initial?.individualProviderGender ?? ""} />
              <SelectField id="individualProviderAgeGroup" name="individualProviderAgeGroup" label={tf("ageGroup")} options={enumOptions(AGE_GROUPS, "ageGroups")} placeholder="—" defaultValue={initial?.individualProviderAgeGroup ?? ""} />
            </div>
            <div className="field-row">
              <SelectField id="individualProviderDisabilityStatus" name="individualProviderDisabilityStatus" label={tf("disability")} options={enumOptions(DISABILITIES, "disabilities")} placeholder="—" defaultValue={initial?.individualProviderDisabilityStatus ?? ""} />
              <TextField id="groupProviderSize" name="groupProviderSize" label={tf("groupSize")} type="number" min={0} defaultValue={initial?.groupProviderSize ?? ""} />
            </div>
            <CheckboxField id="dataSharingConsent" name="dataSharingConsent" label={tf("dataSharingConsent")} defaultChecked={initial?.dataSharingConsent ?? false} />
            <CheckboxField id="followUpConsent" name="followUpConsent" label={tf("followUpConsent")} defaultChecked={initial?.followUpConsent ?? false} />
            <SelectField id="followUpContactMethod" name="followUpContactMethod" label={tf("followUpMethod")} options={enumOptions(FOLLOW_UP, "followUpMethods")} placeholder="—" defaultValue={initial?.followUpContactMethod ?? ""} />
            <CheckboxField id="isAnonymized" name="isAnonymized" label={tf("isAnonymized")} defaultChecked={initial?.isAnonymized ?? false} />
          </TabsContent>

          {/* ---- Location ---- */}
          <TabsContent value="location" keepMounted>
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
          </TabsContent>
        </Tabs>

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? busyLabel : submitLabel}
        </button>
      </form>
    </>
  );
}
