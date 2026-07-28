"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import type { LegalDoc } from "@/shared/api/types";
import {
  useDeleteLegalVersion,
  useRestoreLegalVersion,
} from "@/shared/api/queries";

export function VersionHistoryPanel({
  docType,
  doc,
}: {
  docType: "terms" | "privacy";
  doc: LegalDoc;
}) {
  const t = useTranslations("legal");
  const tToast = useTranslations("toast");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const restore = useRestoreLegalVersion(docType);
  const remove = useDeleteLegalVersion(docType);

  const [pendingRestore, setPendingRestore] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const validReason = reason.trim().length >= 10;

  const sorted = [...doc.versions].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  const onRestore = async () => {
    if (!pendingRestore) return;
    try {
      await restore.mutateAsync({
        versionId: pendingRestore,
        actor: "admin@oneai.app",
        reason: reason || `Restored ${pendingRestore}`,
      });
      toast.success(tToast("legalRestored"));
      setPendingRestore(null);
      setReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tErrors("versionNotFound"));
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync({
        versionId: pendingDelete,
        actor: "admin@oneai.app",
        reason: reason || `Deleted ${pendingDelete}`,
      });
      toast.success(tToast("legalDeleted"));
      setPendingDelete(null);
      setReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tErrors("cannotDeleteOnly"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-base font-medium">{t("versionHistory")}</h3>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="divide-y divide-[var(--border-default)]">
          {sorted.map((v) => {
            const isCurrent = v.id === doc.currentVersionId;
            return (
              <li key={v.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                <div className="grow">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("versionLabel")} <Numeric value={v.id} />
                    </span>
                    {isCurrent && <Badge tone="ok">{t("isCurrent")}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{v.summary}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                    <Numeric value={formatRelativeTime(v.createdAt)} /> · <Numeric value={v.createdBy} />
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isCurrent}
                    onClick={() => setPendingRestore(v.id)}
                  >
                    {t("restore")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isCurrent || doc.versions.length <= 1}
                    onClick={() => setPendingDelete(v.id)}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardBody>

      <Dialog
        open={pendingRestore !== null}
        onOpenChange={(o) => !o && setPendingRestore(null)}
      >
        <DialogContent ariaLabel={t("restoreConfirm")}>
          <div className="space-y-3">
            <DialogHeader>
              <DialogTitle>{t("restoreConfirm")}</DialogTitle>
            </DialogHeader>
            <Label htmlFor="restore-reason">{t("reasonRequired")}</Label>
            <Textarea
              id="restore-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingRestore(null)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="primary" disabled={!validReason} onClick={onRestore}>
              {t("restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent ariaLabel={t("deleteConfirm")}>
          <div className="space-y-3">
            <DialogHeader>
              <DialogTitle>{t("deleteConfirm")}</DialogTitle>
            </DialogHeader>
            <Label htmlFor="delete-reason">{t("reasonRequired")}</Label>
            <Textarea
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="danger" disabled={!validReason} onClick={onDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}