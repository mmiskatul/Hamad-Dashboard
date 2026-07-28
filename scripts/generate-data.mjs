// scripts/generate-data.mjs — runs once during scaffolding to produce dummy JSON.
import fs from "node:fs";

const tiers = ["free", "pro", "business"];
const statuses = [
  "active", "active", "active", "active", "active", "active", "active", "suspended", "grace",
];
const platforms = ["ios", "android", "web"];
const firsts = [
  "Ada","Bilal","Camila","Daniyal","Elif","Farah","Gabriel","Hira","Idris","Jana","Khalid","Layla",
  "Mateo","Nadia","Omar","Petra","Qasim","Rania","Salma","Tariq","Una","Viktor","Waqas","Xiomara",
  "Yara","Zaid","Anya","Bilqis","Cosmin","Daria","Esme","Felipe","Gulnaz","Haruki","Iman","Julien",
  "Karima","Liang","Minahil","Niels","Ozge","Pawel","Qadir","Romi","Sasha","Talin","Umar","Vahid",
  "Wren","Yusra","Zane","Aleks","Bisma","Cyrus","Dilara","Eero","Fatou","Gojo","Hina","Ilse",
  "Jibril","Kenji","Lana",
];
const lasts = [
  "Khan","Diallo","Ahmed","Patel","Tanaka","Garcia","Chen","Hussain","Reyes","Iqbal","Murphy","Kim",
  "Cohen","Lopez","Park","Awan","Vargas","Mendez","Nair","Sato","Rossi","Mahmood","Hernandez","Nguyen",
  "Becker","Ali","Mendoza","Schmidt","Hassan","Suzuki","Diaz","Akhtar","Cruz","Walsh","Prasad","Pinto",
  "Larsen","Jansen","Yamamoto","Russo","Wong","Maguire","Oduya","Brooks","Carter","Aslan","Beauchamp",
  "Pereira",
];
const providers = ["gpt","gemini","claude","grok","deepseek","perplexity"];
const providerNames = {
  gpt:"OpenAI GPT", gemini:"Google Gemini", claude:"Anthropic Claude",
  grok:"xAI Grok", deepseek:"DeepSeek", perplexity:"Perplexity",
};

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const r = rng(42);

function write(name, data) {
  fs.writeFileSync(`src/data/${name}`, JSON.stringify(data, null, 2));
}

const users = [];
for (let i = 1; i <= 60; i++) {
  const f = firsts[(i * 3) % firsts.length];
  const l = lasts[(i * 7) % lasts.length];
  const emailDomain = ["gmail.com","outlook.com","proton.me","hey.com","acme.co","studioklein.com","northwind.io","fastmail.com"][i % 8];
  const tier = tiers[Math.min(tiers.length - 1, Math.floor((i + 1) / 18))];
  const status = statuses[i % statuses.length];
  const signup = new Date(2024, 5, (i * 3) % 28, 9, 0, 0).toISOString();
  const daysSinceActive = Math.floor(r() * 21);
  const lastActive = new Date(Date.now() - daysSinceActive * 86400000).toISOString();
  const requestsLimit = tier === "free" ? 100 : tier === "pro" ? 500 : 2500;
  const requestsUsed = Math.floor(requestsLimit * (0.15 + r() * 0.85));
  const costUsd = +(requestsUsed * (0.0035 + r() * 0.012)).toFixed(2);
  const tokensSpent = requestsUsed * (1500 + Math.floor(r() * 6000));
  users.push({
    id: `usr_${(1000 + i).toString(36)}`,
    name: `${f} ${l}`,
    email: `${f.toLowerCase()}.${l.toLowerCase()}${i}@${emailDomain}`,
    tier,
    status,
    requestsUsed,
    requestsLimit,
    costUsd,
    tokensSpent,
    lastActiveAt: lastActive,
    signupDate: signup,
    platform: platforms[i % 3],
  });
}
write("users.json", users);

const detailUser = users[3];
const dist = { gpt:0, gemini:0, claude:0, grok:0, deepseek:0, perplexity:0 };
let total = 1000;
for (const k of Object.keys(dist)) {
  dist[k] = Math.floor(r() * total);
  total -= dist[k];
}
dist.gpt += total;
write("user-detail.json", {
  ...detailUser,
  modelDistribution: dist,
  ticketIds: ["tkt_001", "tkt_004"],
});

