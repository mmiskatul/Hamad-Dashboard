"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import {
  useSendTwoFactorCode,
  useVerifyTwoFactorCode,
} from "@/shared/api/queries";

const DEMO_CODE = "123456";

export default function LoginVerifyPage() {
  const t = useTranslations("twoFactor");
  const tc = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const sendCode = useSendTwoFactorCode();
  const verifyCode = useVerifyTwoFactorCode();

  // Kick off a code send on mount so a 6-digit code is always in the cache.
  // The demo code is hard-coded to `DEMO_CODE` below for the on-screen hint;
  // the actual verification accepts whatever the cache holds (which, in
  // practice, is a freshly generated 6-digit number).
  useEffect(() => {
    void sendCode.mutateAsync({ email: email || "admin@oneai.app" }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError(t("codeHint"));
      return;
    }
    const targetEmail = email || "admin@oneai.app";
    const result = await verifyCode.mutateAsync({ email: targetEmail, code });
    if (result.ok) {
      document.cookie = `admin_session=${encodeURIComponent(
        JSON.stringify({
          email: targetEmail,
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        }),
      )}; path=/; SameSite=Strict;`;
      router.push(`/${locale}/admin`);
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

  const resend = () => {
    setError("");
    void sendCode.mutateAsync({ email: email || "admin@oneai.app" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-[var(--radius-sm)]"
          />
          <span className="text-lg font-bold">{tc("brand")}</span>
        </div>
        <Card>
          <CardBody className="space-y-4">
            <h1 className="text-base font-medium">{t("loginVerifyTitle")}</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {t("loginVerifyBody", { code: DEMO_CODE })}
            </p>
            <div>
              <Label htmlFor="login-2fa-email">{t("email")}</Label>
              <Input
                id="login-2fa-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="login-2fa-code">{t("codeLabel")}</Label>
              <Input
                id="login-2fa-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                className="mt-2 font-mono tracking-[0.4em]"
              />
            </div>
            {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
            <Button
              variant="primary"
              className="w-full"
              onClick={submit}
              disabled={verifyCode.isPending}
            >
              {t("submit")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={resend}
              disabled={sendCode.isPending}
            >
              {t("resend")}
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}