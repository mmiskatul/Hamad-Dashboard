"use client";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useSidebarState } from "@/shared/hooks/useSidebarState";
import { Button } from "@/components/ui/button";

export function SidebarToggle({ onMobile }: { onMobile?: () => void }) {
  const t = useTranslations("common");
  const { collapsed, toggle } = useSidebarState();
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <Button
        variant="outline"
        size="icon"
        aria-label={t("toggleSidebar")}
        onClick={onMobile}
      >
        <Menu size={16} />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={t("toggleSidebar")}
      onClick={toggle}
    >
      {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
    </Button>
  );
}