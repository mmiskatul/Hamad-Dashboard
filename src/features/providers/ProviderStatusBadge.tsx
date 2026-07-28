"use client";
import { StatusBadge } from "@/components/status/StatusBadge";
import { useTranslations } from "next-intl";
import { type ProviderStatus } from "@/shared/api/types";

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const t = useTranslations("providers.status");
  const tone = status === "operational" ? "ok" : status === "degraded" ? "warn" : "bad";
  return <StatusBadge status={tone} label={t(status)} />;
}