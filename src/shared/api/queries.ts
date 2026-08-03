"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type {
  ModelConfig,
  QuotaHistoryEntry,
  QuotaOverride,
  SupportReply,
  TierConfig,
  UnitPricingConfig,
  UsageVisibility,
  UserStatus,
  Tier,
  UserSummary,
} from "@/shared/api/types";

export const qk = {
  overview: ["overview"] as const,
  users: ["users"] as const,
  user: (id: string) => ["user", id] as const,
  revenue: ["revenue"] as const,
  usage: ["usage"] as const,
  providers: ["providers"] as const,
  tickets: ["tickets"] as const,
  ticket: (id: string) => ["ticket", id] as const,
  ticketReplies: (id: string) => ["ticket", id, "replies"] as const,
  configModels: ["config-models"] as const,
  configTiers: ["config-tiers"] as const,
  planDefaults: ["plan-defaults"] as const,
  audit: ["audit"] as const,
  account: ["account"] as const,
  adminProfile: ["admin-profile"] as const,
  usageVisibility: ["usage-visibility"] as const,
  legalTerms: ["legal", "terms"] as const,
  legalPrivacy: ["legal", "privacy"] as const,
  unitPricing: ["unit-pricing"] as const,
};

export const useOverview = () => useQuery({ queryKey: qk.overview, queryFn: () => api.get("overview") });
export const useUsers = () => useQuery({ queryKey: qk.users, queryFn: () => api.get("users") });
export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; email: string; tier: Tier; status: UserStatus }) =>
      api.createUser(payload),
    onSuccess: (user: UserSummary) => {
      qc.invalidateQueries({ queryKey: qk.users });
      qc.setQueryData<UserSummary[]>(qk.users, (current) => {
        const list = current ?? [];
        if (list.some((u) => u.id === user.id)) return list;
        return [user, ...list];
      });
    },
  });
};

export const useUser = (id: string) => useQuery({ queryKey: qk.user(id), queryFn: () => api.get("userDetail", id) });
export const useRevenue = () => useQuery({ queryKey: qk.revenue, queryFn: () => api.get("revenue") });
export const useUsage = () => useQuery({ queryKey: qk.usage, queryFn: () => api.get("usage") });
export const useProviders = () => useQuery({ queryKey: qk.providers, queryFn: () => api.get("providers") });
export const useTickets = () => useQuery({ queryKey: qk.tickets, queryFn: () => api.get("tickets") });
export const useTicket = (id: string) => useQuery({ queryKey: qk.ticket(id), queryFn: () => api.get("ticketDetail", id) });
export const useConfigModels = () => useQuery({ queryKey: qk.configModels, queryFn: () => api.get("configModels") });
export const useConfigTiers = () => useQuery({ queryKey: qk.configTiers, queryFn: () => api.get("configTiers") });
export const usePlanDefaults = () => useQuery({ queryKey: qk.planDefaults, queryFn: () => api.get("planDefaults") });
export const useAudit = () => useQuery({ queryKey: qk.audit, queryFn: () => api.get("audit") });
export const useAccount = () =>
  useQuery({
    queryKey: qk.account,
    queryFn: async () => {
      const [account, response] = await Promise.all([
        api.get("account"),
        fetch("/api/auth/account", { cache: "no-store" }),
      ]);
      if (!response.ok) throw new Error("Administrator session expired.");
      const auth = (await response.json()) as {
        user: { id: string; email: string; name: string };
        sessions: {
          id: string;
          lastUsedAt: string;
          current: boolean;
          userAgent?: string;
          ipAddress?: string;
        }[];
      };
      return {
        ...account,
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        sessions: auth.sessions.map((session) => ({
          id: session.id,
          device: session.userAgent ?? "Unknown device",
          location: "—",
          ip: session.ipAddress ?? "—",
          lastActiveAt: session.lastUsedAt,
          current: session.current,
        })),
      };
    },
  });
