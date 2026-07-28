#!/usr/bin/env node
/**
 * One-shot enrichment of users.json. Adds avatarUrl, signupSource,
 * paymentHistory, quotaHistory, renewals arrays per user. Per-tier rules:
 *
 *   free     -> empty paymentHistory
 *   pro      -> 1-3 monthly payments
 *   business -> 1-6 monthly payments
 *
 * Run from admin-dashboard/: `node scripts/enrich-users.mjs`
 */
import fs from "node:fs";
import path from "node:path";

const USERS_PATH = path.resolve("src/data/users.json");
const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));

function isoMinus(days) {
  const d = new Date("2026-07-24T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function isoPlus(days) {
  const d = new Date("2026-07-24T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

const enriched = users.map((u, idx) => {
  const avatarUrl = "/brand/hex-ring.svg";
  const signupSource = u.platform;
  const seed = idx * 17 + 5;

  let paymentHistory = [];
  if (u.tier === "pro") {
    const months = (seed % 3) + 1;
    for (let i = 0; i < months; i++) {
      paymentHistory.push({
        date: isoMinus(30 * (i + 1)),
        amountUsd: 19,
        plan: "pro",
        period: "monthly",
        status: "succeeded",
      });
    }
  } else if (u.tier === "business") {
    const months = (seed % 6) + 1;
    for (let i = 0; i < months; i++) {
      paymentHistory.push({
        date: isoMinus(30 * (i + 1)),
        amountUsd: 99,
        plan: "business",
        period: "monthly",
        status: "succeeded",
      });
    }
  }

  const quotaHistory = (seed % 4 === 0)
    ? [
        {
          date: isoMinus((seed % 20) + 5),
          amount: 50 + (seed % 100),
          by: "admin@oneai.app",
          reason: "Comp outage credit",
        },
      ]
    : [];

  const renewals = u.tier === "free"
    ? []
    : [
        {
          plan: u.tier,
          period: "monthly",
          amountUsd: u.tier === "business" ? 99 : 19,
          nextBillingAt: isoPlus(((seed % 20) + 5)),
        },
      ];

  return {
    ...u,
    avatarUrl,
    signupSource,
    paymentHistory,
    quotaHistory,
    renewals,
  };
});

fs.writeFileSync(USERS_PATH, JSON.stringify(enriched, null, 2) + "\n");
console.log(`Enriched ${enriched.length} users.`);