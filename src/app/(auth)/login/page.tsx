"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";
import { api } from "@/shared/api/client";

export default function LoginPage() {
  const t = useTranslations("login");
  const tc = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const [email, setEmail] = useState("admin@oneai.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Gate theme-dependent UI behind a client mount so SSR and CSR agree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const submit = async () => {
    try {
      const account = await api.get("account");
      if (account.twoFactor.verified) {
        // 2FA is on — push to the email-code verification page after a
        // credentials check. The mock accepts any password here, but we
        // still gate on the password length so the demo doesn't feel broken.
        if (password.length < 1) {
          setError(t("subtitle"));
          return;
        }
        router.push(`/${locale}/login/verify`);
        return;
      }
      // No 2FA — issue the session and go straight to admin.
      document.cookie = `admin_session=${encodeURIComponent(
        JSON.stringify({
          email,
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        }),
      )}; path=/; SameSite=Strict;`;
      router.push(`/${locale}/admin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("subtitle"));
    }
  };

  const toggleDir = () => {
    const next = locale === "ar" ? "en" : "ar";
    router.push(`/${next}/login`);
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
            <h1 className="text-base font-medium">{t("title")}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="pw">{t("password")}</Label>
              <Input
                id="pw"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>
            {error && (
              <p className="text-sm text-[var(--danger-text)]">{error}</p>
            )}
            <Button
              variant="primary"
              className="h-11 w-full"
              onClick={submit}
            >
              {t("continue")}
            </Button>
            <p className="text-center text-xs text-[var(--text-secondary)]">{t("demoHint")}</p>
          </CardBody>
        </Card>
        <div className="mt-5 flex justify-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleDir}>
            <Globe size={14} className="me-1" />
            {locale === "ar" ? "EN" : "AR"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            suppressHydrationWarning
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun size={14} className="me-1" />
            ) : (
              <Moon size={14} className="me-1" />
            )}
            {mounted && resolvedTheme === "dark" ? tc("open") : "Dark"}
          </Button>
        </div>
      </div>
    </div>
  );
}