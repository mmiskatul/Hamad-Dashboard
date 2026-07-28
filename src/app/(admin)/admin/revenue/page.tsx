"use client";
import { useTranslations } from "next-intl";
import { useRevenue } from "@/shared/api/queries";
import { RevenueStats } from "@/features/revenue/RevenueStats";
import { MrrChart } from "@/features/revenue/MrrChart";
import { TierMixChart } from "@/features/revenue/TierMixChart";
import { ChurnChart } from "@/features/revenue/ChurnChart";
import { FunnelChart } from "@/features/revenue/FunnelChart";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AppText } from "@/shared/ui/AppText";
import { Skeleton } from "@/components/ui/skeleton";
import { Numeric } from "@/components/numeric/Numeric";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { formatCurrency, formatNumber, formatPercent } from "@/shared/lib/format";

export default function RevenuePage() {
  const t = useTranslations("revenue");
  const r = useRevenue();
  const data = r.data;

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      {data ? (
        <>
          <RevenueStats
            mrr={data.mrrSeries.at(-1)?.mrr ?? 0}
            arr={data.arr}
            arpu={data.arpu}
            churn={data.churnRate}
          />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MrrChart data={data.mrrSeries} />
            </div>
            <ChurnChart data={data.churn} />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <TierMixChart data={data.tierMix} />
              <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-xs shadow-[var(--e1)]">
                <TierMixTable data={data.tierMix} />
              </div>
            </div>
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex grow items-center gap-2">
                  <AppText role="card">{t("conversion")}</AppText>
                  <InfoTooltip label="About the conversion funnel">
                    Each row is a stage from visitor to paying subscriber.
                    Count is the absolute number of users at that stage;
                    Step CR is the conversion rate from the previous stage
                    (Visitors show <Numeric value="100%" /> as the
                    baseline); Overall CR is the conversion from
                    Visitors to that stage.
                  </InfoTooltip>
                </div>
              </CardHeader>
              <CardBody className="flex flex-1 flex-col gap-0 p-0">
                <div className="px-4 pt-4">
                  <FunnelChart rows={data.funnel} />
                </div>
                <div className="mt-4 border-t border-[var(--border-default)] px-4 py-3 text-xs">
                  <FunnelTable rows={data.funnel} />
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      ) : (
        <Skeleton className="h-72" />
      )}
    </div>
  );
}

function TierMixTable({
  data,
}: {
  data: { tier: "free" | "pro" | "business"; users: number; revenue: number }[];
}) {
  const TIER_LABELS: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    business: "Business",
  };
  const totalUsers = data.reduce((acc, d) => acc + d.users, 0) || 1;
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
  return (
    <Table>
      <THead>
        <TR>
          <TH>Tier</TH>
          <TH className="text-end">Users</TH>
          <TH className="text-end">Share</TH>
          <TH className="text-end">Revenue</TH>
        </TR>
      </THead>
      <TBody>
        {data.map((d) => (
          <TR key={d.tier}>
            <TD>{TIER_LABELS[d.tier]}</TD>
            <TD className="text-end _num">
              <Numeric value={formatNumber(d.users)} />
            </TD>
            <TD className="text-end _num text-[var(--text-secondary)]">
              <Numeric value={formatPercent(d.users / totalUsers)} />
            </TD>
            <TD className="text-end _num">
              <Numeric value={formatCurrency(d.revenue)} />
            </TD>
          </TR>
        ))}
        <TR>
          <TD className="font-medium text-[var(--text-primary)]">Total</TD>
          <TD className="text-end _num font-medium">
            <Numeric value={formatNumber(totalUsers)} />
          </TD>
          <TD className="text-end _num text-[var(--text-secondary)]">
            <Numeric value="100%" />
          </TD>
          <TD className="text-end _num font-medium">
            <Numeric value={formatCurrency(totalRevenue)} />
          </TD>
        </TR>
      </TBody>
    </Table>
  );
}

function FunnelTable({ rows }: { rows: { stage: string; value: number }[] }) {
  const top = rows[0]?.value ?? 1;
  return (
    <Table>
      <THead>
        <TR>
          <TH>Stage</TH>
          <TH className="text-end">Count</TH>
          <TH className="text-end">Step CR</TH>
          <TH className="text-end">Overall CR</TH>
        </TR>
      </THead>
      <TBody>
        {rows.map((stage, i) => {
          const prev = i > 0 ? rows[i - 1]!.value : stage.value;
          const stepCr = i === 0 ? 100 : Math.round((stage.value / prev) * 100);
          const overallCr = Math.round((stage.value / top) * 100);
          const info = FUNNEL_STAGE_INFO[stage.stage];
          return (
            <TR key={stage.stage}>
              <TD className="text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <span>{stage.stage}</span>
                  {info && (
                    <InfoTooltip
                      label={`About ${stage.stage}`}
                      triggerAttrs={{ "data-funnel-stage": stage.stage.toLowerCase() }}
                    >
                      {info}
                    </InfoTooltip>
                  )}
                </span>
              </TD>
              <TD className="text-end">
                <Numeric value={formatNumber(stage.value)} className="font-medium" />
              </TD>
              <TD className="text-end text-xs text-[var(--text-secondary)]">
                <Numeric value={`${stepCr}%`} />
              </TD>
              <TD className="text-end text-xs text-[var(--text-secondary)]">
                <Numeric value={`${overallCr}%`} />
              </TD>
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}

const FUNNEL_STAGE_INFO: Record<string, string> = {
  Visitors:
    "Anyone who landed on a sign-in or landing page for the app, counted once per session. The baseline of the funnel: every other stage is a subset of this number.",
  Signups:
    "People who created an account and confirmed their email. This is the first real top-of-funnel conversion — anything that blocks signup (email friction, OAuth errors, copy confusion) shows up here.",
  Activated:
    "Signed-up users who reached their first meaningful action (e.g. sent their first chat message, ran their first query). Activation is the strongest leading indicator of retention.",
  Subscribed:
    "Users who entered a paid plan, including trials that converted. The bottom of the funnel — these are the users generating revenue.",
};