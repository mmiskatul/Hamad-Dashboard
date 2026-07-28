/**
 * DTOs for the admin dashboard. These are the *only* types allowed at the
 * render boundary. `content` / `messages` / `transcripts` / `body` / `text`
 * are intentionally absent — see design/admin-ui.md §11.4.
 */
export type Tier = "free" | "pro" | "business";
export type UserStatus = "active" | "suspended" | "grace";
export type ProviderStatus = "operational" | "degraded" | "outage";
export type CircuitState = "closed" | "half-open" | "open";
export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "normal" | "high";

export type ModelId =
  | "gpt"
  | "gemini"
  | "claude"
  | "grok"
  | "deepseek"
  | "perplexity";

export type UserSummary = {
  id: string;
  email: string;
  mobile?: string;
  name: string;
  tier: Tier;
  status: UserStatus;
  requestsUsed: number;
  requestsLimit: number;
  tokensSpent: number;
  costUsd: number;
  lastActiveAt: string;
  signupDate: string;
  platform: "ios" | "android" | "web";
};

export type UserDetail = UserSummary &
  UserDetailExtension & {
    modelDistribution: Record<ModelId, number>;
    ticketIds: string[];
  };

export type ProviderHealth = {
  id: string;
  name: string;
  modelId: ModelId;
  status: ProviderStatus;
  p50Ms: number;
  p95Ms: number;
  errorRate: number;
  uptime: number;
  circuit: CircuitState;
  sparkline: number[];
};

export type Ticket = {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  hasAttachment: boolean;
  attachmentExpiresAt: string | null;
  replies: SupportReply[];
};

export type TicketDetail = Ticket & {
  description: string;
  timeline: { id: string; at: string; actor: string; note: string }[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action:
    | "login"
    | "quotaOverride"
    | "userStatus"
    | "providerToggle"
    | "tierChange"
    | "modelToggle"
    | "sessionRevoked"
    | "tier.update"
    | "model.toggle"
    | "usage.toggle"
    | "pricing.update"
    | "legal.publish"
    | "legal.restore"
    | "legal.delete"
    | "support.reply"
    | "support.close"
    | "twoFactor.codeSent"
    | "twoFactor.verified"
    | "twoFactor.emailUpdated"
    | "twoFactor.disabled";
  target: string;
  reason: string;
  ip: string;
  /** Additional structured payload for new event types. */
  meta?: Record<string, unknown>;
};

export type OverviewStats = {
  health: "healthy" | "degraded" | "outage";
  providersUp: number;
  providersTotal: number;
  mrr: number;
  mrrDelta: number;
  spend30d: number;
  spendMargin: number;
  spendDelta: number;
  activeUsers: number;
  activeUsersDelta: number;
  newUsers: number;
  sparklines: { mrr: number[]; spend: number[]; active: number[] };
  costByModel: { modelId: ModelId; cost: number; tokens: number }[];
};

export type RevenueData = {
  mrrSeries: { month: string; mrr: number }[];
  tierMix: { tier: Tier; users: number; revenue: number }[];
  churn: { month: string; churn: number; newMrr: number }[];
  arpu: number;
  arr: number;
  churnRate: number;
  funnel: { stage: string; value: number }[];
};

export type UsageData = {
  tokensByModel: { date: string; series: Record<ModelId, number> }[];
  costByModel: { modelId: ModelId; cost: number; tokens: number }[];
  topUsers: { userId: string; email: string; spend: number; tokens: number }[];
};

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  lastSignInAt: string;
  totpEnabled: boolean;
  /**
   * Email-based 2FA. The email is intentionally separate from the login
   * email so a single admin can receive codes at a different address. The
   * `verified` flag flips to true after the 6-digit code is confirmed.
   */
  twoFactor: {
    email: string | null;
    verified: boolean;
  };
  sessions: {
    id: string;
    device: string;
    location: string;
    ip: string;
    lastActiveAt: string;
    current: boolean;
  }[];
};

export type SystemStateKey = "forbidden" | "error" | "maintenance" | "empty" | "offline";

export type FeatureFlags = {
  fileUpload: boolean;
  voice: boolean;
  priority: boolean;
};

export type TierConfig = {
  id: Tier;
  name: string;
  monthlyUsd: number;
  /** -1 = unlimited. */
  requestsLimit: number;
  tokensLimit: number;
  models: ModelId[];
  features: FeatureFlags;
};

export type ModelConfig = {
  id: ModelId;
  label: string;
  enabled: boolean;
  /** Tiers that include this model. */
  includedInTiers: Tier[];
  affectedUsers: number;
};

export type MembershipPlan = TierConfig;

export type UsageVisibility = {
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
};

export type UnitConfig = {
  size: number;
  priceUsd: number;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
};

/**
 * Backwards-compatible alias — earlier iterations of the spec referred to this
 * shape as `UnitPricingRecord`. New code should prefer `UnitConfig`.
 */
export type UnitPricingRecord = UnitConfig;

export type UnitPricingHistoryEntry = {
  ts: string;
  actor: string;
  unit: "request" | "token";
  before: { size: number; priceUsd: number };
  after: { size: number; priceUsd: number };
  reason: string;
};

export type UnitPricingConfig = {
  requestUnit: UnitConfig;
  tokenUnit: UnitConfig;
  history: UnitPricingHistoryEntry[];
};

export type LegalVersion = {
  id: string;
  /** Markdown body. */
  bodyMarkdown: string;
  createdAt: string;
  createdBy: string;
  summary: string;
};

export type LegalDoc = {
  currentVersionId: string;
  versions: LegalVersion[];
};

export type SupportReply = {
  id: string;
  author: string;
  role: "admin" | "user";
  message: string;
  createdAt: string;
};

export type PaymentHistoryEntry = {
  date: string;
  amountUsd: number;
  plan: Tier;
  period: "monthly" | "annual";
  status: "succeeded" | "pending" | "refunded" | "failed";
};

export type QuotaHistoryEntry = {
  date: string;
  amount: number;
  by: string;
  reason: string;
  newTotal?: number;
};

export type QuotaOverride = {
  bypassQuota: boolean;
  customRequestsLimit?: number;
  customTokensLimit?: number;
  reason: string;
  setBy: string;
  setAt: string;
};

export type RenewalEntry = {
  plan: Tier;
  period: "monthly" | "annual";
  amountUsd: number;
  nextBillingAt: string;
};

export type UserActionTimelineEntry = {
  ts: string;
  actor: string;
  action: string;
  summary: string;
};

export type UserMemorySummary = {
  count: number;
  bytesUsed: number;
  /** Last time any memory entry was created or updated. */
  lastUpdatedAt: string;
  /** Optional sample of recent memory categories (free-form labels). */
  topCategories: string[];
};

export type UserDetailExtension = {
  avatarUrl: string;
  signupSource: "ios" | "android" | "web";
  paymentHistory: PaymentHistoryEntry[];
  quotaHistory: QuotaHistoryEntry[];
  renewals: RenewalEntry[];
  memory?: UserMemorySummary;
  actionTimeline?: UserActionTimelineEntry[];
};

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  lastSignInAt: string;
};