export const useTotpSecret = () =>
  useQuery({
    queryKey: [...qk.account, "totp-secret"] as const,
    queryFn: () => api.get("totpSecret"),
    staleTime: Infinity,
  });
export const useSupportQueue = useTickets;

export const useAdminProfile = () =>
  useQuery({ queryKey: qk.adminProfile, queryFn: () => api.get("adminProfile") });

export const useUsageVisibility = () =>
  useQuery({ queryKey: qk.usageVisibility, queryFn: () => api.get("usageVisibility") });

export const useSetUsageVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (next: UsageVisibility) => api.setUsageVisibility(next),
    onSuccess: (data) => {
      qc.setQueryData(qk.usageVisibility, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useLegalTerms = () =>
  useQuery({ queryKey: qk.legalTerms, queryFn: () => api.get("legalTerms") });

export const useLegalPrivacy = () =>
  useQuery({ queryKey: qk.legalPrivacy, queryFn: () => api.get("legalPrivacy") });

export const useSaveLegalVersion = (docType: "terms" | "privacy") => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string; summary: string; createdBy: string; reason: string }) =>
      api.saveLegalVersion(docType, payload),
    onSuccess: (data) => {
      qc.setQueryData(docType === "terms" ? qk.legalTerms : qk.legalPrivacy, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useRestoreLegalVersion = (docType: "terms" | "privacy") => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { versionId: string; actor: string; reason: string }) =>
      api.restoreLegalVersion(docType, payload.versionId, payload.actor, payload.reason),
    onSuccess: (data) => {
      qc.setQueryData(docType === "terms" ? qk.legalTerms : qk.legalPrivacy, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useDeleteLegalVersion = (docType: "terms" | "privacy") => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { versionId: string; actor: string; reason: string }) =>
      api.deleteLegalVersion(docType, payload.versionId, payload.actor, payload.reason),
    onSuccess: (data) => {
      qc.setQueryData(docType === "terms" ? qk.legalTerms : qk.legalPrivacy, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useTicketReplies = (id: string) =>
  useQuery({
    queryKey: qk.ticketReplies(id),
    queryFn: () => api.get("ticketReplies", id),
    enabled: Boolean(id),
  });

export const usePostReply = (ticketId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string; actor: string }) => api.postReply(ticketId, payload.body, payload.actor),
    onSuccess: (data: SupportReply) => {
      const existing = qc.getQueryData<SupportReply[]>(qk.ticketReplies(ticketId)) ?? [];
      qc.setQueryData<SupportReply[]>(qk.ticketReplies(ticketId), [...existing, data]);
      qc.invalidateQueries({ queryKey: qk.tickets });
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useCloseTicket = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ticketId: string; actor: string; reason: string }) =>
      api.closeTicket(payload.ticketId, payload.actor, payload.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tickets });
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useUpdateTiers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { tiers: TierConfig[]; actor: string; reason: string }) =>
      api.updateConfigTiers(payload.tiers, payload.actor, payload.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.configTiers });
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useUpdateModels = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { models: ModelConfig[]; actor: string; reason: string }) =>
      api.updateConfigModels(payload.models, payload.actor, payload.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.configModels });
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useSetTotpEnabled = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { enabled: boolean; actor?: string }) =>
      api.setTotpEnabled(payload.enabled, payload.actor ?? "admin@oneai.app"),
    onSuccess: (data) => {
      qc.setQueryData(qk.account, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { sessionId: string; actor?: string }) => {
      const response = await fetch(`/api/auth/sessions/${encodeURIComponent(payload.sessionId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Unable to revoke session.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.account });
    },
  });
};

export const useRevokeAllOtherSessions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/sessions/revoke-others", { method: "POST" });
      if (!response.ok) throw new Error("Unable to revoke other sessions.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.account });
    },
  });
};

export const useSendTwoFactorCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string }) => api.sendTwoFactorCode(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useVerifyTwoFactorCode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; code: string }) =>
      api.verifyTwoFactorCode(payload),
    onSuccess: (data) => {
      if (data.ok) {
        qc.invalidateQueries({ queryKey: qk.account });
        qc.invalidateQueries({ queryKey: qk.audit });
      }
    },
  });
};

export const useSetTwoFactorEmail = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string }) => api.setTwoFactorEmail(payload),
    onSuccess: (data) => {
      qc.setQueryData(qk.account, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useDisableTwoFactor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.disableTwoFactor(),
    onSuccess: (data) => {
      qc.setQueryData(qk.account, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

/** Revoke the backend session, clear HttpOnly cookies, and return to login. */
export function logout() {
  if (typeof document !== "undefined") {
    void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      window.location.href = "/login";
    });
  }
}

export const useUnitPricing = () =>
  useQuery({ queryKey: qk.unitPricing, queryFn: () => api.get("unitPricing") });

export const useUpdateUnitPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      requestUnit?: { size: number; priceUsd: number; enabled: boolean };
      tokenUnit?: { size: number; priceUsd: number; enabled: boolean };
      reason: string;
      actor?: string;
    }) =>
      api.updateUnitPricing(
        {
          requestUnit: payload.requestUnit,
          tokenUnit: payload.tokenUnit,
          reason: payload.reason,
        },
        payload.actor ?? "admin@oneai.app",
      ),
    onSuccess: (data: UnitPricingConfig) => {
      qc.setQueryData(qk.unitPricing, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useSetUserStatus = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { status: UserStatus; reason: string; actor?: string }) =>
      api.suspendUser(userId, payload.status, payload.reason, payload.actor ?? "admin@oneai.app"),
    onSuccess: (user: UserSummary) => {
      qc.setQueryData<UserSummary[]>(qk.users, (current) =>
        current?.map((item) => (item.id === user.id ? { ...item, ...user } : item)),
      );
      qc.invalidateQueries({ queryKey: qk.user(userId) });
      qc.invalidateQueries({ queryKey: qk.users });
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useGrantUserQuota = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { amount: number; reason: string; actor?: string }) =>
      api.grantUserQuota(userId, payload.amount, payload.reason, payload.actor ?? "admin@oneai.app"),
    onSuccess: ({ user, entry }: { user: UserSummary; entry: QuotaHistoryEntry }) => {
      qc.setQueryData<UserSummary[]>(qk.users, (current) =>
        current?.map((item) => (item.id === user.id ? { ...item, ...user } : item)),
      );
      qc.setQueryData(qk.user(userId), (current: Record<string, unknown> | undefined) => ({
        ...current,
        ...user,
        quotaHistory: [entry, ...((current?.quotaHistory as QuotaHistoryEntry[] | undefined) ?? [])],
      }));
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useSetUserQuotaOverride = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { override: Omit<QuotaOverride, "setAt">; actor?: string }) =>
      api.setUserQuotaOverride(userId, payload.override, payload.actor ?? "admin@oneai.app"),
    onSuccess: ({ user, override }: { user: UserSummary; override: QuotaOverride }) => {
      qc.setQueryData<UserSummary[]>(qk.users, (current) =>
        current?.map((item) => (item.id === user.id ? { ...item, ...user } : item)),
      );
      qc.setQueryData(qk.user(userId), (current: Record<string, unknown> | undefined) => ({
        ...current,
        ...user,
        quotaOverride: override,
      }));
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useResetUserQuotaOverride = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason?: string; actor?: string } = {}) =>
      api.resetUserQuotaOverride(userId, payload.reason, payload.actor),
    onSuccess: (user: UserSummary) => {
      qc.setQueryData<UserSummary[]>(qk.users, (current) =>
        current?.map((item) => (item.id === user.id ? { ...item, ...user } : item)),
      );
      qc.invalidateQueries({ queryKey: qk.user(userId) });
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};