const providerRows = providers.map((p) => ({
  id: `prov_${p}`,
  name: providerNames[p],
  modelId: p,
  status: p === "grok" ? "degraded" : r() > 0.9 ? "degraded" : "operational",
  p50Ms: 400 + Math.floor(r() * 400),
  p95Ms: 600 + Math.floor(r() * 1800),
  errorRate: +(0.001 + r() * 0.04).toFixed(3),
  uptime: +(0.985 + r() * 0.015).toFixed(4),
  circuit: p === "grok" ? "half-open" : r() > 0.85 ? "half-open" : "closed",
  sparkline: Array.from({ length: 24 }, () => +(r() * 100).toFixed(0)),
}));
write("providers-health.json", providerRows);

write("overview.json", {
  health: "healthy",
  providersUp: providerRows.filter((p) => p.status === "operational").length,
  providersTotal: providerRows.length,
  mrr: 18240,
  mrrDelta: 0.042,
  spend30d: 6918,
  spendMargin: 0.62,
  spendDelta: 0.118,
  activeUsers: 3412,
  activeUsersDelta: -0.011,
  newUsers: 214,
  sparklines: {
    mrr: Array.from({ length: 30 }, (_, i) => 15000 + Math.floor(r() * 4500) + i * 100),
    spend: Array.from({ length: 30 }, (_, i) => 5000 + Math.floor(r() * 2500) + i * 50),
    active: Array.from({ length: 30 }, (_, i) => 3200 + Math.floor(r() * 400) - i * 5),
  },
  costByModel: providers.map((p, i) => ({
    modelId: p,
    cost: 2000 + i * 430 + Math.floor(r() * 300),
    tokens: 8_000_000 + i * 3_500_000,
  })),
});

const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
write("revenue.json", {
  mrrSeries: months.map((m, i) => ({ month: m, mrr: 12200 + i * 520 + Math.floor(r() * 300) })),
  tierMix: [
    { tier: "free", users: 8400, revenue: 0 },
    { tier: "pro", users: 2140, revenue: 10700 },
    { tier: "business", users: 312, revenue: 7540 },
  ],
  churn: months.map((m, i) => ({ month: m, churn: +(0.018 + r() * 0.012).toFixed(3), newMrr: 800 + Math.floor(r() * 600) })),
  arpu: 7.32,
  arr: 218880,
  churnRate: 0.024,
  funnel: [
    { stage: "Visitors", value: 24000 },
    { stage: "Signups", value: 10420 },
    { stage: "Activated", value: 6420 },
    { stage: "Subscribed", value: 2452 },
  ],
});

const dates = Array.from({ length: 14 }, (_, i) =>
  new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
);
const seriesMap = { gpt:0, gemini:0, claude:0, grok:0, deepseek:0, perplexity:0 };
const tokensByModel = dates.map((d) => ({
  date: d,
  series: {
    ...seriesMap,
    gpt: 400000 + Math.floor(r() * 120000),
    gemini: 280000 + Math.floor(r() * 90000),
    claude: 520000 + Math.floor(r() * 150000),
    grok: 120000 + Math.floor(r() * 60000),
    deepseek: 90000 + Math.floor(r() * 40000),
    perplexity: 60000 + Math.floor(r() * 30000),
  },
}));
write("usage.json", {
  tokensByModel,
  costByModel: providers.map((p) => ({
    modelId: p,
    cost: 2000 + Math.floor(r() * 2000),
    tokens: 8_000_000 + Math.floor(r() * 6_000_000),
  })),
  topUsers: users.slice(0, 8).map((u) => ({
    userId: u.id,
    email: u.email,
    spend: Math.round(u.costUsd * 2.4 * 100) / 100,
    tokens: u.tokensSpent * 2,
  })),
});

