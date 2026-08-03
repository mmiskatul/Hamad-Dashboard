import { adminProjection } from '@/shared/lib/privacy';
import type {
  AuditEntry,
  AdminAccount,
  AdminProfile,
  LegalDoc,
  ModelConfig,
  ModelId,
  OverviewStats,
  ProviderHealth,
  QuotaHistoryEntry,
  QuotaOverride,
  RevenueData,
  SupportReply,
  Tier,
  TierConfig,
  Ticket,
  TicketDetail,
  UnitConfig,
  UnitPricingConfig,
  UnitPricingHistoryEntry,
  UsageData,
  UsageVisibility,
  UserDetail,
  UserSummary,
} from './types';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1'
).replace(/\/$/, '');

type PathMap = {
  overview: () => Promise<OverviewStats>;
  users: () => Promise<UserSummary[]>;
  userDetail: (id: string) => Promise<UserDetail>;
  revenue: () => Promise<RevenueData>;
  usage: () => Promise<UsageData>;
  providers: () => Promise<ProviderHealth[]>;
  tickets: () => Promise<Ticket[]>;
  ticketDetail: (id: string) => Promise<TicketDetail>;
  ticketReplies: (id: string) => Promise<SupportReply[]>;
  configModels: () => Promise<ModelConfig[]>;
  configTiers: () => Promise<TierConfig[]>;
  planDefaults: () => Promise<TierConfig[]>;
  audit: () => Promise<AuditEntry[]>;
  account: () => Promise<AdminAccount>;
  usageVisibility: () => Promise<UsageVisibility>;
  legalTerms: () => Promise<LegalDoc>;
  legalPrivacy: () => Promise<LegalDoc>;
  adminProfile: () => Promise<AdminProfile>;
  totpSecret: () => Promise<{ secret: string; otpauth: string }>;
  unitPricing: () => Promise<UnitPricingConfig>;
};

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    cache: 'no-store',
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return adminProjection((await response.json()) as T);
}

