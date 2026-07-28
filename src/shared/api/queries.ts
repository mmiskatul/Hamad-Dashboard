"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type {
  ModelConfig,
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
export const useAccount = () => useQuery({ queryKey: qk.account, queryFn: () => api.get("account") });
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
    mutationFn: (payload: { sessionId: string; actor?: string }) =>
      api.revokeSession(payload.sessionId, payload.actor ?? "admin@oneai.app"),
    onSuccess: (data) => {
      qc.setQueryData(qk.account, data);
      qc.invalidateQueries({ queryKey: qk.audit });
    },
  });
};

export const useRevokeAllOtherSessions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.revokeAllOtherSessions(),
    onSuccess: (data) => {
      qc.setQueryData(qk.account, data);
      qc.invalidateQueries({ queryKey: qk.audit });
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

/** Stub: clears the local admin session cookie and reloads. */
export function logout() {
  if (typeof document !== "undefined") {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = "/login";
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