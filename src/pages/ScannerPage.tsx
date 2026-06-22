import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ScanSearch } from "lucide-react";
import { api } from "../lib/api";
import type { ScanResult } from "../types/api";
import { PageHeader } from "../components/dashboard/StatCard";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "ok"
      ? "bg-success"
      : status === "warn"
        ? "bg-warning"
        : "bg-accent";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const runScan = async () => {
    setScanning(true);
    try {
      const data = await api.runScanner();
      setResult(data);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="System Scanner"
        subtitle="Analyze Windows, hardware, and optimization potential before applying tweaks."
        action={
          <button
            type="button"
            onClick={() => void runScan()}
            disabled={scanning}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-void disabled:opacity-50"
          >
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4" />
            )}
            {scanning ? "Scanning…" : "Run Scan"}
          </button>
        }
      />

      {result && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "FPS Gain", value: result.fpsGain },
              { label: "Latency Gain", value: result.latencyGain },
              { label: "Stability Risk", value: result.stabilityRisk },
              { label: "Recommended", value: result.recommendedMode },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                <p className="text-[10px] uppercase tracking-widest text-muted">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-text">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] text-text-secondary">
            Performance score:{" "}
            <span className="font-bold text-accent">{result.performanceScore}</span> / 100
            {result.recommendedMode !== "Maintenance" && (
              <>
                {" "}
                — try{" "}
                <Link to="/boost" className="text-accent hover:underline">
                  {result.recommendedMode}
                </Link>
              </>
            )}
          </div>

          <div className="space-y-2">
            {result.findings.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <StatusDot status={f.status} />
                  <span className="text-[10px] uppercase tracking-widest text-muted">
                    {f.category}
                  </span>
                  <span className="text-[13px] font-semibold text-text">{f.title}</span>
                </div>
                <p className="mt-1.5 text-[12px] text-text-secondary">{f.detail}</p>
                <p className="mt-1 text-[12px] text-accent">{f.recommendation}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {!result && !scanning && (
        <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-[13px] text-text-secondary">
          Click <strong className="text-text">Run Scan</strong> to analyze your system.
        </div>
      )}
    </div>
  );
}
