"use client";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { type TicketStatus } from "@/shared/api/types";

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const t = useTranslations("support.status");
  const tone = status === "open" ? "warn" : status === "pending" ? "neutral" : "ok";
  return <Badge tone={tone}>{t(status)}</Badge>;
}