import type { RiskLevel } from "../../types/tweak";
import { useI18n } from "../../i18n/I18nProvider";

const STYLES: Record<RiskLevel, string> = {
  safe: "border-success/30 bg-success/10 text-success",
  medium: "border-warning/30 bg-warning/10 text-warning",
  high: "border-danger/30 bg-danger/10 text-danger",
  extreme: "border-danger/50 bg-danger/15 text-danger",
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[risk]}`}
    >
      {t(`risk.${risk}`)}
    </span>
  );
}
