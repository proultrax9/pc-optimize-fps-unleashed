import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, isTauri } from "../lib/api";
import type { Locale } from "./types";
import { en } from "./locales/en";
import { th } from "./locales/th";

const STORAGE_KEY = "fps-unleashed-locale";

const catalogs = { en, th };

function getNested(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(part);
      cur = Number.isNaN(idx) ? undefined : cur[idx];
    } else if (typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : `{${key}}`,
  );
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "th" ? "th" : "en";
  });

  useEffect(() => {
    if (!isTauri()) return;
    void api.getSettings().then((s) => {
      if (s.language === "th" || s.language === "en") {
        setLocaleState(s.language);
        localStorage.setItem(STORAGE_KEY, s.language);
      }
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (isTauri()) {
      void api.getSettings().then((current) => {
        void api.saveSettings({ ...current, language: next });
      });
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>, fallback?: string) => {
      const msg = getNested(catalogs[locale], key) ?? getNested(catalogs.en, key) ?? fallback ?? key;
      return interpolate(msg, vars);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useTweakText(id: string, fallbackName: string, fallbackDesc: string) {
  const { t } = useI18n();
  return {
    name: t(`tweaks.${id}.name`, undefined, fallbackName),
    description: t(`tweaks.${id}.desc`, undefined, fallbackDesc),
  };
}
