"use client";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Languages, LayoutDashboard, LogOut, Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminProfile, logout } from "@/shared/api/queries";
import { useSwitchLocale } from "@/shared/i18n/useSwitchLocale";

export function AdminProfileMenu({ children }: { children: React.ReactNode }) {
  const t = useTranslations("adminMenu");
  const profile = useAdminProfile();
  const { setTheme } = useTheme();
  const router = useRouter();
  const { switchTo } = useSwitchLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[220px]">
        {profile.data && (
          <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">
            <div className="truncate font-medium text-[var(--text-primary)]">{profile.data.name}</div>
            <div className="truncate _num">{profile.data.email}</div>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/admin/account")}>
          <LayoutDashboard size={16} />
          {t("account")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/admin/system-states")}>
          <Monitor size={16} />
          {t("systemStatus")}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun size={16} />
            {t("theme")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => setTheme("light")}>
              <Sun size={16} />
              {t("themeLight")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("dark")}>
              <Moon size={16} />
              {t("themeDark")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTheme("system")}>
              <Monitor size={16} />
              {t("themeSystem")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages size={16} />
            {t("language")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={() => switchTo("en")}>
              {t("langEn")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => switchTo("ar")}>
              {t("langAr")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()}>
          <LogOut size={16} />
          {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}