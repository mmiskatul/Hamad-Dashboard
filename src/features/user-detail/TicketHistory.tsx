"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AppText } from "@/shared/ui/AppText";
import { Badge } from "@/components/ui/badge";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import { useTranslations } from "next-intl";

/**
 * Renders `formatRelativeTime(new Date())`, but only after hydration.
 * Pre-mount, we emit a stable placeholder so SSR and CSR markup match.
 */
function useMountedNow() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(formatRelativeTime(new Date()));
  }, []);
  return now;
}

export function TicketHistory({ ticketIds }: { ticketIds: string[] }) {
  const t = useTranslations("support.status");
  const u = useTranslations("userDetail");
  const now = useMountedNow();
  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{u("ticketHistory")}</AppText>
        </div>
      </CardHeader>
      <CardBody className="space-y-2">
        {ticketIds.length === 0 ? (
          <AppText role="caption">{u("noTickets")}</AppText>
        ) : (
          ticketIds.map((id) => (
            <Link
              key={id}
              href={`/admin/support/${id}`}
              className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2 hover:bg-[var(--bg-subtle)]"
            >
              <span className="font-medium _num">{id}</span>
              <span className="flex items-center gap-2">
                <Badge tone="neutral">{t("open")}</Badge>
                <Numeric
                  value={now ?? "—"}
                  className="text-xs text-[var(--text-secondary)]"
                />
              </span>
            </Link>
          ))
        )}
      </CardBody>
    </Card>
  );
}