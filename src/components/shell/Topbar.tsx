"use client";
import { useEffect, useState } from "react";
import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Numeric } from "@/components/numeric/Numeric";
import { formatDate } from "@/shared/lib/format";
import { useSwitchLocale } from "@/shared/i18n/useSwitchLocale";
import type { AppLocale } from "@/shared/i18n/config";
import { buildBreadcrumbs } from "@/shared/routing/path";
import { SidebarToggle } from "./SidebarToggle";

const crumbLabels: Record<string, string> = {
  admin: "Overview",
  users: "Users",
  revenue: "Revenue",
  usage: "AI Usage & Cost",
  providers: "Providers",
  support: "Support",
  config: "Configuration",
  models: "Model Configuration",
  tiers: "Tiers & Quotas",
  audit: "Audit Log",
  legal: "Legal",
  account: "Admin Account",
  "system-states": "System States",
};

export function Topbar({ onMobileSidebar }: { onMobileSidebar?: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname() ?? "/";
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common");
  const { switchTo } = useSwitchLocale();

  // Gate theme- and time-dependent UI behind a client mount so the
  // server-rendered HTML matches the first client paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Build the breadcrumb from the locale-stripped path segments. The
  // shared helper decodes URI components and humanizes dynamic leaf
  // segments so e.g. `/admin/support/abc-123` doesn't lose its leaf.
  const crumbs = buildBreadcrumbs(pathname, crumbLabels, {
    humanizeLeaves: true,
  });

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const toggleDir = () => {
    const next: AppLocale = locale === "ar" ? "en" : "ar";
    switchTo(next);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--bg-canvas)]/85 px-5 py-3 backdrop-blur">
      <SidebarToggle onMobile={onMobileSidebar} />
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-2">
            {i > 0 && <span className="opacity-50">/</span>}
            <span className={i === crumbs.length - 1 ? "font-medium text-[var(--text-primary)]" : undefined}>
              {c.label}
            </span>
          </span>
        ))}
      </div>
      <div className="grow" />
      <div className="hidden w-72 md:block">
        <Input placeholder={t("search")} className="h-9" />
      </div>
      <Button variant="outline" size="icon" aria-label={t("toggleDir")} onClick={toggleDir}>
        <Globe size={16} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={t("toggleTheme")}
        onClick={toggleTheme}
        suppressHydrationWarning
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )}
      </Button>
      <span
        className="hidden text-sm text-[var(--text-secondary)] md:inline"
        suppressHydrationWarning
      >
        {mounted ? <Numeric value={formatDate(new Date())} /> : <Numeric value="" />}
      </span>
    </header>
  );
}
