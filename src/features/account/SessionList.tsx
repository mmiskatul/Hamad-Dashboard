"use client";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AppText } from "@/shared/ui/AppText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import { useRevokeAllOtherSessions, useRevokeSession } from "@/shared/api/queries";
import { useTranslations } from "next-intl";
import type { AdminAccount } from "@/shared/api/types";
import { toast } from "sonner";

export function SessionList({ sessions }: { sessions: AdminAccount["sessions"] }) {
  const t = useTranslations("account");
  const ta = useTranslations("actions");
  const revoke = useRevokeSession();
  const revokeAll = useRevokeAllOtherSessions();

  const othersCount = sessions.filter((s) => !s.current).length;

  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{t("sessions")}</AppText>
        </div>
        {othersCount > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              revokeAll.mutate(undefined, {
                onSuccess: () => toast.success(`${ta("revoke")} ✓`),
              })
            }
            disabled={revokeAll.isPending}
          >
            {t("revokeAllOthers")}
          </Button>
        )}
      </CardHeader>
      <CardBody className="space-y-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] px-3 py-2"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {s.device}
                {s.current && <Badge tone="ok">{t("current")}</Badge>}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                <Numeric value={s.location} /> · <Numeric value={s.ip} /> ·{" "}
                <Numeric value={formatRelativeTime(s.lastActiveAt)} />
              </div>
            </div>
            {!s.current && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  revoke.mutate(
                    { sessionId: s.id },
                    { onSuccess: () => toast.success(ta("revoke") + " ✓") },
                  )
                }
                disabled={revoke.isPending}
              >
                {ta("revoke")}
              </Button>
            )}
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">—</p>
        )}
      </CardBody>
    </Card>
  );
}