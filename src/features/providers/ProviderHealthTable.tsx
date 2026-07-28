"use client";
import { useTranslations } from "next-intl";
import { ProviderStatusBadge } from "./ProviderStatusBadge";
import { LatencySparkline } from "./LatencySparkline";
import { Numeric } from "@/components/numeric/Numeric";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { GlossaryTooltip, type GlossaryTerm } from "@/components/ui/Glossary";
import { formatPercent } from "@/shared/lib/format";
import type { ProviderHealth } from "@/shared/api/types";

/**
 * Header cell paired with its plain-language definition. Keeping the
 * lookup inline (rather than a JSX map) means React renders a single
 * fragment per column header — easier to keep tooltips and headings in
 * lock-step as we add or rename columns.
 */
function HeaderWithTip({
  label,
  term,
  alignEnd = false,
}: {
  label: string;
  term: GlossaryTerm;
  alignEnd?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 ${alignEnd ? "justify-end" : ""}`}
    >
      <span>{label}</span>
      <GlossaryTooltip term={term} />
    </div>
  );
}

export function ProviderHealthTable({ rows }: { rows: ProviderHealth[] }) {
  const t = useTranslations("providers.columns");
  const tc = useTranslations("providers.circuit");
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--e1)]">
      <Table>
        <THead>
          <TR>
            <TH>{t("provider")}</TH>
            <TH>{t("status")}</TH>
            <TH className="text-end">
              <HeaderWithTip label={t("p50")} term="p50" alignEnd />
            </TH>
            <TH className="text-end">
              <HeaderWithTip label={t("p95")} term="p95" alignEnd />
            </TH>
            <TH className="text-end">
              <HeaderWithTip
                label={t("errorRate")}
                term="errorRate"
                alignEnd
              />
            </TH>
            <TH className="text-end">
              <HeaderWithTip label={t("uptime")} term="uptime" alignEnd />
            </TH>
            <TH>
              <HeaderWithTip label={t("circuit")} term="circuitBreaker" />
            </TH>
            <TH>Latency</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((p) => (
            <TR key={p.id}>
              <TD className="font-medium">{p.name}</TD>
              <TD><ProviderStatusBadge status={p.status} /></TD>
              <TD className="text-end"><Numeric value={`${p.p50Ms}ms`} /></TD>
              <TD className="text-end"><Numeric value={`${p.p95Ms}ms`} /></TD>
              <TD className="text-end"><Numeric value={formatPercent(p.errorRate)} /></TD>
              <TD className="text-end"><Numeric value={formatPercent(p.uptime)} /></TD>
              <TD>{tc(p.circuit)}</TD>
              <TD>
                <LatencySparkline values={p.sparkline} label={`${p.name} latency`} />
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}