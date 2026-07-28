"use client";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { Input, Label } from "@/components/ui/input";
import { Numeric } from "@/components/numeric/Numeric";
import { Switch } from "@/components/ui/switch";
import { formatNumber } from "@/shared/lib/format";
import type { ModelConfig, ModelId, TierConfig } from "@/shared/api/types";

const MODEL_LABELS: Record<ModelId, string> = {
  gpt: "OpenAI",
  gemini: "Gemini",
  claude: "Claude",
  grok: "Grok",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
};

const MODEL_VARS: Record<ModelId, string> = {
  gpt: "--model-gpt",
  gemini: "--model-gemini",
  claude: "--model-claude",
  grok: "--model-grok",
  deepseek: "--model-deepseek",
  perplexity: "--model-perplexity",
};

export function TierCard({
  tier,
  models,
  onChange,
}: {
  tier: TierConfig;
  models: ModelConfig[];
  onChange: (next: TierConfig) => void;
}) {
  const t = useTranslations("configTiers");
  const tc = useTranslations("common");

  const set = <K extends keyof TierConfig>(key: K, value: TierConfig[K]) => {
    onChange({ ...tier, [key]: value });
  };

  const toggleModel = (id: ModelId) => {
    const next = tier.models.includes(id)
      ? tier.models.filter((m) => m !== id)
      : [...tier.models, id];
    set("models", next);
  };

  const setFeature = (key: keyof TierConfig["features"], value: boolean) => {
    set("features", { ...tier.features, [key]: value });
  };

  return (
    <div className="space-y-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--e1)]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">{tier.name}</h3>
        <Numeric
          value={tier.monthlyUsd === 0 ? "Free" : formatNumber(tier.monthlyUsd)}
          className="text-sm font-medium"
          suffix={tier.monthlyUsd > 0 ? "USD/mo" : undefined}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`${tier.id}-price`}>{t("priceUsd")}</Label>
          <Input
            id={`${tier.id}-price`}
            type="number"
            min={0}
            step={0.5}
            value={tier.monthlyUsd}
            inputMode="decimal"
            onChange={(e) => set("monthlyUsd", Math.max(0, Number(e.target.value)))}
            className="mt-2"
            suffix={tc("usdShort")}
          />
        </div>
        <div>
          <Label htmlFor={`${tier.id}-req`}>{t("requestsLimit")}</Label>
          <Input
            id={`${tier.id}-req`}
            type="number"
            value={tier.requestsLimit}
            onChange={(e) => set("requestsLimit", Number(e.target.value))}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor={`${tier.id}-tok`}>{t("tokensLimit")}</Label>
          <Input
            id={`${tier.id}-tok`}
            type="number"
            value={tier.tokensLimit}
            onChange={(e) => set("tokensLimit", Number(e.target.value))}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label>{t("models")}</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {models.map((m) => {
            const included = tier.models.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleModel(m.id)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-[var(--radius-full)] border px-3 py-1 text-xs transition",
                  included
                    ? "border-[var(--action-primary)] bg-[var(--action-primary-transparent)] text-[var(--text-primary)]"
                    : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]",
                )}
                aria-pressed={included}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: `var(${MODEL_VARS[m.id]})` }}
                />
                {MODEL_LABELS[m.id]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>{t("features")}</Label>
        <div className="mt-2 space-y-2 text-sm">
          <FeatureRow
            label={t("fileUpload")}
            checked={tier.features.fileUpload}
            onChange={(v) => setFeature("fileUpload", v)}
          />
          <FeatureRow
            label={t("voice")}
            checked={tier.features.voice}
            onChange={(v) => setFeature("voice", v)}
          />
          <FeatureRow
            label={t("priority")}
            checked={tier.features.priority}
            onChange={(v) => setFeature("priority", v)}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-primary)]">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
