"use client";
import { useTranslations } from "next-intl";
import { UsageVisibilityToggle } from "@/features/config-usage/UsageVisibilityToggle";

export default function ConfigUsagePage() {
  const t = useTranslations("usageToggle");
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      <UsageVisibilityToggle />
    </div>
  );
}