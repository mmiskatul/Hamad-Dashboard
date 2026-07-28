"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Numeric } from "@/components/numeric/Numeric";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppText } from "@/shared/ui/AppText";
import { Badge } from "@/components/ui/badge";
import {
  useDisableTwoFactor,
  useSendTwoFactorCode,
  useSetTwoFactorEmail,
  useVerifyTwoFactorCode,
} from "@/shared/api/queries";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const emailSchema = z.string().email();

type TwoFactor = { email: string | null; verified: boolean };

export function TotpSettings({ twoFactor }: { twoFactor: TwoFactor }) {
  const t = useTranslations("twoFactor");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState(twoFactor.email ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const setEmailMutation = useSetTwoFactorEmail();
  const sendCode = useSendTwoFactorCode();
  const verifyCode = useVerifyTwoFactorCode();
  const disable = useDisableTwoFactor();

  const begin = () => {
    setEmail(twoFactor.email ?? "");
    setCode("");
    setError("");
    setStep(1);
    setOpen(true);
  };

  const submitEmail = async () => {
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setError(t("invalidEmail"));
      return;
    }
    setError("");
    await setEmailMutation.mutateAsync({ email: parsed.data });
    setEmail(parsed.data);
    setStep(2);
  };

  const send = async () => {
    await sendCode.mutateAsync({ email });
    toast.success(t("sendCode"));
    setStep(3);
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError(t("codeHint"));
      return;
    }
    const result = await verifyCode.mutateAsync({ email, code });
    if (result.ok) {
      toast.success(t("verified"));
      setOpen(false);
      return;
    }
    setError(
      result.reason === "expired"
        ? t("codeExpired")
        : result.reason === "too-many-attempts"
          ? t("tooManyAttempts")
          : t("codeMismatch"),
    );
  };

  const onDisable = async () => {
    await disable.mutateAsync();
    toast.success(t("disabled"));
  };

  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">{t("enabled")}</AppText>
          {twoFactor.email && (
            <p className="mt-1 text-xs text-[var(--text-secondary)] _num">{twoFactor.email}</p>
          )}
        </div>
        <Badge tone={twoFactor.verified ? "ok" : "warn"}>
          {twoFactor.verified ? t("verified") : t("notVerified")}
        </Badge>
      </CardHeader>
      <CardBody className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">{t("emailHint")}</p>
        <div className="flex justify-end gap-2">
          <Button variant="primary" onClick={begin}>
            {twoFactor.verified ? t("updateEmail") : t("enable")}
          </Button>
          {twoFactor.verified && (
            <Button variant="ghost" onClick={onDisable} disabled={disable.isPending}>
              {t("disable")}
            </Button>
          )}
        </div>
      </CardBody>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent ariaLabel={t("enable")}>
          <DialogHeader>
            <DialogTitle>{t("enable")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-xs text-[var(--text-secondary)]">
              <Numeric value={`Step ${step} of 3`} />
            </div>
            {step === 1 && (
              <div>
                <Label htmlFor="two-factor-email">{t("email")}</Label>
                <Input
                  id="two-factor-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  className="mt-2"
                  autoComplete="email"
                />
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{t("emailHint")}</p>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-secondary)]">{t("emailHint")}</p>
                <p className="font-medium _num">{email}</p>
                <Button variant="primary" className="w-full" onClick={send} disabled={sendCode.isPending}>
                  {t("sendCode")}
                </Button>
              </div>
            )}
            {step === 3 && (
              <div>
                <Label htmlFor="two-factor-code">{t("code")}</Label>
                <Input
                  id="two-factor-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  className="mt-2 font-mono tracking-[0.4em]"
                />
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{t("codeHint")}</p>
              </div>
            )}
            {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
          </div>
          <DialogFooter>
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep((current) => (current - 1) as 1 | 2 | 3)}>
                {t("back")}
              </Button>
            )}
            {step === 1 && (
              <Button variant="primary" onClick={submitEmail} disabled={setEmailMutation.isPending}>
                {t("submit")}
              </Button>
            )}
            {step === 3 && (
              <>
                <Button variant="ghost" onClick={send} disabled={sendCode.isPending}>
                  {t("resend")}
                </Button>
                <Button variant="primary" onClick={verify} disabled={verifyCode.isPending || code.length !== 6}>
                  {t("verify")}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export { emailSchema };
