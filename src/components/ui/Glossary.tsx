"use client";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Numeric } from "@/components/numeric/Numeric";

/**
 * Accessible glossary tooltips for technical dashboard terms.
 *
 * Each entry renders the project's standard `InfoTooltip` (which itself
 * wraps the existing Radix tooltip primitive) so that jargon → plain
 * language mappings are reachable by hover, keyboard focus, and touch.
 *
 * Keep definitions short, jargon-free, and actionable: explain what the
 * number/setting tells the admin to do, not what it is in the abstract.
 */
const ENTRIES = {
  p50: {
    label: "About p50 latency",
    body: (
      <>
        The <strong>median</strong> response time: half of all requests
        finished faster than this. Use it to gauge the typical
        experience users see.
      </>
    ),
  },
  p95: {
    label: "About p95 latency",
    body: (
      <>
        The <strong><Numeric value={95} suffix="th" /> percentile</strong>{" "}
        response time: <Numeric value={95} /> out of every one hundred
        requests finished faster than this. It exposes the slow tail
        that the median hides; spikes here often predict user-visible
        slowness.
      </>
    ),
  },
  errorRate: {
    label: "About error rate",
    body: (
      <>
        Share of requests that failed in the period. Anything consistently
        above <Numeric value="1%" /> usually warrants investigation;
        sustained readings above <Numeric value="5%" /> are a paging
        event.
      </>
    ),
  },
  uptime: {
    label: "About uptime",
    body: (
      <>
        Share of time the provider answered requests successfully.
        We track this on a rolling <Numeric value="30" suffix="d" />{" "}
        window; closer to <Numeric value="100%" /> is better, and anything
        below <Numeric value="99%" /> is unhealthy.
      </>
    ),
  },
  circuitBreaker: {
    label: "About circuit breaker",
    body: (
      <>
        A safety switch that <strong>temporarily stops sending traffic</strong>{" "}
        to a failing provider so we don&apos;t amplify an outage. It cycles
        through <em>closed</em> (normal) → <em>open</em> (paused) →{" "}
        <em>half-open</em> (testing) as the provider recovers.
      </>
    ),
  },
  modelConfiguration: {
    label: "About model configuration",
    body: (
      <>
        Controls which AI models your clients can pick from. Disabling a
        model removes it from the model picker immediately; users who
        already had it selected fall back to their tier&apos;s default on
        the next request.
      </>
    ),
  },
  priorityRouting: {
    label: "About priority routing",
    body: (
      <>
        Higher tiers jump the queue. When a provider is congested,
        Business requests are routed before Pro, and Pro before Free,
        so paying users stay fast even during spikes.
      </>
    ),
  },
  arpu: {
    label: "About ARPU",
    body: (
      <>
        <strong>Average Revenue Per User</strong>: total revenue divided by
        the number of paying customers in the period. A north-star for
        monetisation &mdash; compare against plan price to see if
        upsells/cross-sells are landing.
      </>
    ),
  },
  arr: {
    label: "About ARR",
    body: (
      <>
        <strong>Annual Recurring Revenue</strong>: MRR ×
        {" "}<Numeric value="12" />. The forward-looking yearly run
        rate, ignoring one-offs. Investors and execs read this as the
        headline &ldquo;size&rdquo; metric.
      </>
    ),
  },
  churn: {
    label: "About churn",
    body: (
      <>
        Share of paying customers who cancelled or failed to renew in the
        period. Lower is better. Below{" "}
        <Numeric value="3%" /> monthly is healthy for SaaS; sustained
        readings above <Numeric value="5%" /> usually mean onboarding,
        pricing, or product-fit friction.
      </>
    ),
  },
  token: {
    label: "About tokens",
    body: (
      <>
        Small chunks of text (roughly <Numeric value="4" /> characters in
        English) that the model reads and writes. Billing is per{" "}
        <Numeric value="1000" /> tokens for both the prompt we send and
        the answer the model returns, so longer conversations cost more.
      </>
    ),
  },
  rateLimit: {
    label: "About rate limits",
    body: (
      <>
        The maximum number of requests a user can make in a window
        (requests/minute, tokens/minute, etc.). When a user hits a limit,
        further requests are throttled with a <Numeric value="429" />
        {" "}response until the window resets.
      </>
    ),
  },
} as const;

export type GlossaryTerm = keyof typeof ENTRIES;

/**
 * `<GlossaryTooltip term="p95" />` renders the standard InfoTooltip with
 * the canonical plain-language definition for that term. The `term` is
 * also exposed as a `data-glossary` attribute on the trigger for testing.
 */
export function GlossaryTooltip({
  term,
  side,
  className,
}: {
  term: GlossaryTerm;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  const entry = ENTRIES[term];
  return (
    <InfoTooltip
      label={entry.label}
      side={side}
      className={className}
      triggerAttrs={{ "data-glossary": term }}
    >
      {entry.body}
    </InfoTooltip>
  );
}

/**
 * Exposed for tests & docs. Each entry is `{ term, label, body }`.
 */
export const glossaryEntries = Object.fromEntries(
  (Object.entries(ENTRIES) as [GlossaryTerm, (typeof ENTRIES)[GlossaryTerm]][]).map(
    ([term, value]) => [term, { term, ...value }],
  ),
) as Record<GlossaryTerm, { term: GlossaryTerm; label: string; body: React.ReactNode }>;
