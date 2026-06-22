import { useCallback, useEffect, useState } from "react";
import { Loader2, RotateCcw, Shield } from "lucide-react";
import { api } from "../lib/api";
import type { RestorePoint, RollbackInfo } from "../types/api";
import { TWEAK_MAP } from "../data/tweaks";
import { PageHeader } from "../components/dashboard/StatCard";

export function RestorePage() {
  const [rollback, setRollback] = useState<RollbackInfo | null>(null);
  const [points, setPoints] = useState<RestorePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [rb, rp] = await Promise.all([
        api.getRollbackInfo(),
        api.listRestorePoints(),
      ]);
      setRollback(rb);
      setPoints(rp);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createPoint = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await api.createRestorePoint("FPS Unleashed manual restore point");
      setMessage(result.message);
      if (result.success) await refresh();
    } finally {
      setBusy(false);
    }
  };

  const rollbackAll = async () => {
    if (!window.confirm("Revert all tweaks applied by FPS Unleashed?")) return;
    setBusy(true);
    try {
      const result = await api.rollbackAll();
      setMessage(result.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Rollback Center"
        subtitle="Restore points and revert optimizations applied by this app."
        action={
          <button
            type="button"
            onClick={() => void createPoint()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-1.5 text-[12px] font-medium text-text hover:border-accent/40"
          >
            <Shield className="h-3.5 w-3.5" />
            Create Restore Point
          </button>
        }
      />

      {message && (
        <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] text-text-secondary">
          {message}
        </div>
      )}

      {rollback?.lastBoost && (
        <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-muted">Last boost</p>
          <p className="text-sm font-semibold text-text">{rollback.lastBoost}</p>
          {rollback.lastBoostAt && (
            <p className="text-[11px] text-muted">{rollback.lastBoostAt}</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            Applied tweaks ({rollback?.entries.length ?? 0})
          </p>
          <button
            type="button"
            onClick={() => void rollbackAll()}
            disabled={busy || !rollback?.entries.length}
            className="inline-flex items-center gap-1.5 rounded-md bg-danger/15 px-3 py-1.5 text-[12px] font-medium text-danger disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
            Rollback All
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted">Loading…</div>
        ) : rollback?.entries.length ? (
          <div className="space-y-1.5">
            {rollback.entries.map((e) => (
              <div
                key={e.tweakId}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5"
              >
                <span className="text-[13px] text-text">
                  {TWEAK_MAP[e.tweakId]?.name ?? e.tweakId}
                </span>
                <span className="font-mono text-[10px] text-muted">{e.appliedAt}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-[12px] text-muted">
            No tweaks applied yet.
          </p>
        )}
      </div>

      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
          Windows restore points
        </p>
        {points.length ? (
          <div className="space-y-1.5">
            {points.map((p) => (
              <div
                key={p.sequenceNumber}
                className="rounded-lg border border-border bg-card px-4 py-2.5"
              >
                <p className="text-[13px] font-medium text-text">{p.description}</p>
                <p className="text-[11px] text-muted">#{p.sequenceNumber} · {p.creationTime}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-text-secondary">
            No restore points found. Create one before Competitive or Extreme boost.
            Requires Administrator.
          </p>
        )}
      </div>
    </div>
  );
}
