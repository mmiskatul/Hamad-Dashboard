"use client";
import { type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useFocusTrap } from "@/shared/hooks/useFocusTrap";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = false,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
  trigger?: ReactNode;
}) {
  const t = useTranslations("confirm.generic");
  const trapRef = useFocusTrap<HTMLDivElement>(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent ariaLabel={title}>
        <div ref={trapRef}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {body && <DialogDescription>{body}</DialogDescription>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              {cancelLabel ?? t("cancel")}
            </Button>
            <Button
              variant={destructive ? "danger" : "primary"}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel ?? t("confirm")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
