"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";
import { CaseForm, type CaseFormValues } from "@/features/cases/CaseForm";

interface CaseFull extends CaseFormValues {
  id: number;
  caseNumber: string;
}

export default function EditCasePage() {
  const params = useParams();
  const id = Number(params.id);
  const t = useTranslations("cases");
  const td = useTranslations("caseDetail");
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const caseQ = useQuery({
    queryKey: ["case", id],
    queryFn: () => apiFetch<{ case: CaseFull }>(`/api/cases/${id}`),
    retry: false,
  });

  const save = useMutation({
    mutationFn: (body: CaseFormValues) =>
      apiFetch(`/api/cases/${id}`, { method: "PUT", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case", id] });
      qc.invalidateQueries({ queryKey: ["cases"] });
      router.push(`/cases/${id}`);
    },
    onError: (e) =>
      setError((e as unknown as ApiError)?.message ?? t("loadError")),
  });

  if (caseQ.isLoading) return <p className="muted">…</p>;
  if (caseQ.isError || !caseQ.data)
    return <p className="center-note">{td("notFound")}</p>;
  const c = caseQ.data.data.case;

  return (
    <>
      <div className="page-head">
        <h1 dir="ltr">{c.caseNumber}</h1>
        <Link href={`/cases/${id}`} className="btn btn-outline">
          {td("back")}
        </Link>
      </div>
      <div className="form-card">
        <CaseForm
          initial={c}
          submitLabel={t("saveChanges")}
          busyLabel={t("saving")}
          busy={save.isPending}
          error={error}
          onSubmit={(values) => {
            setError(null);
            save.mutate(values);
          }}
        />
      </div>
    </>
  );
}
