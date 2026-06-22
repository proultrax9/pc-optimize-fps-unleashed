import { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { api } from "../lib/api";
import type { GameProfile } from "../types/api";
import { PageHeader } from "../components/dashboard/StatCard";

export function GamesPage() {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [selected, setSelected] = useState<GameProfile | null>(null);

  useEffect(() => {
    void api.getGameProfiles().then(setProfiles);
  }, []);

  return (
    <div>
      <PageHeader
        title="Game Profiles"
        subtitle="FPS caps, launch options, and competitive presets per title."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          {profiles.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelected(g)}
              className={[
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                selected?.id === g.id
                  ? "border-accent/40 bg-accent-muted"
                  : "border-border bg-card hover:bg-card-hover",
              ].join(" ")}
            >
              <Gamepad2 className="h-4 w-4 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-text">{g.name}</p>
                  <span
                    className={[
                      "rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase",
                      g.installed
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-elevated text-muted",
                    ].join(" ")}
                  >
                    {g.installed ? "Installed" : "Not found"}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted truncate">
                  {g.installPath ?? g.executable}
                </p>
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="rounded-lg border border-border bg-surface p-5">
            <h3 className="text-lg font-bold text-text">{selected.name}</h3>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">FPS Cap</dt>
                <dd className="text-text">
                  {selected.fpsCap > 0 ? `${selected.fpsCap} FPS` : "Uncapped / match monitor"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted">Priority</dt>
                <dd className="capitalize text-text">{selected.priority}</dd>
              </div>
              {selected.launchOptions && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-muted">
                    Launch options
                  </dt>
                  <dd className="font-mono text-[12px] text-accent">{selected.launchOptions}</dd>
                </div>
              )}
            </dl>
            <ul className="mt-4 space-y-1.5">
              {selected.notes.map((n) => (
                <li key={n} className="text-[12px] text-text-secondary">
                  · {n}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] text-warning">
              Auto-apply on game launch coming in a future update. Use Tweaks + Boost for now.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16 text-[12px] text-muted">
            Select a game profile
          </div>
        )}
      </div>
    </div>
  );
}
