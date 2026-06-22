import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TWEAKS, TWEAK_CATEGORIES } from "../data/tweaks";
import { useTweaks } from "../context/TweakProvider";
import type { TweakCategory } from "../types/tweak";
import { EXPERT_GUIDE_MAP, localizeExpertGuide } from "../data/expert-guides";
import { ExpertChecklistModal } from "../components/boost/ExpertChecklistModal";
import { PageHeader } from "../components/dashboard/StatCard";
import { TabBar } from "../components/tweaks/TabBar";
import { TweakRow } from "../components/tweaks/TweakRow";
import { useI18n } from "../i18n/I18nProvider";

export function TweaksPage() {
  const { t } = useI18n();
  const [category, setCategory] = useState<TweakCategory>("windows");
  const [guideId, setGuideId] = useState<string | null>(null);
  const { isEnabled, toggle, activeCount, totalCount, busy } = useTweaks();

  const tabs = useMemo(
    () =>
      TWEAK_CATEGORIES.map((c) => ({
        id: c.id,
        label: t(`categories.${c.id}`),
        count: TWEAKS.filter((tw) => tw.category === c.id).length,
      })),
    [t],
  );

  const filtered = TWEAKS.filter((tw) => tw.category === category);
  const baseGuide = guideId ? EXPERT_GUIDE_MAP[guideId] : null;
  const localizedGuide = baseGuide ? localizeExpertGuide(baseGuide, t) : null;

  return (
    <div>
      <PageHeader
        title={t("pages.tweaks.title")}
        subtitle={t("pages.tweaks.subtitle")}
        action={
          <span className="rounded-md border border-border bg-elevated px-2.5 py-1 font-mono text-[11px] text-text-secondary">
            {activeCount}/{totalCount} {t("common.active")}
          </span>
        }
      />

      <div className="mb-5">
        <TabBar tabs={tabs} active={category} onChange={setCategory} />
      </div>

      {category === "advanced" && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-[12px] text-text-secondary">
          {t("pages.tweaks.advancedWarn")}
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((tweak) => (
          <TweakRow
            key={tweak.id}
            tweak={tweak}
            enabled={isEnabled(tweak.id)}
            onToggle={toggle}
            onOpenGuide={setGuideId}
            disabled={busy === tweak.id}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted">
        {t("pages.tweaks.bundleHint")}{" "}
        <Link to="/boost" className="text-accent hover:underline">
          {t("pages.tweaks.bundleLink")}
        </Link>
      </p>

      <ExpertChecklistModal
        open={guideId !== null && localizedGuide !== null}
        guides={localizedGuide ? [localizedGuide] : []}
        focusId={guideId}
        onClose={() => setGuideId(null)}
      />
    </div>
  );
}
