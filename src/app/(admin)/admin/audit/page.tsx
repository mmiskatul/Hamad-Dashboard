"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAudit } from "@/shared/api/queries";
import { AuditTimeline } from "@/features/audit/AuditTimeline";
import { AuditFilters } from "@/features/audit/AuditFilters";

export default function AuditPage() {
  const t = useTranslations("audit");
  const audit = useAudit();
  const [action, setAction] = useState("any");
  const entries = (audit.data ?? []).filter((e) => action === "any" || e.action === action);
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      <div className="flex justify-end">
        <AuditFilters action={action} onActionChange={setAction} />
      </div>
      <AuditTimeline entries={entries} />
    </div>
  );
}