const ticketSubjects = [
  "Login keeps failing on Android","Refund for duplicate charge","Cannot disable Grok on iOS",
  "Account suspended unexpectedly","Switching from Free to Pro","Rate-limit during peak hours",
  "Export conversations not working","Two-factor code never arrives","Quota reset looks wrong",
  "Change billing email","Perplexity results blank","Add a teammate to Business",
];
const ticketStatuses = ["open","open","pending","open","resolved","open","pending","open","resolved","open","open","pending"];
const ticketPriorities = ["normal","high","normal","high","low","high","normal","normal","low","normal","low","high"];
const tickets = ticketSubjects.map((s, i) => ({
  id: `tkt_${(i + 1).toString().padStart(3, "0")}`,
  userId: users[(i * 4) % users.length].id,
  userEmail: users[(i * 4) % users.length].email,
  subject: s,
  status: ticketStatuses[i],
  priority: ticketPriorities[i],
  assignedTo: i % 3 === 0 ? null : "admin@oneai.app",
  createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
  hasAttachment: i === 2,
  attachmentExpiresAt: i === 2 ? new Date(Date.now() + 27 * 86400000).toISOString() : null,
}));
write("support-tickets.json", tickets);

write("ticket-detail.json", {
  ...tickets[0],
  description: "User reports sign-out loop after upgrading to Pro. Works on web, fails on iOS 17.",
  timeline: [
    { id: "ev_1", at: new Date(Date.now() - 86400000).toISOString(), actor: users[0].email, note: "Ticket opened." },
    { id: "ev_2", at: new Date(Date.now() - 82800000).toISOString(), actor: "admin@oneai.app", note: "Acknowledged. Asked for device logs." },
    { id: "ev_3", at: new Date(Date.now() - 3600000).toISOString(), actor: "admin@oneai.app", note: "Logs reviewed. Escalating to engineering." },
  ],
});

write("config-models.json", providers.map((p) => ({
  id: p,
  label: providerNames[p],
  enabled: p !== "grok",
  affectedUsers: p === "grok" ? 47 : Math.floor(r() * 300),
})));

write("config-tiers.json", [
  { id: "free", name: "Free", monthlyUsd: 0, requestsPerMonth: 100,
    features: ["Access to Free-tier models","Email support","Single device"] },
  { id: "pro", name: "Pro", monthlyUsd: 5, requestsPerMonth: 500,
    features: ["All models including Grok","Priority support","Three devices","Faster queue"] },
  { id: "business", name: "Business", monthlyUsd: 24, requestsPerMonth: 2500,
    features: ["Everything in Pro","Team seats","SSO and audit log","SLA-backed support","Custom rate limits"] },
]);

const auditActions = ["login","quotaOverride","userStatus","providerToggle","tierChange","modelToggle","sessionRevoked"];
const auditReasons = [
  "Pro-tier migration grace","Customer success request","Manual override for incident",
  "Suspicious API pattern","Restoring access post-chargeback","Maintenance window",
];
write("audit.json", Array.from({ length: 30 }, (_, i) => ({
  id: `aud_${(i + 1).toString().padStart(4, "0")}`,
  at: new Date(Date.now() - i * 18000000).toISOString(),
  actor: "admin@oneai.app",
  action: auditActions[i % auditActions.length],
  target: ["usr_a3","prov_grok","tkt_001","model_gpt","tier_pro"][i % 5],
  reason: auditReasons[i % auditReasons.length],
  ip: `10.0.${(i % 12) + 1}.${(i * 7) % 250 + 1}`,
})));

write("admin-account.json", {
  id: "admin_001",
  name: "Mahfuz Rahman",
  email: "admin@oneai.app",
  totpEnabled: true,
  sessions: [
    { id: "sess_curr", device: "MacBook Pro", location: "Berlin, DE", ip: "85.214.32.10", lastActiveAt: new Date().toISOString(), current: true },
    { id: "sess_2", device: "iPhone", location: "Berlin, DE", ip: "85.214.32.10", lastActiveAt: new Date(Date.now() - 3600000).toISOString(), current: false },
  ],
});

fs.writeFileSync("src/data/schema.md",
  "# Dummy data shapes\n\nAll files live in `src/data/`. Each shape matches `src/shared/api/types.ts`.\nNone contain `content` / `messages` / `transcripts` / `body` / `text` fields - enforced by `tests/privacy.test.ts`.\n");

console.log("data generated");
