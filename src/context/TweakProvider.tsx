import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import { TWEAKS } from "../data/tweaks";

type TweakContextValue = {
  enabled: Set<string>;
  isEnabled: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  loading: boolean;
  busy: string | null;
  activeCount: number;
  totalCount: number;
};

const TweakContext = createContext<TweakContextValue | null>(null);

export function TweakProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const states = await api.getTweakStates();
      setEnabled(new Set(states.filter((s) => s.applied).map((s) => s.id)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isEnabled = useCallback((id: string) => enabled.has(id), [enabled]);

  const toggle = useCallback(
    async (id: string) => {
      const wasEnabled = enabled.has(id);
      setBusy(id);
      setEnabled((prev) => {
        const next = new Set(prev);
        if (wasEnabled) next.delete(id);
        else next.add(id);
        return next;
      });

      try {
        const result = wasEnabled
          ? await api.revertTweak(id)
          : await api.applyTweak(id);
        if (!result.success) {
          setEnabled((prev) => {
            const next = new Set(prev);
            if (wasEnabled) next.add(id);
            else next.delete(id);
            return next;
          });
          window.alert(result.message);
        }
      } catch (e) {
        setEnabled((prev) => {
          const next = new Set(prev);
          if (wasEnabled) next.add(id);
          else next.delete(id);
          return next;
        });
        window.alert(e instanceof Error ? e.message : "Tweak operation failed");
      } finally {
        setBusy(null);
      }
    },
    [enabled],
  );

  const activeCount = enabled.size;
  const totalCount = TWEAKS.filter((t) => !t.advisorOnly).length;

  const value = useMemo(
    () => ({
      enabled,
      isEnabled,
      toggle,
      refresh,
      loading,
      busy,
      activeCount,
      totalCount,
    }),
    [enabled, isEnabled, toggle, refresh, loading, busy, activeCount, totalCount],
  );

  return <TweakContext.Provider value={value}>{children}</TweakContext.Provider>;
}

export function useTweaks() {
  const ctx = useContext(TweakContext);
  if (!ctx) {
    throw new Error("useTweaks must be used within TweakProvider");
  }
  return ctx;
}
