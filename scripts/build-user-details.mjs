/**
 * Generates src/data/user-details.json — a complete, reviewable detail
 * fixture for every user in users.json. Covers profile, plan, usage,
 * model distribution, memory, payment history (invoices), renewals,
 * quota extension history, and action timeline.
 *
 * Idempotent. Run with: `node scripts/build-user-details.mjs`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const USERS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/users.json"), "utf8"));
const TICKETS = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/support-tickets.json"), "utf8"));

const MODELS = ["gpt", "gemini", "claude", "grok", "deepseek", "perplexity"];
const MODEL_LABEL = {
  gpt: "OpenAI",
  gemini: "Gemini",
  claude: "Claude",
  grok: "Grok",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
};

const PERIODICITY = {
  free: null,
  pro: "monthly",
  business: "monthly",
};

const PLAN_PRICE = {
  free: 0,
  pro: 19,
  business: 79,
};

const ADMIN = "admin@oneai.app";

/** Tiny deterministic PRNG (mulberry32) seeded by user id. */
function seeded(id) {
  let h = 1779033703 ^ id.length;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pickN(rand, arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function dayMs(d) {
  return new Date(d).getTime();
}

function isodate(ms) {
  return new Date(ms).toISOString();
}

function monthOffset(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function modelMix(rand, tier) {
  // Free is gpt-heavy; pro diversifies; business is balanced.
  const base = {
    gpt: 0.45,
    gemini: 0.18,
    claude: 0.07,
    grok: 0.18,
    deepseek: 0.08,
    perplexity: 0.04,
  };
  if (tier === "pro") {
    base.gemini = 0.22;
    base.claude = 0.12;
    base.deepseek = 0.1;
    base.grok = 0.12;
  } else if (tier === "business") {
    base.gpt = 0.32;
    base.gemini = 0.18;
    base.claude = 0.22;
    base.grok = 0.08;
    base.deepseek = 0.06;
    base.perplexity = 0.14;
  }
  // jitter +/-20%
  for (const k of Object.keys(base)) {
    base[k] = Math.max(0, base[k] * (0.8 + rand() * 0.4));
  }
  const total = Object.values(base).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(base)) base[k] = Math.round((base[k] / total) * 1000) / 1000;
  return base;
}

function generateFor(u) {
  const rand = seeded(u.id);
  const tier = u.tier;
  const tickets = TICKETS.filter((t) => t.userId === u.id).map((t) => t.id);
  const signupMs = dayMs(u.signupDate);

  const mix = modelMix(rand, tier);
  const modelDistribution = Object.fromEntries(MODELS.map((m) => [m, mix[m]]));

  // Memory: pro/business always have entries; free users mostly empty, some have 1-3.
  const memory =
    tier === "free"
      ? rand() < 0.2
        ? {
            count: 1 + Math.floor(rand() * 3),
            bytesUsed: 384 + Math.floor(rand() * 1024),
            lastUpdatedAt: isodate(dayMs(u.lastActiveAt) - rand() * 86400000 * 30),
            topCategories: pickN(rand, ["profile", "preferences", "notes"], 1 + Math.floor(rand() * 2)),
          }
        : { count: 0, bytesUsed: 0, lastUpdatedAt: u.signupDate, topCategories: [] }
      : {
          count: 6 + Math.floor(rand() * 90),
          bytesUsed: 2048 + Math.floor(rand() * 40960),
          lastUpdatedAt: isodate(dayMs(u.lastActiveAt) - rand() * 86400000 * 7),
          topCategories: pickN(rand, ["profile", "preferences", "projects", "notes", "snippets"], 2 + Math.floor(rand() * 3)),
        };

  // Payment history (invoices) — only for paid tiers.
  const paymentHistory = [];
  if (tier !== "free") {
    const price = PLAN_PRICE[tier];
    const months = 1 + Math.floor(rand() * 6);
    for (let i = 0; i < months; i++) {
      const date = monthOffset(signupMs, i + 1);
      const status = rand() < 0.92 ? "succeeded" : rand() < 0.5 ? "pending" : "failed";
      paymentHistory.push({
        date: date.toISOString().slice(0, 10),
        amountUsd: price,
        plan: tier,
        period: "monthly",
        status,
      });
    }
  }

  // Renewals — only paid tiers, next billing 7-30 days after `lastActiveAt`.
  const renewals =
    tier === "free"
      ? []
      : [
          {
            plan: tier,
            period: PERIODICITY[tier],
            amountUsd: PLAN_PRICE[tier],
            nextBillingAt: isodate(dayMs(u.lastActiveAt) + (7 + Math.floor(rand() * 23)) * 86400000),
          },
        ];

  // Quota extension history — only for free users with low quota, plus a few
  // paid users with credit notes.
  const quotaHistory = [];
  if (tier === "free") {
    if (rand() < 0.4) {
      quotaHistory.push({
        date: isodate(dayMs(u.lastActiveAt) - rand() * 86400000 * 20),
        amount: 50 + Math.floor(rand() * 150),
        by: ADMIN,
        reason: pickN(rand, ["Comp outage credit", "Beta tester thanks", "Promo code: COMP-50"], 1)[0],
      });
    }
  } else if (rand() < 0.3) {
    quotaHistory.push({
      date: isodate(dayMs(u.lastActiveAt) - rand() * 86400000 * 30),
      amount: 100 + Math.floor(rand() * 500),
      by: ADMIN,
      reason: "SLA credit for upstream Gemini brownout",
    });
  }

  // Action timeline — populate a few rows for users with interesting history.
  const actionTimeline = [];
  if (u.status === "suspended") {
    actionTimeline.push({
      ts: isodate(dayMs(u.lastActiveAt) - 86400000),
      actor: ADMIN,
      action: "userStatus",
      summary: "suspended — suspicious payment pattern",
    });
  } else if (u.status === "grace") {
    actionTimeline.push({
      ts: isodate(dayMs(u.lastActiveAt) - 86400000),
      actor: ADMIN,
      action: "userStatus",
      summary: "moved to grace period (payment retry #2)",
    });
  }
  if (quotaHistory.length) {
    for (const q of quotaHistory) {
      actionTimeline.push({
        ts: q.date,
        actor: q.by,
        action: "quotaOverride",
        summary: `+${q.amount} requests — ${q.reason}`,
      });
    }
  }
  if (tier !== "free" && rand() < 0.5) {
    actionTimeline.push({
      ts: isodate(dayMs(u.lastActiveAt) - rand() * 86400000 * 60),
      actor: ADMIN,
      action: "tierChange",
      summary: `upgraded to ${tier}`,
    });
  }
  if (rand() < 0.25) {
    actionTimeline.push({
      ts: isodate(dayMs(u.lastActiveAt) - rand() * 86400000 * 90),
      actor: ADMIN,
      action: "login",
      summary: "reviewed account per support request",
    });
  }

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    tier: u.tier,
    status: u.status,
    requestsUsed: u.requestsUsed,
    requestsLimit: u.requestsLimit,
    tokensSpent: u.tokensSpent,
    costUsd: u.costUsd,
    lastActiveAt: u.lastActiveAt,
    signupDate: u.signupDate,
    platform: u.platform,
    signupSource: u.signupSource ?? u.platform,
    avatarUrl: u.avatarUrl,
    modelDistribution,
    ticketIds: tickets,
    memory,
    paymentHistory,
    quotaHistory,
    renewals,
    actionTimeline,
  };
}

const out = USERS.map(generateFor);
const dest = path.join(ROOT, "src/data/user-details.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`Wrote ${out.length} rows to ${path.relative(ROOT, dest)}`);
