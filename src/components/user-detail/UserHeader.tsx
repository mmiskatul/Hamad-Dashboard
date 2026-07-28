"use client";
import { useState } from "react";
import Image from "next/image";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { TierBadge } from "@/features/users/TierBadge";
import { UserStatusBadge } from "@/features/users/UserStatusBadge";
import { Numeric } from "@/components/numeric/Numeric";
import { formatDate, formatPhone, formatRelativeTime } from "@/shared/lib/format";
import type { UserDetail } from "@/shared/api/types";

export function UserHeader({ user }: { user: UserDetail }) {
  const t = useTranslations("userDetail");
  const last4 = user.id.slice(-4);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(user.id);
        setCopied(true);
        toast.success(t("copied"));
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // ignore
    }
  };

  return (
    <Card>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Image
          src={user.avatarUrl || "/brand/logo-mark.svg"}
          alt=""
          width={60}
          height={60}
          className="h-[60px] w-[60px] shrink-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] object-cover"
        />
        <div className="grow space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-medium">{user.name}</h2>
            <TierBadge tier={user.tier} />
            <UserStatusBadge status={user.status} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] _num">{user.email}</p>
          {user.mobile ? (
            <p className="text-xs text-[var(--text-secondary)]">
              <span>{t("meta.mobile")}:</span>{" "}
              <a
                href={`tel:${user.mobile.replace(/\s+/g, "")}`}
                className="_num underline-offset-2 hover:underline"
                dir="ltr"
                aria-label={user.mobile}
              >
                {formatPhone(user.mobile)}
              </a>
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span>
              {t("meta.signupDate")}: <Numeric value={formatDate(user.signupDate)} />
            </span>
            <span>
              {t("lastSeen")}: <Numeric value={formatRelativeTime(user.lastActiveAt)} />
            </span>
            <span className="flex items-center gap-1">
              <Numeric value={`••••${last4}`} />
              <Button variant="ghost" size="sm" onClick={onCopy} aria-label={t("copyId")}>
                <Copy size={12} />
                {copied ? t("copied") : t("copyId")}
              </Button>
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}