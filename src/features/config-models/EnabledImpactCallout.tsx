"use client";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Numeric } from "@/components/numeric/Numeric";

export function EnabledImpactCallout({ affectedUsers }: { affectedUsers: number }) {
  const t = useTranslations("configModels.impact");
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--warning)] bg-[var(--warning-wash)] p-4 text-sm text-[var(--warning-text)]">
      <AlertTriangle size={18} className="mt-0.5" aria-hidden />
      <div>
        <p className="font-medium">{t("title", { count: affectedUsers })}</p>
        <p className="mt-1 text-xs opacity-80">
          {t("hint")} (<Numeric value={affectedUsers} />)
        </p>
      </div>
    </div>
  );
}