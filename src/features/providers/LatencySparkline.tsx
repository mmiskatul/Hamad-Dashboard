"use client";
import { Sparkline } from "@/components/charts/Sparkline";

export function LatencySparkline({ values, label }: { values: number[]; label: string }) {
  return <Sparkline label={label} values={values} color="var(--action-primary)" width={120} height={28} />;
}