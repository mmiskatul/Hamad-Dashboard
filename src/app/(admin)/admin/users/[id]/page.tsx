"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAdminProfile, useAudit, useConfigTiers, useUser } from "@/shared/api/queries";
import { QuotaCard } from "@/features/user-detail/QuotaCard";
import { ModelDistribution } from "@/features/user-detail/ModelDistribution";
import { TicketHistory } from "@/features/user-detail/TicketHistory";
import { PrivacyNotice } from "@/features/user-detail/PrivacyNotice";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserHeader } from "@/components/user-detail/UserHeader";
import { MemoryCard } from "@/components/user-detail/MemoryCard";
import { PaymentHistory } from "@/components/user-detail/PaymentHistory";
import { QuotaHistory } from "@/components/user-detail/QuotaHistory";
import { ActionTimeline } from "@/components/user-detail/ActionTimeline";
import { RenewalCard } from "@/components/user-detail/RenewalCard";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import { formatCurrency, formatDate, formatPhone } from "@/shared/lib/format";
import { Numeric } from "@/components/numeric/Numeric";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { SuspendUserModal } from "@/components/modals/SuspendUserModal";
import { GrantTokensModal, type GrantTokensInput } from "@/components/modals/GrantTokensModal";
import { QuotaOverrideCard } from "@/components/user-detail/QuotaOverrideCard";
import type { QuotaHistoryEntry, QuotaOverride } from "@/shared/api/types";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("userDetail");
  const tc = useTranslations("common");
  const user = useUser(params.id);
  const audit = useAudit();
  const adminProfile = useAdminProfile();
  const tiersQuery = useConfigTiers();
  const suspend = useDisclosure();
  const grantTokens = useDisclosure();
  const [tab, setTab] = useState("overview");
  const [grantedEntries, setGrantedEntries] = useState<QuotaHistoryEntry[]>([]);
  const [quotaOverride, setQuotaOverride] = useState<QuotaOverride | null>(null);

  const data = user.data;

  const isAdmin = adminProfile.data !== undefined && adminProfile.data !== null;
  const userTierConfig = (tiersQuery.data ?? []).find((c) => c.id === data?.tier);
  const extensionsAllowedForTier = (() => {
    if (!data) return false;
    // FREE tier cannot receive quota extensions by configuration.
    if (data.tier === "free") return false;
    // If tier has no token limit configured (0 / undefined), disallow.
    if (userTierConfig && (userTierConfig.tokensLimit ?? 0) <= 0) return false;
    return true;
  })();

  const mergedHistory = useMemo<QuotaHistoryEntry[]>(() => {
    const fromServer = data?.quotaHistory ?? [];
    return [...grantedEntries, ...fromServer];
  }, [grantedEntries, data?.quotaHistory]);

  const totalGranted = useMemo(
    () => grantedEntries.reduce((sum, e) => sum + e.amount, 0),
    [grantedEntries],
  );
  const effectiveRequestsLimit = (data?.requestsLimit ?? 0) + totalGranted;

  const handleGrantSubmit = ({ amount, reason }: GrantTokensInput) => {
    if (!data) return;
    const actor =
      adminProfile.data?.name ?? adminProfile.data?.email ?? "admin@oneai.app";
    const newTotal = effectiveRequestsLimit + amount;
    const entry: QuotaHistoryEntry = {
      date: new Date().toISOString(),
      amount,
      by: actor,
      reason: reason || t("grantTokensNoReason"),
      newTotal,
    };
    setGrantedEntries((prev) => [entry, ...prev]);
  };

  const userAudit = (audit.data ?? []).filter((e) => e.target === data?.id);
  const jsonTimeline = data?.actionTimeline ?? [];
  const mergedTimeline = [...jsonTimeline, ...userAudit].sort((a, b) => {
    const ta = "ts" in a ? a.ts : a.at;
    const tb = "ts" in b ? b.ts : b.at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] pb-5">
        <div>
          <h1 className="_t-page">{t("title")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => suspend.open()}>{t("suspend")}</Button>
        </div>
      </div>

      {!data ? (
        <div className="text-sm text-[var(--text-secondary)]">{tc("loading")}</div>
      ) : (
        <>
          <UserHeader user={data} />
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
              <TabsTrigger value="quota">{t("tabs.quota")}</TabsTrigger>
              <TabsTrigger value="models">{t("tabs.models")}</TabsTrigger>
              <TabsTrigger value="payments">{t("tabs.payments")}</TabsTrigger>
              <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <QuotaCard
                  requestsUsed={data.requestsUsed}
                  requestsLimit={data.requestsLimit}
                  costUsd={data.costUsd}
                />
                <Card>
                  <CardBody className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">{t("meta.spend")}</span>
                      <Numeric value={formatCurrency(data.costUsd)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                        {t("meta.tokens")}
                        <GlossaryTooltip term="token" />
                      </span>
                      <Numeric value={data.tokensSpent} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">{t("signupSource")}</span>
                      <Numeric value={data.signupSource ?? "—"} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">{t("meta.platform")}</span>
                      <Numeric value={data.platform} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">{t("meta.mobile")}</span>
                      <Numeric
                        value={data.mobile ? formatPhone(data.mobile) : "—"}
                        className={data.mobile ? undefined : "text-[var(--text-secondary)]"}
                      />
                    </div>
                  </CardBody>
                </Card>
                <RenewalCard renewals={data.renewals ?? []} />
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <MemoryCard memory={data.memory ?? { count: 0, bytesUsed: 0, lastUpdatedAt: data.lastActiveAt, topCategories: [] }} />
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-medium">{t("recentPayments")}</h3>
                  </CardHeader>
                  <CardBody className="space-y-2 text-sm">
                    {(data.paymentHistory ?? []).slice(0, 4).map((p, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-[var(--text-secondary)] _num">{formatDate(p.date)}</span>
                        <Numeric value={formatCurrency(p.amountUsd)} />
                      </div>
                    ))}
                    {(data.paymentHistory ?? []).length === 0 && (
                      <p className="text-[var(--text-secondary)]">{t("noPayments")}</p>
                    )}
                  </CardBody>
                </Card>
              </div>
              <ModelDistribution data={data.modelDistribution} />
              <TicketHistory ticketIds={data.ticketIds} />
              <PrivacyNotice />
            </TabsContent>

            <TabsContent value="quota" className="space-y-5">
              <QuotaCard
                requestsUsed={data.requestsUsed}
                requestsLimit={effectiveRequestsLimit}
                costUsd={data.costUsd}
              />
              {isAdmin && (
                <div className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
                  {extensionsAllowedForTier ? (
                    <>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {t("grantTokensDescription")}
                      </div>
                      <Button
                        variant="primary"
                        onClick={() => grantTokens.open()}
                        data-testid="grant-tokens-open"
                      >
                        {t("grantTokensAction")}
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-[var(--text-secondary)]">
                      {t("grantTokensNotAllowed", { tier: data.tier })}
                    </div>
                  )}
                </div>
              )}
              {isAdmin && (
                <QuotaOverrideCard
                  current={quotaOverride}
                  actorName={
                    adminProfile.data?.name ?? adminProfile.data?.email ?? "admin@oneai.app"
                  }
                  onSave={setQuotaOverride}
                  onReset={() => setQuotaOverride(null)}
                />
              )}
              <QuotaHistory entries={mergedHistory} />
            </TabsContent>

            <TabsContent value="models" className="space-y-5">
              <ModelDistribution data={data.modelDistribution} />
            </TabsContent>

            <TabsContent value="payments" className="space-y-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
                <PaymentHistory entries={data.paymentHistory ?? []} />
                <RenewalCard renewals={data.renewals ?? []} />
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-5">
              <ActionTimeline entries={mergedTimeline} />
            </TabsContent>
          </Tabs>
        </>
      )}

      <SuspendUserModal
        open={suspend.isOpen}
        onOpenChange={suspend.toggle}
        isSuspended={data?.status === "suspended"}
        onSubmit={() => {}}
      />
      <GrantTokensModal
        open={grantTokens.isOpen}
        onOpenChange={grantTokens.toggle}
        onSubmit={handleGrantSubmit}
        defaultAmount={500}
      />
    </div>
  );
}