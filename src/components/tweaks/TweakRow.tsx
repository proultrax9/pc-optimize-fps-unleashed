import { AlertTriangle, BookOpen, RotateCcw, Shield } from "lucide-react";
import type { Tweak } from "../../types/tweak";
import { useI18n, useTweakText } from "../../i18n/I18nProvider";
import { RiskBadge } from "./RiskBadge";

type TweakRowProps = {
  tweak: Tweak;
  enabled: boolean;
  onToggle: (id: string) => void;
  onOpenGuide?: (id: string) => void;
  disabled?: boolean;
};

export function TweakRow({ tweak, enabled, onToggle, onOpenGuide, disabled }: TweakRowProps) {
  const { t } = useI18n();
  const { name, description } = useTweakText(tweak.id, tweak.name, tweak.description);
  const isAdvisor = tweak.advisorOnly;

  return (
    <div className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-glow hover:bg-card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[13px] font-semibold text-text">{name}</h3>
            <RiskBadge risk={tweak.risk} />
            {isAdvisor && (
              <span className="inline-flex items-center gap-1 rounded border border-accent/30 bg-accent-muted px-1.5 py-0.5 text-[10px] font-medium text-accent">
                <BookOpen className="h-2.5 w-2.5" />
                {t("common.advisor")}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-text-secondary">{description}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted">
            {tweak.requiresAdmin && (
              <span className="inline-flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                {t("common.admin")}
              </span>
            )}
            {tweak.requiresRestart && (
              <span className="inline-flex items-center gap-1">
                <RotateCcw className="h-2.5 w-2.5" />
                {t("common.restart")}
              </span>
            )}
            {tweak.requiresRestorePoint && (
              <span className="inline-flex items-center gap-1 text-warning">
                <AlertTriangle className="h-2.5 w-2.5" />
                {t("common.restorePoint")}
              </span>
            )}
          </div>
        </div>

        {isAdvisor ? (
          <button
            type="button"
            onClick={() => onOpenGuide?.(tweak.id)}
            disabled={disabled}
            className="shrink-0 rounded-md border border-border bg-elevated px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
          >
            {t("common.openGuide")}
          </button>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggle(tweak.id)}
            disabled={disabled}
            className={[
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50",
              enabled ? "bg-accent" : "bg-elevated border border-border",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                enabled ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        )}
      </div>
    </div>
  );
}
