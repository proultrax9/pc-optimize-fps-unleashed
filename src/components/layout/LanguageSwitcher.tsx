import { Languages } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import type { Locale } from "../../i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  const btn = (lang: Locale, label: string) => (
    <button
      key={lang}
      type="button"
      onClick={() => setLocale(lang)}
      className={[
        "flex-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors",
        locale === lang
          ? "bg-accent text-void shadow-sm"
          : "text-text-secondary hover:bg-elevated hover:text-text",
      ].join(" ")}
      aria-pressed={locale === lang}
    >
      {label}
    </button>
  );

  return (
    <div className="mb-2 px-1">
      <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
        <Languages className="h-3 w-3" />
        <span>{locale === "th" ? "ภาษา" : "Language"}</span>
      </div>
      <div className="flex gap-1 rounded-md border border-border bg-card p-0.5">
        {btn("th", "ไทย")}
        {btn("en", "EN")}
      </div>
    </div>
  );
}
