"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLegalPrivacy, useLegalTerms } from "@/shared/api/queries";
import { LegalEditorCard } from "@/components/legal/LegalEditorCard";
import { VersionHistoryPanel } from "@/components/legal/VersionHistoryPanel";

export default function LegalPage() {
  const t = useTranslations("legal");
  const termsSubtitle = useTranslations("legalPages")("termsSubtitle");
  const privacySubtitle = useTranslations("legalPages")("privacySubtitle");
  const terms = useLegalTerms();
  const privacy = useLegalPrivacy();

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border-default)] pb-5">
        <h1 className="_t-page">{t("title.heading")}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="terms" className="space-y-1">
        <TabsList aria-label={t("title.heading")}>
          <TabsTrigger value="terms">{t("tabs.terms")}</TabsTrigger>
          <TabsTrigger value="privacy">{t("tabs.privacy")}</TabsTrigger>
        </TabsList>

        <TabsContent value="terms">
          <p className="mb-5 text-sm text-[var(--text-secondary)]">{termsSubtitle}</p>
          {terms.data && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
              <LegalEditorCard docType="terms" doc={terms.data} />
              <VersionHistoryPanel docType="terms" doc={terms.data} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="privacy">
          <p className="mb-5 text-sm text-[var(--text-secondary)]">{privacySubtitle}</p>
          {privacy.data && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
              <LegalEditorCard docType="privacy" doc={privacy.data} />
              <VersionHistoryPanel docType="privacy" doc={privacy.data} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
