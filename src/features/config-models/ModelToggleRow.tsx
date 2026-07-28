"use client";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Numeric } from "@/components/numeric/Numeric";
import type { Tier } from "@/shared/api/types";

const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export function ModelToggleRow({
  id: _id,
  label,
  enabled,
  affectedUsers,
  includedInTiers,
  onToggle,
}: {
  id: string;
  label: string;
  enabled: boolean;
  affectedUsers: number;
  includedInTiers: Tier[];
  onToggle: (v: boolean) => void;
}) {
  const t = useTranslations("configModels.columns");
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border-default)] px-5 py-3 last:border-b-0 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span>
            {t("affected")}: <Numeric value={affectedUsers} />
          </span>
          <span aria-hidden className="opacity-30">|</span>
          <div className="flex flex-wrap items-center gap-1">
            {includedInTiers.length === 0 ? (
              <span className="text-[var(--text-secondary)]">—</span>
            ) : (
              includedInTiers.map((tier) => (
                <Badge key={tier} tone="neutral">
                  {TIER_LABEL[tier]}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Toggle ${label}`} />
    </div>
  );
}