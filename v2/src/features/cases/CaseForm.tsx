"use client";

/**
 * Multi-tab case form (v1 parity): Basic / Classification / Provider / Location.
 * Full field model incl. impact, program links (cascading), provider
 * demographics, consent/privacy, and the geographic hierarchy cascade.
 * All panels stay mounted so one <form> submits every field.
 */
import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";

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
  const tc = useTranslations("common");
  const locale = useLocale();

  // Cascades (controlled so dependent queries re-fetch). DB rows carry null —
  // coerce to undefined so optional zod fields accept the round-trip.
  const [programId, setProgramId] = useState<number | undefined>(
    initial?.programId ?? undefined,
  );
  const [projectId, setProjectId] = useState<number | undefined>(
    initial?.projectId ?? undefined,
  );
  const [regionId, setRegionId] = useState<number | undefined>(undefined);
  const [governorateId, setGovernorateId] = useState<number | undefined>(undefined);

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
      title: String(f.get("title")),
      description: String(f.get("description")),
      categoryId: Number(f.get("categoryId")),
      priorityId: Number(f.get("priorityId")),
      channelId: Number(f.get("channelId")),
      impactDescription: str(f, "impactDescription"),
      urgencyLevel: str(f, "urgencyLevel"),
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
      isSensitive: bool(f, "isSensitive"),
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

  const enumSelect = (
    name: string,
    values: readonly string[],
    ns: string,
    defaultValue?: string,
    allowEmpty = true,
  ) => (
    <select id={name} name={name} defaultValue={defaultValue ?? ""}>
      {allowEmpty && <option value="">—</option>}
      {values.map((v) => (
        <option key={v} value={v}>
          {tf(`${ns}.${v}`)}
        </option>
      ))}
    </select>
  );

  const refSelect = (
    name: string,
    list: Ref[] | undefined,
    defaultValue?: number,
    required = false,
  ) => (
    <select id={name} name={name} defaultValue={defaultValue ?? ""} required={required}>
      {!required && <option value="">—</option>}
      {list?.map((r) => (
        <option key={r.id} value={r.id}>
          {label(r)}
        </option>
      ))}
    </select>
  );

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
            <div className="field">
              <label htmlFor="title">{t("titleLabel")}</label>
              <input id="title" name="title" required minLength={3} defaultValue={initial?.title ?? ""} dir="auto" />
            </div>
            <div className="field">
              <label htmlFor="description">{t("descriptionLabel")}</label>
              <textarea id="description" name="description" dir="auto" required minLength={10} defaultValue={initial?.description ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="impactDescription">{tf("impactDescription")}</label>
              <textarea id="impactDescription" name="impactDescription" dir="auto" style={{ minHeight: "8rem" }} defaultValue={initial?.impactDescription ?? ""} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="urgencyLevel">{tf("urgencyLevel")}</label>
                {enumSelect("urgencyLevel", URGENCY, "urgency", initial?.urgencyLevel)}
              </div>
              <div className="field">
                <label htmlFor="affectedBeneficiaries">{tf("affectedBeneficiaries")}</label>
                <input id="affectedBeneficiaries" name="affectedBeneficiaries" type="number" min={0} defaultValue={initial?.affectedBeneficiaries ?? ""} />
              </div>
            </div>
          </TabsContent>

          {/* ---- Classification ---- */}
          <TabsContent value="classification" keepMounted>
            <div className="field-row">
              <div className="field">
                <label htmlFor="categoryId">{t("category")}</label>
                {refSelect("categoryId", categories.data?.data, initial?.categoryId, true)}
              </div>
              <div className="field">
                <label htmlFor="priorityId">{t("priorityLabel")}</label>
                {refSelect("priorityId", priorities.data?.data, initial?.priorityId, true)}
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="channelId">{t("channel")}</label>
                {refSelect("channelId", channels.data?.data, initial?.channelId, true)}
              </div>
              <div className="field">
                <label htmlFor="confidentialityLevel">{tf("confidentiality")}</label>
                {enumSelect("confidentialityLevel", CONFIDENTIALITY, "confidentialityLevels", initial?.confidentialityLevel)}
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="programSel">{tf("program")}</label>
                <select
                  id="programSel"
                  value={programId ?? ""}
                  onChange={(e) => {
                    setProgramId(e.target.value ? Number(e.target.value) : undefined);
                    setProjectId(undefined);
                  }}
                >
                  <option value="">—</option>
                  {programs.data?.data.map((r) => (
                    <option key={r.id} value={r.id}>
                      {label(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="projectSel">{tf("project")}</label>
                <select
                  id="projectSel"
                  value={projectId ?? ""}
                  disabled={!programId}
                  onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">—</option>
                  {projects.data?.data.map((r) => (
                    <option key={r.id} value={r.id}>
                      {label(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="activityId">{tf("activity")}</label>
              <select id="activityId" name="activityId" defaultValue="" disabled={!projectId}>
                <option value="">—</option>
                {activities.data?.data.map((r) => (
                  <option key={r.id} value={r.id}>
                    {label(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tags">{tf("tags")}</label>
              <input id="tags" name="tags" defaultValue={initial?.tags ?? ""} placeholder={tf("tagsPlaceholder")} dir="auto" />
            </div>
            <div className="field">
              <label htmlFor="externalReferences">{tf("externalReferences")}</label>
              <input id="externalReferences" name="externalReferences" defaultValue={initial?.externalReferences ?? ""} dir="auto" />
            </div>
            <label className="checkbox-field" htmlFor="isSensitive">
              <input id="isSensitive" name="isSensitive" type="checkbox" defaultChecked={initial?.isSensitive ?? false} />
              {tf("isSensitive")}
            </label>
          </TabsContent>

          {/* ---- Provider ---- */}
          <TabsContent value="provider" keepMounted>
            <div className="field">
              <label htmlFor="providerTypeId">{tf("providerType")}</label>
              {refSelect("providerTypeId", providerTypes.data?.data, initial?.providerTypeId)}
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="providerName">{tf("providerName")}</label>
                <input id="providerName" name="providerName" defaultValue={initial?.providerName ?? ""} dir="auto" />
              </div>
              <div className="field">
                <label htmlFor="providerOrganization">{tf("providerOrganization")}</label>
                <input id="providerOrganization" name="providerOrganization" defaultValue={initial?.providerOrganization ?? ""} dir="auto" />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="providerEmail">{tf("providerEmail")}</label>
                <input id="providerEmail" name="providerEmail" type="email" defaultValue={initial?.providerEmail ?? ""} dir="ltr" />
              </div>
              <div className="field">
                <label htmlFor="providerPhone">{tf("providerPhone")}</label>
                <input id="providerPhone" name="providerPhone" defaultValue={initial?.providerPhone ?? ""} dir="ltr" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="providerAddress">{tf("providerAddress")}</label>
              <input id="providerAddress" name="providerAddress" defaultValue={initial?.providerAddress ?? ""} dir="auto" />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="individualProviderGender">{tf("gender")}</label>
                {enumSelect("individualProviderGender", GENDERS, "genders", initial?.individualProviderGender)}
              </div>
              <div className="field">
                <label htmlFor="individualProviderAgeGroup">{tf("ageGroup")}</label>
                {enumSelect("individualProviderAgeGroup", AGE_GROUPS, "ageGroups", initial?.individualProviderAgeGroup)}
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="individualProviderDisabilityStatus">{tf("disability")}</label>
                {enumSelect("individualProviderDisabilityStatus", DISABILITIES, "disabilities", initial?.individualProviderDisabilityStatus)}
              </div>
              <div className="field">
                <label htmlFor="groupProviderSize">{tf("groupSize")}</label>
                <input id="groupProviderSize" name="groupProviderSize" type="number" min={0} defaultValue={initial?.groupProviderSize ?? ""} />
              </div>
            </div>
            <label className="checkbox-field" htmlFor="dataSharingConsent">
              <input id="dataSharingConsent" name="dataSharingConsent" type="checkbox" defaultChecked={initial?.dataSharingConsent ?? false} />
              {tf("dataSharingConsent")}
            </label>
            <label className="checkbox-field" htmlFor="followUpConsent">
              <input id="followUpConsent" name="followUpConsent" type="checkbox" defaultChecked={initial?.followUpConsent ?? false} />
              {tf("followUpConsent")}
            </label>
            <div className="field">
              <label htmlFor="followUpContactMethod">{tf("followUpMethod")}</label>
              {enumSelect("followUpContactMethod", FOLLOW_UP, "followUpMethods", initial?.followUpContactMethod)}
            </div>
            <label className="checkbox-field" htmlFor="isAnonymized">
              <input id="isAnonymized" name="isAnonymized" type="checkbox" defaultChecked={initial?.isAnonymized ?? false} />
              {tf("isAnonymized")}
            </label>
          </TabsContent>

          {/* ---- Location ---- */}
          <TabsContent value="location" keepMounted>
            <div className="field-row">
              <div className="field">
                <label htmlFor="regionSel">{tf("region")}</label>
                <select
                  id="regionSel"
                  value={regionId ?? ""}
                  onChange={(e) => {
                    setRegionId(e.target.value ? Number(e.target.value) : undefined);
                    setGovernorateId(undefined);
                  }}
                >
                  <option value="">—</option>
                  {regions.data?.data.map((r) => (
                    <option key={r.id} value={r.id}>
                      {label(r)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="governorateSel">{tf("governorate")}</label>
                <select
                  id="governorateSel"
                  value={governorateId ?? ""}
                  disabled={!regionId}
                  onChange={(e) => setGovernorateId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">—</option>
                  {governorates.data?.data.map((r) => (
                    <option key={r.id} value={r.id}>
                      {label(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="communityId">{tf("community")}</label>
              <select id="communityId" name="communityId" defaultValue="" disabled={!governorateId}>
                <option value="">—</option>
                {communities.data?.data.map((r) => (
                  <option key={r.id} value={r.id}>
                    {label(r)}
                  </option>
                ))}
              </select>
              <span className="muted" style={{ fontSize: "1.2rem" }}>
                {tf("communityHint")}
              </span>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="location">{tf("locationText")}</label>
                <input id="location" name="location" defaultValue={initial?.location ?? ""} dir="auto" />
              </div>
              <div className="field">
                <label htmlFor="coordinates">{tf("coordinates")}</label>
                <input id="coordinates" name="coordinates" defaultValue={initial?.coordinates ?? ""} dir="ltr" placeholder="31.9, 35.2" />
              </div>
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