export const api = {
  get<K extends keyof PathMap>(path: K, ...args: Parameters<PathMap[K]>): ReturnType<PathMap[K]> {
    const fn = (() => {
      switch (path) {
        case 'overview': return () => requestJson<OverviewStats>('/overview');
        case 'users': return () => requestJson<UserSummary[]>('/users');
        case 'userDetail': return (id: string) => requestJson<UserDetail>(`/users/${encodeURIComponent(id)}`);
        case 'revenue': return () => requestJson<RevenueData>('/revenue');
        case 'usage': return () => requestJson<UsageData>('/usage');
        case 'providers': return () => requestJson<ProviderHealth[]>('/providers-health');
        case 'tickets': return () => requestJson<Ticket[]>('/tickets');
        case 'ticketDetail': return (id: string) => requestJson<TicketDetail>(`/tickets/${encodeURIComponent(id)}`);
        case 'ticketReplies': return (id: string) => requestJson<SupportReply[]>(`/tickets/${encodeURIComponent(id)}/replies`);
        case 'configModels': return () => requestJson<ModelConfig[]>('/config/models');
        case 'configTiers': return () => requestJson<TierConfig[]>('/config/tiers');
        case 'planDefaults': return () => requestJson<TierConfig[]>('/plan-defaults');
        case 'audit': return () => requestJson<AuditEntry[]>('/audit');
        case 'account': return () => requestJson<AdminAccount>('/account');
        case 'usageVisibility': return () => requestJson<UsageVisibility>('/usage-visibility');
        case 'legalTerms': return () => requestJson<LegalDoc>('/legal/terms');
        case 'legalPrivacy': return () => requestJson<LegalDoc>('/legal/privacy');
        case 'adminProfile': return () => requestJson<AdminProfile>('/profile');
        case 'totpSecret': return () => requestJson<{ secret: string; otpauth: string }>('/totp-secret');
        case 'unitPricing': return () => requestJson<UnitPricingConfig>('/unit-pricing');
      }
    })() as PathMap[K];
    return (fn as (...a: Parameters<PathMap[K]>) => ReturnType<PathMap[K]>)(...(args as Parameters<PathMap[K]>));
  },

  async setTotpEnabled(enabled: boolean, actor = 'admin@oneai.app'): Promise<AdminAccount> {
    return requestJson<AdminAccount>('/totp-enabled', { method: 'POST', body: JSON.stringify({ enabled, actor }) });
  },

  async sendTwoFactorCode(payload: { email: string }): Promise<{ ok: true }> {
    return requestJson<{ ok: true }>('/two-factor/code', { method: 'POST', body: JSON.stringify(payload) });
  },

  async verifyTwoFactorCode(payload: { email: string; code: string }): Promise<{ ok: boolean; reason?: string }> {
    return requestJson<{ ok: boolean; reason?: string }>('/two-factor/verify', { method: 'POST', body: JSON.stringify(payload) });
  },

  async setTwoFactorEmail(payload: { email: string }): Promise<AdminAccount> {
    return requestJson<AdminAccount>('/two-factor/email', { method: 'POST', body: JSON.stringify(payload) });
  },

  async disableTwoFactor(actor = 'admin@oneai.app'): Promise<AdminAccount> {
    return requestJson<AdminAccount>('/two-factor/disable', { method: 'POST', body: JSON.stringify({ actor }) });
  },

  async revokeSession(sessionId: string, actor = 'admin@oneai.app'): Promise<AdminAccount> {
    return requestJson<AdminAccount>(`/sessions/${encodeURIComponent(sessionId)}`, { method: 'DELETE', body: JSON.stringify({ actor }) });
  },

  async revokeAllOtherSessions(actor = 'admin@oneai.app'): Promise<number> {
    const result = await requestJson<{ revoked: number }>('/sessions/revoke-others', { method: 'POST', body: JSON.stringify({ actor }) });
    return result.revoked;
  },

  async setUsageVisibility(next: UsageVisibility): Promise<UsageVisibility> {
    return requestJson<UsageVisibility>('/usage-visibility', { method: 'PATCH', body: JSON.stringify(next) });
  },

  async saveLegalVersion(docType: 'terms' | 'privacy', payload: { body: string; summary: string; createdBy: string; reason: string }): Promise<LegalDoc> {
    return requestJson<LegalDoc>(`/legal/${docType}/versions`, { method: 'POST', body: JSON.stringify(payload) });
  },

  async restoreLegalVersion(docType: 'terms' | 'privacy', versionId: string, actor: string, reason: string): Promise<LegalDoc> {
    return requestJson<LegalDoc>(`/legal/${docType}/versions/${encodeURIComponent(versionId)}/restore`, { method: 'POST', body: JSON.stringify({ actor, reason }) });
  },

  async deleteLegalVersion(docType: 'terms' | 'privacy', versionId: string, actor: string, reason: string): Promise<LegalDoc> {
    return requestJson<LegalDoc>(`/legal/${docType}/versions/${encodeURIComponent(versionId)}`, { method: 'DELETE', body: JSON.stringify({ actor, reason }) });
  },

  async postReply(ticketId: string, body: string, actor: string): Promise<SupportReply> {
    return requestJson<SupportReply>(`/tickets/${encodeURIComponent(ticketId)}/replies`, { method: 'POST', body: JSON.stringify({ body, actor }) });
  },

  async closeTicket(ticketId: string, actor: string, reason: string): Promise<Ticket> {
    return requestJson<Ticket>(`/tickets/${encodeURIComponent(ticketId)}/close`, { method: 'POST', body: JSON.stringify({ actor, reason }) });
  },

  async updateConfigTiers(next: TierConfig[], actor: string, reason: string): Promise<TierConfig[]> {
    return requestJson<TierConfig[]>('/config/tiers', { method: 'PATCH', body: JSON.stringify({ tiers: next, actor, reason }) });
  },

  async updateConfigModels(next: ModelConfig[], actor: string, reason: string): Promise<ModelConfig[]> {
    return requestJson<ModelConfig[]>('/config/models', { method: 'PATCH', body: JSON.stringify({ models: next, actor, reason }) });
  },

  async createUser(payload: { name: string; email: string; tier: 'free' | 'pro' | 'business'; status: 'active' | 'suspended' | 'grace' }, actor = 'admin@oneai.app'): Promise<UserSummary> {
    return requestJson<UserSummary>('/users', { method: 'POST', body: JSON.stringify({ ...payload, actor }) });
  },

  async suspendUser(userId: string, status: 'active' | 'suspended' | 'grace', reason: string, actor = 'admin@oneai.app'): Promise<UserSummary> {
    return requestJson<UserSummary>(`/users/${encodeURIComponent(userId)}/status`, { method: 'POST', body: JSON.stringify({ status, reason, actor }) });
  },

  async grantUserQuota(userId: string, amount: number, reason: string, actor = 'admin@oneai.app'): Promise<{ user: UserSummary; entry: QuotaHistoryEntry }> {
    return requestJson<{ user: UserSummary; entry: QuotaHistoryEntry }>(`/users/${encodeURIComponent(userId)}/quota-grant`, { method: 'POST', body: JSON.stringify({ amount, reason, actor }) });
  },

  async setUserQuotaOverride(userId: string, override: Omit<QuotaOverride, 'setAt'>, actor = 'admin@oneai.app'): Promise<{ user: UserSummary; override: QuotaOverride }> {
    return requestJson<{ user: UserSummary; override: QuotaOverride }>(`/users/${encodeURIComponent(userId)}/quota-override`, { method: 'POST', body: JSON.stringify({ ...override, actor }) });
  },

  async resetUserQuotaOverride(userId: string, reason = 'Quota override cleared', actor = 'admin@oneai.app'): Promise<UserSummary> {
    return requestJson<UserSummary>(`/users/${encodeURIComponent(userId)}/quota-override`, { method: 'DELETE', body: JSON.stringify({ reason, actor }) });
  },


  async appendAudit(entry: Omit<AuditEntry, 'id'>): Promise<AuditEntry> {
    return requestJson<AuditEntry>('/audit', { method: 'POST', body: JSON.stringify(entry) });
  },

  async updateUnitPricing(
    payload: {
      requestUnit?: { size: number; priceUsd: number; enabled: boolean };
      tokenUnit?: { size: number; priceUsd: number; enabled: boolean };
      reason: string;
    },
    actor = 'admin@oneai.app',
  ): Promise<UnitPricingConfig> {
    return requestJson<UnitPricingConfig>('/unit-pricing', { method: 'PATCH', body: JSON.stringify({ ...payload, actor }) });
  },

  __resetCache() {
    // No-op in backend-backed mode.
  },
};

export type { ModelId, Tier, UnitConfig, UnitPricingHistoryEntry };


