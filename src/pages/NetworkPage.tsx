import { useState } from "react";
import { Link } from "react-router-dom";
import { Globe, Loader2, Wifi } from "lucide-react";
import { api } from "../lib/api";
import type { PingResult } from "../types/api";
import { PageHeader } from "../components/dashboard/StatCard";

export function NetworkPage() {
  const [host, setHost] = useState("8.8.8.8");
  const [pinging, setPinging] = useState(false);
  const [result, setResult] = useState<PingResult | null>(null);
  const [flushMsg, setFlushMsg] = useState<string | null>(null);

  const runPing = async () => {
    setPinging(true);
    setResult(null);
    try {
      const res = await api.pingTest(host);
      setResult(res);
    } finally {
      setPinging(false);
    }
  };

  const flushDns = async () => {
    const res = await api.applyTweak("net-dns-flush");
    setFlushMsg(res.message);
  };

  const optimizeAdapter = async () => {
    const res = await api.applyTweak("net-adapter-power");
    setFlushMsg(res.message);
  };

  return (
    <div>
      <PageHeader
        title="Network"
        subtitle="Latency tools — DNS flush, adapter tuning, and ping tests."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => void flushDns()}
          className="rounded-lg border border-border bg-card px-4 py-4 text-left hover:bg-card-hover"
        >
          <Globe className="mb-2 h-4 w-4 text-accent" />
          <p className="text-[13px] font-semibold text-text">Flush DNS</p>
          <p className="text-[11px] text-muted">Clear resolver cache</p>
        </button>
        <button
          type="button"
          onClick={() => void optimizeAdapter()}
          className="rounded-lg border border-border bg-card px-4 py-4 text-left hover:bg-card-hover"
        >
          <Wifi className="mb-2 h-4 w-4 text-accent" />
          <p className="text-[13px] font-semibold text-text">Adapter Power Off</p>
          <p className="text-[11px] text-muted">Disable NIC power saving</p>
        </button>
      </div>

      {flushMsg && (
        <p className="mb-4 text-[12px] text-text-secondary">{flushMsg}</p>
      )}

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
          Ping test
        </p>
        <div className="flex gap-2">
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="flex-1 rounded-md border border-border bg-elevated px-3 py-2 text-[13px] text-text outline-none focus:border-accent/50"
            placeholder="8.8.8.8 or google.com"
          />
          <button
            type="button"
            onClick={() => void runPing()}
            disabled={pinging}
            className="rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-void disabled:opacity-50"
          >
            {pinging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
          </button>
        </div>

        {result && (
          <div className="mt-4 rounded-md border border-border bg-card px-4 py-3 text-[13px]">
            <p className="text-text">
              Host: <span className="font-mono">{result.host}</span>
            </p>
            {result.latencyMs != null && (
              <p className="text-text-secondary">
                Avg latency: <span className="text-accent">{result.latencyMs.toFixed(1)} ms</span>
              </p>
            )}
            {result.packetLoss != null && (
              <p className="text-text-secondary">Packet loss: {result.packetLoss}%</p>
            )}
            <p className="mt-1 text-[11px] text-muted">{result.message}</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] text-muted">
        More network tweaks (Nagle, throttling) are in{" "}
        <Link to="/tweaks" className="text-accent hover:underline">
          Tweaks → Network
        </Link>
        .
      </p>
    </div>
  );
}
