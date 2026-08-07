"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { AppText } from "@/shared/ui/AppText";
import { useUpdateAdminProfile } from "@/shared/api/queries";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations("account.form");
  const ts = useTranslations("toast");
  const tc = useTranslations("common");
  const [n, setN] = useState(name);
  const [reason, setReason] = useState("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const update = useUpdateAdminProfile();

  // Re-sync the local buffer when the upstream name changes (e.g. after a save).
  useEffect(() => {
    setN(name);
  }, [name]);

  const dirty = n.trim() !== name.trim();
  const nameValid = n.trim().length >= 2;
  const reasonValid = reason.trim().length >= 10;

  const openReason = () => {
    if (!dirty || !nameValid) return;
    setReason("");
    setReasonOpen(true);
  };

  const handleSave = async () => {
    if (!reasonValid || !nameValid) return;
    try {
      await update.mutateAsync({ name: n.trim(), reason: reason.trim() });
      toast.success(ts("saved"), { description: ts("savedDetail") });
      setReasonOpen(false);
      setReason("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tc("error"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{t("name")}</AppText>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <div>
          <Label htmlFor="acc-name">{t("name")}</Label>
          <Input
            id="acc-name"
            value={n}
            onChange={(ev) => setN(ev.target.value)}
            className="mt-2"
            aria-invalid={n.trim().length > 0 && !nameValid}
          />
        </div>
        <div>
          <Label htmlFor="acc-email">{t("email")}</Label>
          <div className="relative mt-2">
            <Input
              id="acc-email"
              value={email}
              readOnly
              aria-readonly="true"
              className="pe-10"
            />
            <Lock
              size={14}
              aria-hidden
              className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={openReason}
            disabled={!dirty || !nameValid || update.isPending}
            data-testid="profile-save-open"
          >
            {tc("save")}
          </Button>
        </div>
      </CardBody>

      {reasonOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tc("save")}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-canvas)]/70 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setReasonOpen(false);
              setReason("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--e2)]">
            <h3 className="text-base font-medium">{tc("save")}</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Reason for change (≥ 10 characters, visible to auditors)
            </p>
            <textarea
              data-testid="profile-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-3 min-h-[88px] w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
              placeholder="Reason for change (≥ 10 characters)"
            />
            {!reasonValid && reason.length > 0 && (
              <p className="mt-1 text-xs text-[var(--danger-text)]">
                Reason must be at least 10 characters.
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setReasonOpen(false);
                  setReason("");
                }}
                disabled={update.isPending}
              >
                {tc("cancel")}
              </Button>
              <Button
                variant="primary"
                data-testid="profile-save-confirm"
                disabled={!reasonValid || update.isPending}
                onClick={handleSave}
              >
                {tc("save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}