"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export default function LoginPage() {
  const t = useTranslations("login");
  const tc = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      if (!response.ok) {
        throw new Error(body?.error?.message ?? t("subtitle"));
      }
      router.replace(`/${locale}/admin`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("subtitle"));
    } finally {
      setSubmitting(false);
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
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pw">{t("password")}</Label>
                <Input
                  id="pw"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2"
                  required
                />
              </div>
              {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
              <Button
                type="submit"
                variant="primary"
                className="h-11 w-full"
                disabled={submitting || !email.trim() || !password}
              >
                {t("continue")}
              </Button>
            </form>
            <p className="text-center text-xs text-[var(--text-secondary)]">
              {t("demoHint")}
            </p>
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
