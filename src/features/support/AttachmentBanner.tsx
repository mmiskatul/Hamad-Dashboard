"use client";
import { Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";
import { Numeric } from "@/components/numeric/Numeric";

export function AttachmentBanner({ expiresAt }: { expiresAt: string }) {
  const t = useTranslations("support.attachments");
  const days = Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 86400000));
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-3 text-sm">
      <Paperclip size={16} className="text-[var(--text-secondary)]" aria-hidden />
      <span className="font-medium">{t("title")}</span>
      <span className="text-[var(--text-secondary)]">·</span>
      <span className="text-[var(--text-secondary)]">
        {t("expires", { days })} (<Numeric value={days} />)
      </span>
    </div>
  );
}