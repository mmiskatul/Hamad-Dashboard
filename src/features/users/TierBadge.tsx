"use client";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { type Tier } from "@/shared/api/types";

export function TierBadge({ tier }: { tier: Tier }) {
  const t = useTranslations("users.tier");
  const tone = tier === "business" ? "solid" : tier === "pro" ? "neutral" : "neutral";
  const custom =
    tier === "business"
      ? "border-transparent"
      : tier === "pro"
        ? "text-[var(--action-primary)]"
        : undefined;
  return (
    <Badge tone={tone} className={custom}>
      {t(tier)}
    </Badge>
  );
}
