"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { qk, useOverview, useProviders } from "@/shared/api/queries";
import { StatsCard } from "@/features/overview/StatsCard";
import { ProviderHealthCard } from "@/features/overview/ProviderHealthCard";
import { CostByModelCard } from "@/features/overview/CostByModelCard";
import { TimeRangeSegments, type TimeRangeValue, type CustomRange } from "@/features/overview/TimeRangeSegments";
import { AppText } from "@/shared/ui/AppText";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, formatPercent } from "@/shared/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

const RANGE_DAYS: Record<TimeRangeValue, number> = { "24h": 1, "7d": 7, "30d": 30, custom: 30 };

export function OverviewView() {
  const t = useTranslations("overview");
  const tCommon = useTranslations("common");
  const overview = useOverview();
  const providers = useProviders();
  const queryClient = useQueryClient();
  const data = overview.data;
  const [range, setRange] = useState<TimeRangeValue>("30d");
  const [customRange, setCustomRange] = useState<CustomRange | undefined>(undefined);
  const days = range === "custom" && customRange ? 30 : RANGE_DAYS[range];

  const handleRefresh = () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: qk.overview }),
      queryClient.invalidateQueries({ queryKey: qk.providers }),
    ]);
  };

  const refreshing = overview.isFetching || providers.isFetching;
  const overviewFailed = overview.isError && !overview.data;
  const providersFailed = providers.isError && !providers.data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeSegments
            value={range}
            onChange={setRange}
            customRange={customRange}
            onCustomApply={setCustomRange}
          />
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {tCommon("refresh")}
          </Button>
        </div>
      </div>

      {(overviewFailed || providersFailed) && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--danger)]/40 bg-[var(--danger-wash)] p-4 text-sm"
        >
          <div>
            <p className="font-medium text-[var(--danger-text)]">
              {tCommon("error")}
            </p>
            <p className="mt-1 text-[var(--text-secondary)]">
              {overview.error instanceof Error ? overview.error.message : null}
              {providers.error instanceof Error ? providers.error.message : null}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {tCommon("refresh")}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data ? (
          <>
            <StatsCard
              label={t("stats.health")}
              value={data.health === "healthy" ? t("healthOk") : data.health === "degraded" ? t("healthWarn") : t("healthBad")}
              foot={
                <span>
                  {data.providersUp}/{data.providersTotal} providers
                </span>
              }
              info="Whether all upstream AI providers are reachable and responding. Counts providers in degraded or down state."
            />
            <StatsCard
              label={t("stats.mrr")}
              value={formatCurrency(data.mrr)}
              delta={data.mrrDelta}
              trend={data.mrrDelta >= 0 ? "up" : "down"}
              foot="vs last month"
              spark={data.sparklines.mrr}
              info="Monthly Recurring Revenue — the sum of all active subscriptions normalized to a 30-day month. Excludes one-time fees and refunds."
            />
            <StatsCard
              label={t("stats.spend")}
              value={formatCurrency(data.spend30d)}
              delta={data.spendDelta}
              trend={data.spendDelta >= 0 ? "up" : "down"}
              foot={`margin ${formatPercent(data.spendMargin)}`}
              spark={data.sparklines.spend}
              sparkColor="var(--action-primary)"
              info="Total USD cost of all tokens consumed across all models in the selected window. Includes input and output tokens."
            />
            <StatsCard
              label={t("stats.activeUsers")}
              value={formatNumber(data.activeUsers)}
              delta={data.activeUsersDelta}
              trend={data.activeUsersDelta >= 0 ? "up" : "down"}
              foot={`${data.newUsers} new`}
              spark={data.sparklines.active}
              sparkColor="var(--danger)"
              info="Unique users who made at least one request in the selected window. 'New' counts users who registered in the window."
            />
          </>
        ) : overviewFailed ? (
          // Surface the failure as a row of empty placeholders so the layout
          // stays stable. The banner above already explains what went wrong.
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 opacity-50" />
          ))
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        )}
      </div>

      <div className="space-y-5">
        {providers.data && <ProviderHealthCard rows={providers.data} />}
        {data && <CostByModelCard rows={data.costByModel} days={days} />}
      </div>

      <AppText role="caption" className="block">
        OneAI Admin · Read-only payloads via adminProjection · Real data swap-in at <code>src/shared/api/client.ts</code>.
      </AppText>
    </div>
  );
}
