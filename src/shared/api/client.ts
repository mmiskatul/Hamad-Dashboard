/**
 * Single point that materialises data. All readers route through `api.get`
 * which today reads from `/src/data/*.json` and tomorrow can be swapped to
 * `fetch(API_BASE_URL + path)` without touching the rest of the app.
 */
import { adminProjection } from "@/shared/lib/privacy";
import { sendMail } from "@/shared/lib/email";
import type {
  AuditEntry,
  LegalDoc,
  ModelConfig,
  OverviewStats,
  ProviderHealth,
  RevenueData,
  SupportReply,
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
  AdminAccount,
  ModelId,
  Tier,
  AdminProfile,
} from "./types";

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

async function load<T>(file: string): Promise<T> {
  const data = (await import(`@/data/${file}.json`)).default as T;
  return adminProjection(data);
}

/**
 * Mutable in-memory store for users. The list page reads from JSON fixtures
 * today, but mutations (createUser) need to persist for the lifetime of the
 * session so the admin sees the new user immediately. The store is loaded
 * lazily on first read so test isolation stays intact.
 */
let userStore: UserSummary[] = [];
let userStoreLoaded = false;
async function loadUserStore(): Promise<UserSummary[]> {
  if (userStoreLoaded) return userStore;
  const rows = await load<UserSummary[]>("users");
  userStore = rows.map((u) => ({ ...u }));
  userStoreLoaded = true;
  return userStore;
}

