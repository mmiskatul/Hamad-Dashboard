"use client";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { type UserStatus } from "@/shared/api/types";

export function UserStatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations("users.status");
  const tone = status === "active" ? "ok" : status === "suspended" ? "bad" : "warn";
  return <Badge tone={tone}>{t(status)}</Badge>;
}
