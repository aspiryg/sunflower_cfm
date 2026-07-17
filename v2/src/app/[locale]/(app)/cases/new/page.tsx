"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";
import { CaseForm, type CaseFormValues } from "@/features/cases/CaseForm";

export default function NewCasePage() {
  const t = useTranslations("cases");
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (body: CaseFormValues) =>
      apiFetch<{ case: { id: number } }>("/api/cases", { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      router.push("/cases");
    },
    onError: (e) =>
      setError((e as unknown as ApiError)?.message ?? t("loadError")),
  });

  return (
    <>
      <div className="page-head">
        <h1>{t("createTitle")}</h1>
        <Link href="/cases" className="btn btn-outline">
          {t("backToList")}
        </Link>
      </div>
      <div className="form-card">
        <CaseForm
          submitLabel={t("submit")}
          busyLabel={t("creating")}
          busy={create.isPending}
          error={error}
          onSubmit={(values) => {
            setError(null);
            create.mutate(values);
          }}
        />
      </div>
    </>
  );
}
