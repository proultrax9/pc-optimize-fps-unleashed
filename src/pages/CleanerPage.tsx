import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import type { CleanOptions } from "../types/api";
import { PageHeader } from "../components/dashboard/StatCard";

const DEFAULT_OPTS: CleanOptions = {
  tempFiles: true,
  shaderCache: true,
  dnsCache: false,
  recycleBin: false,
};

export function CleanerPage() {
  const [opts, setOpts] = useState<CleanOptions>(DEFAULT_OPTS);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const toggle = (key: keyof CleanOptions) => {
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  };

  const run = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await api.runCleaner(opts);
      setResult(
        `${res.message} ${res.items.length ? `(${res.items.join(", ")})` : ""}${
          res.freedMb > 0 ? ` · ~${res.freedMb.toFixed(1)} MB` : ""
        }`,
      );
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Clean failed");
    } finally {
      setBusy(false);
    }
  };

  const options: { key: keyof CleanOptions; label: string; desc: string }[] = [
    { key: "tempFiles", label: "Temporary files", desc: "Windows & user temp folders" },
    { key: "shaderCache", label: "Shader cache", desc: "DirectX / GPU shader cache" },
    { key: "dnsCache", label: "DNS cache", desc: "Flush resolver cache" },
    { key: "recycleBin", label: "Recycle bin", desc: "Empty recycle bin" },
  ];

  return (
    <div>
      <PageHeader
        title="Cleaner"
        subtitle="Remove junk files that can cause stutter or waste disk space."
      />

      <div className="mb-5 space-y-2">
        {options.map((o) => (
          <label
            key={o.key}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-card-hover"
          >
            <div>
              <p className="text-[13px] font-medium text-text">{o.label}</p>
              <p className="text-[11px] text-muted">{o.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={opts[o.key]}
              onChange={() => toggle(o.key)}
              className="h-4 w-4 accent-accent"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void run()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-[13px] font-semibold text-void disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        Run Cleaner
      </button>

      {result && (
        <p className="mt-4 text-[13px] text-text-secondary">{result}</p>
      )}
    </div>
  );
}
