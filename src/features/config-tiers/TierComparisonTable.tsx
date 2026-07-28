"use client";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Numeric } from "@/components/numeric/Numeric";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import type { TierConfig } from "@/shared/api/types";

export function TierComparisonTable({ tiers }: { tiers: TierConfig[] }) {
  const t = useTranslations("configTiers");

  const rows: { key: string; label: React.ReactNode; value: (t: TierConfig) => React.ReactNode }[] = [
    {
      key: "price",
      label: "Price",
      value: (tier) => (
        <Numeric
          value={tier.monthlyUsd === 0 ? "Free" : `$${tier.monthlyUsd}`}
          suffix={tier.monthlyUsd > 0 ? "/mo" : undefined}
        />
      ),
    },
    {
      key: "requests",
      label: t("requestsLimit"),
      value: (tier) => (
        <Numeric value={tier.requestsLimit === -1 ? "Unlimited" : tier.requestsLimit} />
      ),
    },
    {
      key: "tokens",
      label: t("tokensLimit"),
      value: (tier) => <Numeric value={tier.tokensLimit} />,
    },
    {
      key: "models",
      label: t("models"),
      value: (tier) => <Numeric value={tier.models.length} suffix="models" />,
    },
    {
      key: "fileUpload",
      label: t("fileUpload"),
      value: (tier) => (tier.features.fileUpload ? <Check size={16} className="text-[var(--success-text)]" /> : "—"),
    },
    {
      key: "voice",
      label: t("voice"),
      value: (tier) => (tier.features.voice ? <Check size={16} className="text-[var(--success-text)]" /> : "—"),
    },
    {
      key: "priority",
      label: (
        <span className="inline-flex items-center gap-1.5">
          {t("priority")}
          <GlossaryTooltip term="priorityRouting" />
        </span>
      ),
      value: (tier) => (tier.features.priority ? <Check size={16} className="text-[var(--success-text)]" /> : "—"),
    },
  ];

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--e1)]">
      <Table>
        <THead>
          <TR>
            <TH>Feature</TH>
            {tiers.map((tier) => (
              <TH key={tier.id}>{tier.name}</TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => (
            <TR key={row.key}>
              <TD className="text-[var(--text-secondary)]">{row.label}</TD>
              {tiers.map((tier) => (
                <TD key={tier.id}>{row.value(tier)}</TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
