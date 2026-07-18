"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";
import { CaseForm, type CaseFormValues } from "@/features/cases/CaseForm";
import { useToast } from "@/ui/Toast";
import { Breadcrumb } from "@/ui/Breadcrumb";

export default function NewCasePage() {
  const t = useTranslations("cases");
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const tToast = useTranslations("toasts");

  const create = useMutation({
    mutationFn: (body: CaseFormValues) =>
      apiFetch<{ case: { id: number } }>("/api/cases", { method: "POST", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cases"] });
      toast.success(tToast("caseCreated"));
      router.push("/cases");
    },
    onError: (e) =>
      setError((e as unknown as ApiError)?.message ?? t("loadError")),
  });

  return (
    <>
      <Breadcrumb
        items={[
          { label: t("title"), href: "/cases" },
          { label: t("createTitle") },
        ]}
      />
      <div className="page-head">
        <h1>{t("createTitle")}</h1>
        <Link href="/cases" className="btn btn-outline">
          {t("backToList")}
        </Link>
      </div>
      <CaseForm
        submitLabel={t("submit")}
        busyLabel={t("creating")}
        busy={create.isPending}
        error={error}
        onSubmit={(values) => {
          setError(null);
          create.mutate(values);
        }}
        onCancel={() => router.push("/cases")}
      />
    </>
  );
}
