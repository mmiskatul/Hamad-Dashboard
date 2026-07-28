"use client";
import { useTranslations } from "next-intl";
import { TierEditor } from "@/features/config-tiers/TierEditor";
import { TierComparisonTable } from "@/features/config-tiers/TierComparisonTable";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import { useConfigTiers } from "@/shared/api/queries";

export default function ConfigTiersPage() {
  const t = useTranslations("configTiers");
  const tiers = useConfigTiers();
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      <TierEditor />
      {tiers.data && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-medium">{t("comparison")}</h2>
            <GlossaryTooltip term="priorityRouting" />
          </div>
          <p
            data-config-description="priorityRouting"
            className="mb-3 text-sm text-[var(--text-secondary)]"
          >
            Tiers with <strong>Priority routing</strong> jump the queue when a
            provider is congested, so paying users stay fast even during
            traffic spikes.
          </p>
          <TierComparisonTable tiers={tiers.data} />
        </div>
      )}
    </div>
  );
}