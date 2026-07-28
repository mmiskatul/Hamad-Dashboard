"use client";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForbiddenState } from "@/features/system-states/ForbiddenState";
import { ErrorState } from "@/features/system-states/ErrorState";
import { MaintenanceState } from "@/features/system-states/MaintenanceState";
import { EmptyStatePage } from "@/features/system-states/EmptyStatePage";
import { OfflineState } from "@/features/system-states/OfflineState";

export default function SystemStatesPage() {
  const t = useTranslations("systemStates");
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>
      <Tabs defaultValue="forbidden">
        <TabsList>
          <TabsTrigger value="forbidden">{t("tabs.forbidden")}</TabsTrigger>
          <TabsTrigger value="error">{t("tabs.error")}</TabsTrigger>
          <TabsTrigger value="maintenance">{t("tabs.maintenance")}</TabsTrigger>
          <TabsTrigger value="empty">{t("tabs.empty")}</TabsTrigger>
          <TabsTrigger value="offline">{t("tabs.offline")}</TabsTrigger>
        </TabsList>
        <TabsContent value="forbidden"><ForbiddenState /></TabsContent>
        <TabsContent value="error"><ErrorState /></TabsContent>
        <TabsContent value="maintenance"><MaintenanceState /></TabsContent>
        <TabsContent value="empty"><EmptyStatePage /></TabsContent>
        <TabsContent value="offline"><OfflineState /></TabsContent>
      </Tabs>
    </div>
  );
}