"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  Boxes,
  ChevronUp,
  Cog,
  Coins,
  FileSearch,
  FileText,
  Gauge,
  Layers,
  LifeBuoy,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";
import { ReadWriteDivider } from "./ReadWriteDivider";
import { AdminProfileMenu } from "./AdminProfileMenu";
import { useDir } from "@/shared/hooks/useDir";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { useAdminProfile } from "@/shared/api/queries";
import { Numeric } from "@/components/numeric/Numeric";
import { isPathActive } from "@/shared/routing/path";

type NavItem = { href: string; labelKey: string; icon: LucideIcon };

const observeItems: NavItem[] = [
  { href: "/admin", labelKey: "overview", icon: Gauge },
  { href: "/admin/users", labelKey: "users", icon: Users },
  { href: "/admin/revenue", labelKey: "revenue", icon: Activity },
  { href: "/admin/usage", labelKey: "usage", icon: Boxes },
  { href: "/admin/providers", labelKey: "providers", icon: Layers },
];

const actItems: NavItem[] = [
  { href: "/admin/support", labelKey: "support", icon: LifeBuoy },
  { href: "/admin/config/models", labelKey: "configModels", icon: Settings },
  { href: "/admin/config/tiers", labelKey: "configTiers", icon: Cog },
  { href: "/admin/config/pricing", labelKey: "configPricing", icon: Coins },
  { href: "/admin/config/usage", labelKey: "configUsage", icon: Activity },
  { href: "/admin/legal", labelKey: "legal", icon: FileText },
  { href: "/admin/audit", labelKey: "audit", icon: FileSearch },
];

export function Sidebar({
  onNavigate,
  mobileOpen = false,
}: {
  onNavigate?: () => void;
  mobileOpen?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const dir = useDir();
  const isRtl = dir === "rtl";
  const { collapsed, isMobile, isTablet } = useSidebarState();
  const profile = useAdminProfile();

  // Mobile drawer: hidden by default, slides in when `mobileOpen`.
  const baseClasses = clsx(
    "fixed inset-y-0 z-40 flex flex-col border-e border-[var(--border-default)] bg-[var(--surface-glass)] backdrop-blur-xl backdrop-saturate-150 transition-[width,transform] duration-200",
    "supports-[backdrop-filter]:bg-[var(--surface-glass)]",
    "shadow-[inset_1px_0_0_var(--surface-glass-highlight),inset_0_1px_0_var(--surface-glass-highlight)]",
  );

  // Width classes (applied per breakpoint):
  //   mobile (<768): w-60 if mobileOpen else translate off-screen via -translate-x-full
  //   tablet (768-1279): always w-16 (icon rail) — labels hidden
  //   desktop (>=1280): w-60 when expanded, w-0 when collapsed
  const widthClasses = clsx(
    isMobile && (mobileOpen ? "flex translate-x-0 w-60" : "hidden -translate-x-full w-60"),
    !isMobile && isTablet && "hidden md:flex w-16",
    !isMobile && !isTablet && (collapsed ? "hidden xl:flex w-0 overflow-hidden" : "hidden xl:flex w-60"),
  );

  const showLabels = !isTablet;

  return (
    <aside
      data-dir={dir}
      className={clsx(baseClasses, widthClasses)}
      style={{ insetInlineStart: 0 }}
    >
      <div className="flex h-[60px] items-center gap-3 px-5">
        <Image
          src="/brand/logo-mark.svg"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-[var(--radius-sm)]"
        />
        {showLabels && (
          <span className="text-sm font-bold tracking-tight">{t("brand")}</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {showLabels && (
          <p className="_t-label mb-2 px-3 text-[var(--text-secondary)]">{t("observe")}</p>
        )}
        {observeItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onNavigate}
            t={t}
            compact={!showLabels}
          />
        ))}

        {showLabels && <ReadWriteDivider />}

        {showLabels && (
          <p className="_t-label mb-2 px-3 text-[var(--text-secondary)]">{t("act")}</p>
        )}
        {actItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onNavigate}
            t={t}
            compact={!showLabels}
          />
        ))}
      </nav>

      <div className="border-t border-[var(--border-default)] p-3">
        <AdminFooter
          profile={profile.data}
          dir={dir}
          isRtl={isRtl}
          compact={!showLabels}
        />
        {showLabels && (
          <p
            className="mt-3 px-3 text-[11px] text-[var(--text-secondary)]"
            style={{ direction: isRtl ? "rtl" : "ltr" }}
          >
            v<Numeric value="2.0" /> · {isRtl ? "RTL" : "LTR"}
          </p>
        )}
      </div>
    </aside>
  );
}

function AdminFooter({
  profile,
  isRtl,
  compact,
}: {
  profile: ReturnType<typeof useAdminProfile>["data"];
  dir: string;
  isRtl: boolean;
  compact: boolean;
}) {
  if (!profile) return null;
  return (
    <div className="mt-2">
      <AdminProfileMenu>
        <button
          type="button"
          aria-label="Open admin menu"
          title={profile.name}
          className={clsx(
            "flex w-full items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)]/55 px-3 py-2 text-start text-sm transition hover:bg-[var(--bg-subtle)]",
            compact && "justify-center px-2",
          )}
        >
          <Image
            src={profile.avatarUrl}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full border border-[var(--border-default)]"
          />
          {!compact && (
            <span className="grow truncate">
              <span className="block truncate font-medium text-[var(--text-primary)]">{profile.name}</span>
              <span className="block truncate text-xs text-[var(--text-secondary)] _num">{profile.email}</span>
            </span>
          )}
          {!compact && (
            <ChevronUp
              size={14}
              aria-hidden
              style={{ transform: isRtl ? "rotate(180deg)" : undefined }}
            />
          )}
        </button>
      </AdminProfileMenu>
    </div>
  );
}

function SidebarLink({
  item,
  pathname,
  onClick,
  t,
  compact,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
  t: ReturnType<typeof useTranslations<"nav">>;
  compact: boolean;
}) {
  const Icon = item.icon;
  // Robust segment-based active-link matcher. Strips locale prefix and
  // uses whole-segment equality so e.g. `/admin/usage` no longer lights
  // up when the user is on `/admin/config/usage`, and nested routes
  // like `/admin/support/[id]` correctly highlight their parent.
  const active = isPathActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={compact ? t(`items.${item.labelKey}`) : undefined}
      className={clsx(
        "mb-0.5 flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium",
        compact && "justify-center px-2",
        active
          ? "bg-[var(--action-primary-transparent)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]",
      )}
    >
      <Icon aria-hidden="true" className="shrink-0" size={18} />
      {!compact && <span>{t(`items.${item.labelKey}`)}</span>}
    </Link>
  );
}