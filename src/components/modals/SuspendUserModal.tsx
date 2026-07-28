"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/input";

export function SuspendUserModal({
  open,
  onOpenChange,
  onSubmit,
  isSuspended,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  isSuspended: boolean;
}) {
  const t = useTranslations("userDetail");
  const tc = useTranslations("common");
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ariaLabel={isSuspended ? t("reactivateTitle") : t("suspendTitle")}>
        <DialogHeader>
          <DialogTitle>
            {isSuspended ? t("reactivateTitle") : t("suspendTitle")}
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="suspend-reason">{t("suspendReason")}</Label>
          <Textarea
            id="suspend-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-2"
            placeholder={t("override.reasonHint")}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant={isSuspended ? "primary" : "danger"}
            disabled={reason.trim().length < 10}
            onClick={() => {
              onSubmit(reason);
              toast.success(isSuspended ? "userReactivated" : "userSuspended");
              onOpenChange(false);
            }}
          >
            {isSuspended ? t("reactivateConfirm") : t("suspendConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
