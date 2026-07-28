"use client";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Numeric } from "@/components/numeric/Numeric";
import { Sparkline } from "@/components/charts/Sparkline";
import { AppText } from "@/shared/ui/AppText";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

export function StatsCard({
  label,
  value,
  delta,
  trend,
  foot,
  spark,
  sparkColor = "var(--action-primary)",
  info,
}: {
  label: string;
  value: string;
  delta?: number;
  trend?: "up" | "down";
  foot?: React.ReactNode;
  spark?: number[];
  sparkColor?: string;
  info?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--e1)]">
      <div className="flex items-center gap-1.5">
        <AppText role="label" className="text-[var(--text-secondary)]">
          {label}
        </AppText>
        {info && <InfoTooltip label={label}>{info}</InfoTooltip>}
      </div>
      <Numeric value={value} className="text-[30px] font-medium leading-none" />
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        {typeof delta === "number" && trend && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium _num"
            style={{
              color: trend === "up" ? "var(--success-text)" : "var(--danger-text)",
              background: trend === "up" ? "var(--success-wash)" : "var(--danger-wash)",
            }}
          >
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <Numeric value={`${(Math.abs(delta) * 100).toFixed(1)}%`} />
          </span>
        )}
        {foot}
      </div>
      {spark && spark.length > 0 && (
        <div className="mt-2">
          <Sparkline label={label} values={spark} color={sparkColor} />
        </div>
      )}
    </div>
  );
}
