import { AlertTriangle, Check, Zap } from "lucide-react";
import type { BoostPreset } from "../../types/tweak";
import { TWEAK_MAP } from "../../data/tweaks";
import { useI18n, useTweakText } from "../../i18n/I18nProvider";
import { RiskBadge } from "../tweaks/RiskBadge";

type BoostCardProps = {
  preset: BoostPreset;
  onApply: (preset: BoostPreset) => void;
  applying?: boolean;
};

function TweakListItem({ id }: { id: string }) {
  const tweak = TWEAK_MAP[id];
  const { name } = useTweakText(id, tweak?.name ?? id, tweak?.description ?? "");
  return (
    <li className="flex items-center gap-2 text-[12px] text-text-secondary">
      <Check className="h-3 w-3 shrink-0 text-accent" />
      <span className="truncate">{name}</span>
    </li>
  );
}

export function BoostCard({ preset, onApply, applying }: BoostCardProps) {
  const { t } = useI18n();
  const tweaks = preset.tweakIds.map((id) => TWEAK_MAP[id]).filter(Boolean);
  const name = t(`boost.${preset.id}.name`, undefined, preset.name);
  const tagline = t(`boost.${preset.id}.tagline`, undefined, preset.tagline);
  const warning = t(`boost.${preset.id}.warning`, undefined, preset.warning);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border bg-surface px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-text">{name}</h3>
              <RiskBadge risk={preset.risk} />
            </div>
            <p className="mt-0.5 text-[12px] text-text-secondary">{tagline}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-accent/20 bg-accent-muted">
            <Zap className="h-4 w-4 text-accent" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
          {t("guideUi.includes", { count: tweaks.length })}
        </p>
        <ul className="space-y-1.5">
          {tweaks.slice(0, 6).map((tw) => (
            <TweakListItem key={tw.id} id={tw.id} />
          ))}
          {tweaks.length > 6 && (
            <li className="pl-5 text-[11px] text-muted">
              +{tweaks.length - 6} {t("common.more")}
            </li>
          )}
        </ul>

        <div className="mt-4 flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
          <p className="text-[11px] leading-relaxed text-text-secondary">{warning}</p>
        </div>
      </div>

      <div className="border-t border-border px-5 py-3">
        <button
          type="button"
          disabled={applying}
          onClick={() => onApply(preset)}
          className={[
            "w-full rounded-md py-2.5 text-[13px] font-semibold transition-opacity",
            preset.advisorOnly
              ? "border border-border bg-elevated text-text hover:border-accent/40"
              : "bg-accent text-void hover:opacity-90",
            applying ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          {preset.advisorOnly
            ? t("guideUi.viewChecklist")
            : applying
              ? t("guideUi.applying")
              : t("guideUi.applyBoost")}
        </button>
        {preset.requiresRestorePoint && (
          <p className="mt-2 text-center text-[10px] text-warning">
            {t("guideUi.restoreRecommended")}
          </p>
        )}
      </div>
    </div>
  );
}
