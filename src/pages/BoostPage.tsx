import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTweaks } from "../context/TweakProvider";
import { api } from "../lib/api";
import type { BoostPreset } from "../types/tweak";
import { BOOST_PRESETS } from "../data/boost-presets";
import { EXPERT_GUIDES, localizeExpertGuide } from "../data/expert-guides";
import { BoostCard } from "../components/boost/BoostCard";
import { ExpertChecklistModal } from "../components/boost/ExpertChecklistModal";
import { PageHeader } from "../components/dashboard/StatCard";
import { useI18n } from "../i18n/I18nProvider";

export function BoostPage() {
  const { t } = useI18n();
  const { refresh: refreshTweaks } = useTweaks();
  const [applying, setApplying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);

  const localizedGuides = useMemo(
    () => EXPERT_GUIDES.map((g) => localizeExpertGuide(g, t)),
    [t],
  );

  const handleViewChecklist = async (preset: BoostPreset) => {
    setError(null);
    setMessage(null);

    const settings = await api.getSettings();
    if (settings.confirmExtremeTweaks) {
      const ok = window.confirm(
        `Warning: ${t(`boost.${preset.id}.name`, undefined, preset.name)}\n\n${t(`boost.${preset.id}.warning`, undefined, preset.warning)}\n\nOpen checklist?`,
      );
      if (!ok) return;
    }

    setChecklistOpen(true);
  };

  const handleApply = async (preset: BoostPreset) => {
    setError(null);
    setMessage(null);

    if (!preset.advisorOnly && preset.requiresRestorePoint) {
      const settings = await api.getSettings();
      if (settings.createRestoreBeforeBoost) {
        const create = window.confirm(
          `${t(`boost.${preset.id}.name`, undefined, preset.name)}\n\nCreate restore point first?`,
        );
        if (create) {
          const rp = await api.createRestorePoint(`FPS Unleashed — ${preset.name}`);
          if (!rp.success) {
            const cont = window.confirm(
              `Restore point failed: ${rp.message}\n\nContinue without restore point?`,
            );
            if (!cont) return;
          }
        }
      }
    }

    if (preset.risk === "high" || preset.risk === "extreme") {
      const settings = await api.getSettings();
      if (settings.confirmExtremeTweaks) {
        const ok = window.confirm(
          `Warning: ${t(`boost.${preset.id}.name`, undefined, preset.name)}\n\n${t(`boost.${preset.id}.warning`, undefined, preset.warning)}\n\nContinue?`,
        );
        if (!ok) return;
      }
    }

    setApplying(preset.id);
    try {
      const result = await api.applyBoost(preset.id);
      setMessage(result.message);
      await refreshTweaks();
      if (result.failed.length > 0) {
        setError(result.failed.map((f) => `${f.id}: ${f.error}`).join("\n"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Boost failed");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("pages.boost.title")}
        subtitle={t("pages.boost.subtitle")}
        action={
          <Link
            to="/tweaks"
            className="rounded-md border border-border bg-elevated px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            {t("pages.boost.openTweaks")}
          </Link>
        }
      />

      {message && (
        <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-[13px] text-success">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 whitespace-pre-wrap rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-[12px] text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {BOOST_PRESETS.map((preset) => (
          <BoostCard
            key={preset.id}
            preset={preset}
            onApply={preset.advisorOnly ? handleViewChecklist : handleApply}
            applying={applying === preset.id}
          />
        ))}
      </div>

      <ExpertChecklistModal
        open={checklistOpen}
        guides={localizedGuides}
        onClose={() => setChecklistOpen(false)}
      />
    </div>
  );
}
