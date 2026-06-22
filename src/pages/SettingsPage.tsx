import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AppSettings } from "../types/api";
import { isTauri } from "../lib/api";
import { PageHeader } from "../components/dashboard/StatCard";
import { useI18n } from "../i18n/I18nProvider";
import type { Locale } from "../i18n/types";

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const [settings, setSettings] = useState<AppSettings>({
    createRestoreBeforeBoost: true,
    confirmExtremeTweaks: true,
    language: locale,
  });
  const [dataDir, setDataDir] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void api.getSettings().then((s) => {
      setSettings({ ...s, language: s.language ?? locale });
    });
    void api.getDataDir().then(setDataDir);
  }, [locale]);

  const save = async () => {
    const res = await api.saveSettings(settings);
    if (res.success) {
      setLocale(settings.language);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const toggles: { key: keyof Pick<AppSettings, "createRestoreBeforeBoost" | "confirmExtremeTweaks">; label: string; desc: string }[] = [
    {
      key: "createRestoreBeforeBoost",
      label: t("pages.settings.restoreBefore"),
      desc: t("pages.settings.restoreBeforeDesc"),
    },
    {
      key: "confirmExtremeTweaks",
      label: t("pages.settings.confirmRisk"),
      desc: t("pages.settings.confirmRiskDesc"),
    },
  ];

  return (
    <div>
      <PageHeader title={t("pages.settings.title")} subtitle={t("pages.settings.subtitle")} />

      <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-[13px] font-medium text-text">{t("pages.settings.language")}</p>
        <p className="mt-0.5 text-[11px] text-muted">{t("pages.settings.languageDesc")}</p>
        <div className="mt-3 flex gap-2">
          {(["th", "en"] as Locale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSettings((s) => ({ ...s, language: lang }))}
              className={[
                "rounded-md border px-4 py-2 text-[12px] font-semibold transition-colors",
                settings.language === lang
                  ? "border-accent bg-accent text-void"
                  : "border-border bg-elevated text-text-secondary hover:border-accent/40",
              ].join(" ")}
            >
              {lang === "th" ? "ไทย" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 space-y-2">
        {toggles.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="text-[13px] font-medium text-text">{item.label}</p>
              <p className="text-[11px] text-muted">{item.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={settings[item.key]}
              onChange={(e) =>
                setSettings((s) => ({ ...s, [item.key]: e.target.checked }))
              }
              className="h-4 w-4 accent-accent"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void save()}
        className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-void"
      >
        {saved ? t("common.saved") : t("common.save")}
      </button>

      <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-[12px] text-text-secondary">
        <p>
          <span className="text-muted">{t("pages.settings.runtime")}:</span>{" "}
          {isTauri() ? t("pages.settings.desktop") : t("pages.settings.browser")}
        </p>
        <p className="mt-1">
          <span className="text-muted">{t("pages.settings.data")}:</span>{" "}
          <span className="font-mono text-[11px]">{dataDir}</span>
        </p>
        <p className="mt-3 text-[11px] text-muted">{t("pages.settings.footer")}</p>
      </div>
    </div>
  );
}