function hash(input: string): number {
  // FNV-1a 32-bit — small, deterministic, no deps.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * In-memory cache for writeable resources. Mutations are applied here so
 * subsequent reads see the new value. This is the swap point when a real
 * backend replaces the JSON files.
 */
type TwoFactorCode = {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
};

const TWO_FACTOR_TTL_MS = 10 * 60 * 1000;
const TWO_FACTOR_MAX_ATTEMPTS = 5;

const cache: {
  usageVisibility: UsageVisibility;
  legalTerms: LegalDoc;
  legalPrivacy: LegalDoc;
  audit: AuditEntry[];
  configTiers: TierConfig[];
  configModels: ModelConfig[];
  tickets: Ticket[];
  account: AdminAccount;
  totpSecret: string;
  totpEnabled: boolean;
  twoFactorCode: TwoFactorCode | null;
  unitPricing: UnitPricingConfig;
} = {
  usageVisibility: { enabled: true, updatedAt: new Date().toISOString(), updatedBy: "admin@oneai.app" },
  legalTerms: { currentVersionId: "v1", versions: [] },
  legalPrivacy: { currentVersionId: "v1", versions: [] },
  audit: [],
  configTiers: [],
  configModels: [],
  tickets: [],
  account: {
    id: "admin_001",
    name: "Mahfuz Rahman",
    email: "admin@oneai.app",
    avatarUrl: "/brand/logo-mark.svg",
    lastSignInAt: new Date().toISOString(),
    totpEnabled: false,
    twoFactor: { email: null, verified: false },
    sessions: [],
  },
  totpSecret: "",
  totpEnabled: false,
  twoFactorCode: null,
  unitPricing: {
    requestUnit: { size: 0, priceUsd: 0, enabled: true, updatedAt: new Date().toISOString(), updatedBy: "admin@oneai.app" },
    tokenUnit: { size: 0, priceUsd: 0, enabled: true, updatedAt: new Date().toISOString(), updatedBy: "admin@oneai.app" },
    history: [],
  },
};

function generateTotpSecret(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let s = "";
  for (let i = 0; i < 32; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

let cacheInitialised = false;
async function ensureCache() {
  if (cacheInitialised) return;
  cache.usageVisibility = await load<UsageVisibility>("usage-visibility");
  cache.legalTerms = await load<LegalDoc>("legal-terms");
  cache.legalPrivacy = await load<LegalDoc>("legal-privacy");
  cache.audit = await load<AuditEntry[]>("audit");
  cache.configTiers = await load<TierConfig[]>("config-tiers");
  cache.configModels = await load<ModelConfig[]>("config-models");
  cache.tickets = await load<Ticket[]>("support-tickets");
  cache.account = await load<AdminAccount>("admin-account");
  cache.unitPricing = await load<UnitPricingConfig>("unit-pricing");
  // Defensive: older fixtures may not include the twoFactor block.
  if (!cache.account.twoFactor) {
    cache.account.twoFactor = { email: null, verified: false };
  }
  cache.totpEnabled = cache.account.totpEnabled;
  cacheInitialised = true;
}

let auditCounter = 1000;
function nextAuditId() {
  return `aud_${String(++auditCounter).padStart(4, "0")}`;
}

export const api = {
  get<K extends keyof PathMap>(path: K, ...args: Parameters<PathMap[K]>): ReturnType<PathMap[K]> {
    const fn = (() => {
      switch (path) {
        case "overview":
          return () => load<OverviewStats>("overview");
        case "users":
          return async () => {
            const rows = await loadUserStore();
            return rows.map((u) => ({ ...u }));
          };
        case "userDetail":
          return (id: string) =>
            load<UserDetail[]>("user-details").then((rows) => {
              const found = rows.find((d) => d.id === id);
              if (found) return found;
              return load<UserDetail>("user-detail").then((d) => {
                if (d.id === id) return d;
                return usersAsDetail(id);
              });
            });
        case "revenue":
          return () => load<RevenueData>("revenue");
        case "usage":
          return () => load<UsageData>("usage");
        case "providers":
          return () => load<ProviderHealth[]>("providers-health");
        case "tickets":
          return async () => {
            await ensureCache();
            return cache.tickets.map((t) => ({ ...t }));
          };
        case "ticketDetail":
          return (id: string) =>
            load<TicketDetail>("ticket-detail").then((d) => {
              if (d.id === id) return d;
              return { ...d, id };
            });
        case "ticketReplies":
          return async (id: string) => {
            await ensureCache();
            const t = cache.tickets.find((x) => x.id === id);
            return (t?.replies ?? []).map((r) => ({ ...r }));
          };
        case "configModels":
          return async () => {
            await ensureCache();
            return cache.configModels.map((m) => ({ ...m, includedInTiers: [...m.includedInTiers] }));
          };
        case "configTiers":
          return async () => {
            await ensureCache();
            return cache.configTiers.map((t) => ({
              ...t,
              models: [...t.models],
              features: { ...t.features },
            }));
          };
        case "planDefaults":
          return () => load<TierConfig[]>("plan-defaults");
        case "audit":
          return async () => {
            await ensureCache();
            return cache.audit.map((e) => ({ ...e, meta: e.meta ? { ...e.meta } : undefined }));
          };
        case "account":
          return async () => {
            await ensureCache();
            return {
              ...cache.account,
              sessions: cache.account.sessions.map((s) => ({ ...s })),
              twoFactor: { ...cache.account.twoFactor },
              totpEnabled: cache.totpEnabled,
            };
          };
        case "totpSecret":
          return async () => {
            await ensureCache();
            if (!cache.totpSecret) cache.totpSecret = generateTotpSecret();
            const issuer = "OneAI Admin";
            const label = "admin@oneai.app";
            const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${cache.totpSecret}&issuer=${encodeURIComponent(issuer)}`;
            return { secret: cache.totpSecret, otpauth };
          };
        case "usageVisibility":
          return async () => {
            await ensureCache();
            return { ...cache.usageVisibility };
          };
        case "legalTerms":
          return async () => {
            await ensureCache();
            return {
              currentVersionId: cache.legalTerms.currentVersionId,
              versions: cache.legalTerms.versions.map((v) => ({ ...v })),
            };
          };
        case "legalPrivacy":
          return async () => {
            await ensureCache();
            return {
              currentVersionId: cache.legalPrivacy.currentVersionId,
              versions: cache.legalPrivacy.versions.map((v) => ({ ...v })),
            };
          };
        case "adminProfile":
          return () => load<AdminProfile>("admin-account").then((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            avatarUrl: a.avatarUrl,
            lastSignInAt: a.lastSignInAt,
          }));
        case "unitPricing":
          return async () => {
            await ensureCache();
            return {
              requestUnit: { ...cache.unitPricing.requestUnit },
              tokenUnit: { ...cache.unitPricing.tokenUnit },
              history: cache.unitPricing.history.map((h) => ({ ...h })),
            };
          };
      }
    })() as PathMap[K];
    return (fn as (...a: Parameters<PathMap[K]>) => ReturnType<PathMap[K]>)(...(args as Parameters<PathMap[K]>));
  },

  async setTotpEnabled(enabled: boolean, actor = "admin@oneai.app"): Promise<AdminAccount> {
    await ensureCache();
    cache.totpEnabled = enabled;
    cache.account.totpEnabled = enabled;
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "userStatus",
      target: "admin.totp",
      reason: enabled ? "TOTP enabled" : "TOTP disabled",
      ip: "10.0.1.1",
      meta: { totpEnabled: enabled },
    });
    return { ...cache.account, totpEnabled: cache.totpEnabled };
  },

  async sendTwoFactorCode(
    payload: { email: string },
    actor = "admin@oneai.app",
  ): Promise<{ ok: true }> {
    await ensureCache();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    cache.twoFactorCode = {
      email: payload.email,
      code,
      expiresAt: Date.now() + TWO_FACTOR_TTL_MS,
      attempts: 0,
    };
    await sendMail({
      to: payload.email,
      subject: "Your OneAI Admin verification code",
      message: `Your verification code is ${code}. It expires in 10 minutes.`,
    });
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "twoFactor.codeSent",
      target: payload.email,
      reason: "Two-factor verification code sent",
      ip: "10.0.1.1",
      meta: { email: payload.email },
    });
    return { ok: true };
  },

  async verifyTwoFactorCode(
    payload: { email: string; code: string },
    actor = "admin@oneai.app",
  ): Promise<
    | { ok: true }
    | { ok: false; reason: "mismatch" | "expired" | "too-many-attempts" }
  > {
    await ensureCache();
    const pending = cache.twoFactorCode;
    if (!pending || pending.email !== payload.email || Date.now() > pending.expiresAt) {
      cache.twoFactorCode = null;
      return { ok: false, reason: "expired" };
    }
    if (pending.attempts >= TWO_FACTOR_MAX_ATTEMPTS) {
      cache.twoFactorCode = null;
      return { ok: false, reason: "too-many-attempts" };
    }
    if (pending.code !== payload.code) {
      // The demo login page displays 123456 so the mock can be exercised
      // without opening the console. The onboarding dialog still verifies
      // the generated code from the mocked email.
      const isDemoLoginCode =
        payload.code === "123456" &&
        cache.account.twoFactor.verified &&
        cache.account.twoFactor.email === payload.email;
      if (!isDemoLoginCode) {
        pending.attempts += 1;
        const exceeded = pending.attempts >= TWO_FACTOR_MAX_ATTEMPTS;
        if (exceeded) cache.twoFactorCode = null;
        return {
          ok: false,
          reason: exceeded ? "too-many-attempts" : "mismatch",
        };
      }
    }
    cache.account.twoFactor = { email: payload.email, verified: true };
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "twoFactor.verified",
      target: payload.email,
      reason: "Two-factor email verified",
      ip: "10.0.1.1",
      meta: { email: payload.email },
    });
    cache.twoFactorCode = null;
    return { ok: true };
  },

  async setTwoFactorEmail(
    payload: { email: string },
    actor = "admin@oneai.app",
  ): Promise<AdminAccount> {
    await ensureCache();
    cache.account.twoFactor = { email: payload.email, verified: false };
    cache.twoFactorCode = null;
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "twoFactor.emailUpdated",
      target: payload.email,
      reason: "Two-factor email updated",
      ip: "10.0.1.1",
      meta: { email: payload.email },
    });
    return {
      ...cache.account,
      sessions: cache.account.sessions.map((s) => ({ ...s })),
      twoFactor: { ...cache.account.twoFactor },
      totpEnabled: cache.totpEnabled,
    };
  },

  async disableTwoFactor(actor = "admin@oneai.app"): Promise<AdminAccount> {
    await ensureCache();
    cache.account.twoFactor = { email: cache.account.twoFactor.email, verified: false };
    cache.twoFactorCode = null;
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "twoFactor.disabled",
      target: "admin.twoFactor",
      reason: "Two-factor authentication disabled",
      ip: "10.0.1.1",
      meta: { email: cache.account.twoFactor.email },
    });
    return {
      ...cache.account,
      sessions: cache.account.sessions.map((s) => ({ ...s })),
      twoFactor: { ...cache.account.twoFactor },
      totpEnabled: cache.totpEnabled,
    };
  },

  async revokeSession(sessionId: string, actor = "admin@oneai.app"): Promise<AdminAccount> {
    await ensureCache();
    cache.account.sessions = cache.account.sessions.filter((s) => s.id !== sessionId);
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "sessionRevoked",
      target: sessionId,
      reason: `Revoked session ${sessionId}`,
      ip: "10.0.1.1",
      meta: { sessionId },
    });
    return { ...cache.account, sessions: cache.account.sessions.map((s) => ({ ...s })), twoFactor: { ...cache.account.twoFactor }, totpEnabled: cache.totpEnabled };
  },

  async revokeAllOtherSessions(actor = "admin@oneai.app"): Promise<AdminAccount> {
    await ensureCache();
    const remaining = cache.account.sessions.filter((s) => s.current);
    const removed = cache.account.sessions.length - remaining.length;
    cache.account.sessions = remaining;
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "sessionRevoked",
      target: "admin.sessions",
      reason: `Revoked ${removed} other session(s)`,
      ip: "10.0.1.1",
      meta: { count: removed },
    });
    return { ...cache.account, sessions: cache.account.sessions.map((s) => ({ ...s })), twoFactor: { ...cache.account.twoFactor }, totpEnabled: cache.totpEnabled };
  },

  /** Mock-persist: update the cached value. Replace with fetch later. */
  async setUsageVisibility(next: UsageVisibility): Promise<UsageVisibility> {
    await ensureCache();
    cache.usageVisibility = { ...next };
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor: next.updatedBy,
      action: "usage.toggle",
      target: "usage-visibility",
      reason: `Customer usage dashboard ${next.enabled ? "enabled" : "disabled"}`,
      ip: "10.0.1.1",
      meta: { enabled: next.enabled },
    });
    return { ...cache.usageVisibility };
  },

  async saveLegalVersion(
    docType: "terms" | "privacy",
    payload: { body: string; summary: string; createdBy: string; reason: string },
  ): Promise<LegalDoc> {
    await ensureCache();
    const target = docType === "terms" ? cache.legalTerms : cache.legalPrivacy;
    const nextId = `v${target.versions.length + 1}`;
    target.versions.push({
      id: nextId,
      bodyMarkdown: payload.body,
      summary: payload.summary,
      createdAt: new Date().toISOString(),
      createdBy: payload.createdBy,
    });
    target.currentVersionId = nextId;
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor: payload.createdBy,
      action: "legal.publish",
      target: docType,
      reason: payload.reason,
      ip: "10.0.1.1",
      meta: { docType, versionId: nextId },
    });
    return {
      currentVersionId: target.currentVersionId,
      versions: target.versions.map((v) => ({ ...v })),
    };
  },

  async restoreLegalVersion(
    docType: "terms" | "privacy",
    versionId: string,
    actor: string,
    reason: string,
  ): Promise<LegalDoc> {
    await ensureCache();
    const target = docType === "terms" ? cache.legalTerms : cache.legalPrivacy;
    if (!target.versions.find((v) => v.id === versionId)) {
      throw new Error(`Version ${versionId} not found in ${docType}`);
    }
    target.currentVersionId = versionId;
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "legal.restore",
      target: docType,
      reason,
      ip: "10.0.1.1",
      meta: { docType, versionId },
    });
    return {
      currentVersionId: target.currentVersionId,
      versions: target.versions.map((v) => ({ ...v })),
    };
  },

  async deleteLegalVersion(
    docType: "terms" | "privacy",
    versionId: string,
    actor: string,
    reason: string,
  ): Promise<LegalDoc> {
    await ensureCache();
    const target = docType === "terms" ? cache.legalTerms : cache.legalPrivacy;
    if (target.versions.length <= 1) {
      throw new Error("Cannot delete the only version");
    }
    if (target.currentVersionId === versionId) {
      throw new Error("Cannot delete the current version");
    }
    target.versions = target.versions.filter((v) => v.id !== versionId);
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "legal.delete",
      target: docType,
      reason,
      ip: "10.0.1.1",
      meta: { docType, versionId },
    });
    return {
      currentVersionId: target.currentVersionId,
      versions: target.versions.map((v) => ({ ...v })),
    };
  },

  async postReply(
    ticketId: string,
    body: string,
    actor: string,
  ): Promise<SupportReply> {
    await ensureCache();
    const ticket = cache.tickets.find((t) => t.id === ticketId);
    const reply: SupportReply = {
      id: `rep_${ticketId}_${(ticket?.replies.length ?? 0) + 1}_${Date.now()}`,
      author: actor,
      role: "admin",
      message: body,
      createdAt: new Date().toISOString(),
    };
    if (ticket) {
      ticket.replies.push(reply);
      ticket.updatedAt = reply.createdAt;
    }
    cache.audit.unshift({
      id: nextAuditId(),
      at: reply.createdAt,
      actor,
      action: "support.reply",
      target: ticketId,
      reason: `Replied to ticket ${ticketId}`,
      ip: "10.0.1.1",
      meta: { ticketId, preview: body.slice(0, 80) },
    });
    return { ...reply };
  },

  async closeTicket(ticketId: string, actor: string, reason: string): Promise<Ticket> {
    await ensureCache();
    const ticket = cache.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    ticket.status = "resolved";
    ticket.updatedAt = new Date().toISOString();
    cache.audit.unshift({
      id: nextAuditId(),
      at: ticket.updatedAt,
      actor,
      action: "support.close",
      target: ticketId,
      reason: reason || `Closed ticket ${ticketId}`,
      ip: "10.0.1.1",
      meta: { ticketId },
    });
    return { ...ticket };
  },

  async updateConfigTiers(
    next: TierConfig[],
    actor: string,
    reason: string,
  ): Promise<TierConfig[]> {
    await ensureCache();
    const before = cache.configTiers.map((t) => t.id);
    cache.configTiers = next.map((t) => ({
      ...t,
      models: [...t.models],
      features: { ...t.features },
    }));
    for (const id of before) {
      cache.audit.unshift({
        id: nextAuditId(),
        at: new Date().toISOString(),
        actor,
        action: "tier.update",
        target: `tier_${id}`,
        reason: reason || `Tier ${id} updated`,
        ip: "10.0.1.1",
        meta: { tierId: id },
      });
    }
    return cache.configTiers.map((t) => ({
      ...t,
      models: [...t.models],
      features: { ...t.features },
    }));
  },

  async updateConfigModels(
    next: ModelConfig[],
    actor: string,
    reason: string,
  ): Promise<ModelConfig[]> {
    await ensureCache();
    cache.configModels = next.map((m) => ({
      ...m,
      includedInTiers: [...m.includedInTiers],
    }));
    cache.audit.unshift({
      id: nextAuditId(),
      at: new Date().toISOString(),
      actor,
      action: "model.toggle",
      target: "config-models",
      reason: reason || "Model configuration updated",
      ip: "10.0.1.1",
      meta: { count: next.length },
    });
    return cache.configModels.map((m) => ({
      ...m,
      includedInTiers: [...m.includedInTiers],
    }));
  },

  /**
   * Create a new user. The id is generated deterministically from the email
   * so the same email always produces the same id (idempotent on retries).
   * The created user is added to the cache and the audit log is updated.
   */
  async createUser(
    payload: {
      name: string;
      email: string;
      tier: "free" | "pro" | "business";
      status: "active" | "suspended" | "grace";
    },
    actor = "admin@oneai.app",
  ): Promise<UserSummary> {
    await ensureCache();
    const email = payload.email.trim().toLowerCase();
    const users = await loadUserStore();
    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      throw new Error(`User with email ${payload.email} already exists`);
    }
    const id = `usr_${hash(email).toString(16).padStart(8, "0").slice(0, 8)}`;
    const now = new Date().toISOString();
    const defaults: UserSummary = {
      id,
      name: payload.name.trim(),
      email,
      tier: payload.tier,
      status: payload.status,
      requestsUsed: 0,
      requestsLimit: payload.tier === "free" ? 100 : payload.tier === "pro" ? 5000 : 25000,
      tokensSpent: 0,
      costUsd: 0,
      lastActiveAt: now,
      signupDate: now,
      platform: "web",
      mobile: undefined,
    };
    // mutate the in-memory cache that backs api.get("users") by re-reading &
    // patching the cache. The next load() will pick up the JSON snapshot; we
    // therefore monkey-patch the data module so subsequent reads return the
    // new user.
    userStore.push({ ...defaults });
    cache.audit.unshift({
      id: nextAuditId(),
      at: now,
      actor,
      action: "userStatus",
      target: id,
      reason: `Created user ${email}`,
      ip: "10.0.1.1",
      meta: { email, tier: payload.tier, status: payload.status },
    });
    return { ...defaults };
  },

  /**
   * Push a free-form audit entry to the in-memory log. Useful when a write
   * spans multiple domain mutations (e.g. updating both unit-pricing rows in
   * one save) and we want the audit row to reference both before/after
   * snapshots with the supplied reason.
   */
  async appendAudit(entry: Omit<AuditEntry, "id">): Promise<AuditEntry> {
    await ensureCache();
    const row: AuditEntry = { id: nextAuditId(), ...entry };
    cache.audit.unshift(row);
    return { ...row, meta: row.meta ? { ...row.meta } : undefined };
  },

  /**
   * Update one or both unit-pricing rows. Either argument is optional so the
   * page can save them independently; validation runs per provided unit.
   * Each changed unit also gets a `pricing.update` audit entry carrying the
   * before/after pair and reason. History entries are prepended (newest
   * first) so the UI can render the most recent change on top.
   */
  async updateUnitPricing(
    payload: {
      requestUnit?: { size: number; priceUsd: number; enabled: boolean };
      tokenUnit?: { size: number; priceUsd: number; enabled: boolean };
      reason: string;
    },
    actor = "admin@oneai.app",
  ): Promise<UnitPricingConfig> {
    await ensureCache();
    const trimmedReason = payload.reason.trim();
    if (trimmedReason.length < 10) {
      throw new Error("Reason must be at least 10 characters");
    }
    if (!payload.requestUnit && !payload.tokenUnit) {
      throw new Error("At least one unit must be provided");
    }
    const stamp = new Date().toISOString();
    const beforeRequest = cache.unitPricing.requestUnit;
    const beforeToken = cache.unitPricing.tokenUnit;
    if (payload.requestUnit) {
      if (payload.requestUnit.size <= 0) {
        throw new Error("requestUnit.size must be greater than 0");
      }
      if (payload.requestUnit.priceUsd < 0) {
        throw new Error("requestUnit.priceUsd must be ≥ 0");
      }
    }
    if (payload.tokenUnit) {
      if (payload.tokenUnit.size <= 0) {
        throw new Error("tokenUnit.size must be greater than 0");
      }
      if (payload.tokenUnit.priceUsd < 0) {
        throw new Error("tokenUnit.priceUsd must be ≥ 0");
      }
    }
    const nextHistory: UnitPricingHistoryEntry[] = [...cache.unitPricing.history];
    if (payload.requestUnit) {
      nextHistory.unshift({
        ts: stamp,
        actor,
        unit: "request",
        before: { size: beforeRequest.size, priceUsd: beforeRequest.priceUsd },
        after: { size: payload.requestUnit.size, priceUsd: payload.requestUnit.priceUsd },
        reason: trimmedReason,
      });
    }
    if (payload.tokenUnit) {
      nextHistory.unshift({
        ts: stamp,
        actor,
        unit: "token",
        before: { size: beforeToken.size, priceUsd: beforeToken.priceUsd },
        after: { size: payload.tokenUnit.size, priceUsd: payload.tokenUnit.priceUsd },
        reason: trimmedReason,
      });
    }
    const next: UnitPricingConfig = {
      requestUnit: payload.requestUnit
        ? { ...beforeRequest, ...payload.requestUnit, updatedAt: stamp, updatedBy: actor }
        : beforeRequest,
      tokenUnit: payload.tokenUnit
        ? { ...beforeToken, ...payload.tokenUnit, updatedAt: stamp, updatedBy: actor }
        : beforeToken,
      history: nextHistory,
    };
    cache.unitPricing = next;
    // Persist to JSON files when running on the server. Dynamic imports with
    // the `webpackIgnore` magic comment keep node:fs / node:path out of the
    // client bundle so the dashboard builds even though `api` is shared
    // between client and server.
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const [{ promises: fs }, path] = await Promise.all([
          import(/* webpackIgnore: true */ "node:fs"),
          import(/* webpackIgnore: true */ "node:path"),
        ]);
        const dataDir = path.join(process.cwd(), "src", "data");
        await fs.writeFile(
          path.join(dataDir, "unit-pricing.json"),
          `${JSON.stringify(next, null, 2)}\n`,
          "utf8",
        );
      } catch {
        // Filesystem persistence is best-effort in mock environments.
      }
    }
    // Push a single audit entry capturing both before/after snapshots and the
    // reason. The audit log is the canonical place auditors look, so we keep
    // history + audit in lockstep.
    const auditEntry: AuditEntry = {
      id: nextAuditId(),
      at: stamp,
      actor,
      action: "pricing.update",
      target: "unit-pricing",
      reason: trimmedReason,
      ip: "10.0.1.1",
      meta: {
        requestUnit: next.requestUnit,
        tokenUnit: next.tokenUnit,
        requestChanged: Boolean(payload.requestUnit),
        tokenChanged: Boolean(payload.tokenUnit),
      },
    };
    cache.audit.unshift(auditEntry);
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        const [{ promises: fs }, path] = await Promise.all([
          import(/* webpackIgnore: true */ "node:fs"),
          import(/* webpackIgnore: true */ "node:path"),
        ]);
        const dataDir = path.join(process.cwd(), "src", "data");
        await fs.writeFile(
          path.join(dataDir, "audit.json"),
          `${JSON.stringify(cache.audit, null, 2)}\n`,
          "utf8",
        );
      } catch {
        // Filesystem persistence is best-effort in mock environments.
      }
    }
    return {
      requestUnit: { ...next.requestUnit },
      tokenUnit: { ...next.tokenUnit },
      history: next.history.map((h) => ({ ...h })),
    };
  },

  /**
   * Test-only escape hatch — reset the in-memory cache so unit tests stay
   * isolated. Not exported through the public client typings.
   */
  __resetCache() {
    cacheInitialised = false;
    userStore.length = 0;
    userStoreLoaded = false;
  },
};

async function usersAsDetail(id: string): Promise<UserDetail> {
  const users = await loadUserStore();
  const found = users.find((u) => u.id === id);
  if (!found) {
    throw new Error(`User not found: ${id}`);
  }
  const ext = (found as unknown as Record<string, unknown>) ?? {};
  const totals = Math.max(1, found.tokensSpent);
  const seeds = seedById(id);
  return {
    ...found,
    avatarUrl: (ext.avatarUrl as string | undefined) ?? "/brand/logo-mark.svg",
    signupSource: (ext.signupSource as UserDetail["signupSource"] | undefined) ?? found.platform,
    paymentHistory: (ext.paymentHistory as UserDetail["paymentHistory"] | undefined) ?? [],
    quotaHistory: (ext.quotaHistory as UserDetail["quotaHistory"] | undefined) ?? [],
    renewals: (ext.renewals as UserDetail["renewals"] | undefined) ?? [],
    modelDistribution: {
      gpt: Math.round(totals * 0.45),
      gemini: Math.round(totals * 0.22),
      claude: Math.round(totals * 0.12),
      grok: Math.round(totals * 0.16),
      deepseek: Math.round(totals * 0.04),
      perplexity: Math.round(totals * 0.01),
    },
    ticketIds: seeds.tickets,
    memory: seeds.memory ?? {
      count: 0,
      bytesUsed: 0,
      lastUpdatedAt: found.lastActiveAt,
      topCategories: [],
    },
    actionTimeline: [],
  };
}

/**
 * Deterministic per-user enrichment so the *Users list* users (those not in
 * `user-detail.json`) still get a believable detail view. Override values
 * here are intentionally small — the JSON fixtures win for the headline user.
 */
function seedById(
  id: string,
): { tickets: string[]; memory?: UserDetail["memory"] } {
  const seed = [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const ticketPool = ["tkt_001", "tkt_002", "tkt_003", "tkt_004", "tkt_005", "tkt_006"];
  const k = seed % 4;
  const tickets =
    k === 0
      ? []
      : Array.from({ length: k }, (_, i) => ticketPool[(seed + i) % ticketPool.length]!);
  if (id === "usr_s9") {
    return {
      tickets,
      memory: {
        count: 42,
        bytesUsed: 18_240,
        lastUpdatedAt: "2026-07-22T11:14:00.000Z",
        topCategories: ["profile", "preferences", "projects"],
      },
    };
  }
  if (id === "usr_sa") {
    return {
      tickets,
      memory: {
        count: 18,
        bytesUsed: 8_512,
        lastUpdatedAt: "2026-07-19T09:42:00.000Z",
        topCategories: ["profile", "notes"],
      },
    };
  }
  if (id === "usr_sb") {
    return {
      tickets,
      memory: {
        count: 95,
        bytesUsed: 41_104,
        lastUpdatedAt: "2026-07-23T17:01:00.000Z",
        topCategories: ["profile", "preferences", "projects", "snippets"],
      },
    };
  }
  const count = 0;
  return { tickets, memory: { count, bytesUsed: 0, lastUpdatedAt: "2024-06-01T00:00:00.000Z", topCategories: [] } };
}

// Suppress unused-import warning for helper types that are intentionally
// available through the api surface.
export type { ModelId, Tier, UnitConfig, UnitPricingHistoryEntry };
