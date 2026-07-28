"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUsage } from "@/shared/api/queries";
import { TokensByModel } from "@/features/usage/TokensByModel";
import { CostByModel } from "@/features/usage/CostByModel";
import { UsageTable } from "@/features/usage/UsageTable";
import {
  TimeRangeSegments,
  type TimeRangeValue,
  type CustomRange,
} from "@/shared/components/TimeRangeSegments";

const RANGE_DAYS: Record<TimeRangeValue, number> = { "24h": 1, "7d": 7, "30d": 30, custom: 30 };

export default function UsagePage() {
  const t = useTranslations("usage");
  const usage = useUsage();
  const [range, setRange] = useState<TimeRangeValue>("30d");
  const [customRange, setCustomRange] = useState<CustomRange | undefined>(undefined);
  const data = usage.data;
  const days = RANGE_DAYS[range];
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <TimeRangeSegments
          value={range}
          onChange={setRange}
          customRange={customRange}
          onCustomApply={setCustomRange}
        />
      </div>
      {data && (
        <div className="space-y-5">
          <TokensByModel data={data.tokensByModel} days={days} />
          <CostByModel data={data.costByModel} days={days} />
        </div>
      )}
      {data && <UsageTable data={data.topUsers} />}
    </div>
  );
}
