"use client";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function PrivacyNotice() {
  const t = useTranslations("userDetail");
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-subtle)] p-4 text-sm">
      <ShieldCheck size={18} className="mt-0.5 text-[var(--text-secondary)]" aria-hidden />
      <p className="text-[var(--text-secondary)]">{t("privacyNotice")}</p>
    </div>
  );
}