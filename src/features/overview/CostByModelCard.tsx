"use client";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Numeric } from "@/components/numeric/Numeric";
import { AppText } from "@/shared/ui/AppText";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { formatNumber, formatPercent } from "@/shared/lib/format";
import type { ModelId } from "@/shared/api/types";

const LABELS: Record<ModelId, string> = {
  gpt: "OpenAI",
  gemini: "Gemini",
  claude: "Claude",
  grok: "Grok",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
};

const MODEL_VAR: Record<ModelId, string> = {
  gpt: "var(--model-gpt)",
  gemini: "var(--model-gemini)",
  claude: "var(--model-claude)",
  grok: "var(--model-grok)",
  deepseek: "var(--model-deepseek)",
  perplexity: "var(--model-perplexity)",
};

export function CostByModelCard({
  rows,
  days = 30,
}: {
  rows: { modelId: ModelId; cost: number; tokens?: number }[];
  days?: number;
}) {
  const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
  const totalTokens = rows.reduce((sum, row) => sum + (row.tokens ?? 0), 0);
  // Sort descending by cost so the biggest contributor is at the top.
  const sorted = [...rows].sort((a, b) => b.cost - a.cost);
  const topCost = sorted[0]?.cost ?? 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <AppText role="card">
            Cost by model · <Numeric value={days} suffix="d" />
          </AppText>
          <InfoTooltip label="About cost by model">
            Total USD billed per upstream model in the selected window. The
            largest row is the biggest contributor to your invoice. Use this
            to spot cost spikes before they hit budget.
          </InfoTooltip>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span>
            Total cost:{" "}
            <span className="_num font-medium text-[var(--text-primary)]">
              <Numeric value={formatNumber(totalCost)} />
            </span>
          </span>
          <span>
            Total tokens:{" "}
            <span className="_num font-medium text-[var(--text-primary)]">
              <Numeric value={formatNumber(totalTokens)} />
            </span>
          </span>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-4 py-4 sm:px-6">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[18%]" />
              <col className="w-[28%]" />
              <col className="w-[20%]" />
            </colgroup>
            <THead>
              <TR>
                <TH className="px-3">Model</TH>
                <TH className="px-3 text-end">Cost (USD)</TH>
                <TH className="px-3">Share</TH>
                <TH className="px-3 text-end">
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Tokens
                    <InfoTooltip label="About tokens billed">
                      Total tokens (input + output) consumed per model in the
                      selected window. Compare against cost: a low-cost,
                      high-token model is efficient; high-cost with low tokens
                      means a premium endpoint.
                    </InfoTooltip>
                  </span>
                </TH>
              </TR>
            </THead>
            <TBody>
              {sorted.map((r) => {
                const share = totalCost > 0 ? r.cost / totalCost : 0;
                const width = topCost > 0 ? (r.cost / topCost) * 100 : 0;
                return (
                  <TR key={r.modelId}>
                    <TD className="px-3 font-medium text-[var(--text-primary)]">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full"
                          style={{ background: MODEL_VAR[r.modelId] }}
                        />
                        {LABELS[r.modelId]}
                      </span>
                    </TD>
                    <TD className="whitespace-nowrap px-3 text-end _num">
                      <Numeric value={formatNumber(r.cost)} />
                    </TD>
                    <TD className="px-3">
                      <div
                        className="flex items-center gap-2"
                        title={`${r.cost} of ${totalCost}`}
                      >
                        <div
                          className="relative h-1.5 grow overflow-hidden rounded-full bg-[var(--bg-subtle)]"
                          role="presentation"
                        >
                          <div
                            className="absolute inset-y-0 start-0 rounded-full"
                            style={{
                              width: `${width}%`,
                              background: MODEL_VAR[r.modelId],
                            }}
                          />
                        </div>
                        <span className="shrink-0 text-xs text-[var(--text-secondary)] _num">
                          <Numeric value={formatPercent(share)} />
                        </span>
                      </div>
                    </TD>
                    <TD className="whitespace-nowrap px-3 text-end _num text-[var(--text-secondary)]">
                      <Numeric value={r.tokens ? formatNumber(r.tokens) : "—"} />
                    </TD>
                  </TR>
                );
              })}
              <TR className="border-b-0 bg-[var(--bg-subtle)] font-medium hover:bg-[var(--bg-subtle)]">
                <TD className="px-3 text-[var(--text-primary)]">Total</TD>
                <TD className="whitespace-nowrap px-3 text-end _num text-[var(--text-primary)]">
                  <Numeric value={formatNumber(totalCost)} />
                </TD>
                <TD className="px-3">
                  <span className="text-xs text-[var(--text-secondary)] _num">
                    <Numeric value="100%" />
                  </span>
                </TD>
                <TD className="whitespace-nowrap px-3 text-end _num text-[var(--text-primary)]">
                  <Numeric value={formatNumber(totalTokens)} />
                </TD>
              </TR>
            </TBody>
          </Table>
        </div>
      </CardBody>
    </Card>
  );
}