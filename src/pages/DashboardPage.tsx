import {
  Cpu,
  Gpu,
  HardDrive,
  Monitor,
  SlidersHorizontal,
  MemoryStick,
} from "lucide-react";
import { OptimizeBanner } from "../components/dashboard/OptimizeBanner";
import { HardwareDetailsPanel } from "../components/dashboard/HardwareDetailsPanel";
import { PageHeader, StatCard } from "../components/dashboard/StatCard";
import { useTweaks } from "../context/TweakProvider";
import { useSystemInfo } from "../hooks/useSystemInfo";

import { useI18n } from "../i18n/I18nProvider";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" stroke="#1c1c26" strokeWidth="6" />
        <circle
          cx="48"
          cy="48"
          r="36"
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold leading-none text-text">{score}</p>
        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { info, loading } = useSystemInfo();
  const { activeCount, totalCount } = useTweaks();
  const { t } = useI18n();

  return (
    <div>
      <PageHeader
        title={t("pages.overview.title")}
        subtitle={t("pages.overview.subtitle", { user: info.username })}
        action={
          <span className="rounded-md border border-border bg-elevated px-2.5 py-1 font-mono text-[11px] text-text-secondary">
            {loading ? t("common.syncing") : t("common.live")}
          </span>
        }
      />

      <div className="mb-5 flex items-center gap-6 rounded-lg border border-border bg-surface p-5">
        {!loading && <ScoreRing score={info.performance_score} label={t("pages.overview.score")} />}
        {loading && (
          <div className="h-24 w-24 animate-pulse rounded-full bg-elevated" />
        )}
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {t("pages.overview.performanceIndex")}
          </p>
          <p className="mt-1 text-sm text-text-secondary">{t("pages.overview.performanceDesc")}</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted">Power</p>
              <p className="mt-0.5 text-[13px] font-medium text-text">{info.power_plan}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted">Game Mode</p>
              <p className="mt-0.5 text-[13px] font-medium text-text">
                {info.game_mode_enabled ? (
                  <span className="text-success">Enabled</span>
                ) : (
                  <span className="text-warning">Disabled</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted">Tweaks</p>
              <p className="mt-0.5 font-mono text-[13px] font-medium text-text">
                {activeCount}/{totalCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware grid */}
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Hardware
      </p>
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Cpu}
          label="Processor"
          value={info.cpu_name}
          subValue={
            info.cpu_physical_cores > 0 && info.cpu_cores > info.cpu_physical_cores
              ? `${info.cpu_physical_cores}P / ${info.cpu_cores}T`
              : `${info.cpu_cores} threads`
          }
          loading={loading}
        />
        <StatCard
          icon={Gpu}
          label="Graphics"
          value={info.gpu_name}
          subValue={info.gpu_vram_gb !== "—" ? info.gpu_vram_gb : undefined}
          loading={loading}
        />
        <StatCard
          icon={MemoryStick}
          label="Memory"
          value={`${info.memory_total_gb} GB`}
          subValue={info.memory_type}
          loading={loading}
        />
        <StatCard
          icon={Monitor}
          label="Operating System"
          value={info.os_name}
          subValue={info.os_version}
          loading={loading}
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={info.storage_name}
          subValue={`${info.storage_total_gb} GB total`}
          loading={loading}
        />
        <StatCard
          icon={SlidersHorizontal}
          label="Optimization"
          value={`${totalCount} rules`}
          subValue={`${activeCount} applied`}
          loading={loading}
        />
      </div>

      <div className="mb-5">
        <HardwareDetailsPanel
          loading={loading}
          fields={[
            { label: "BIOS Manufacturer", value: info.bios_manufacturer },
            { label: "BIOS Version", value: info.bios_version },
            { label: "BIOS Serial Number", value: info.bios_serial },
            { label: "BIOS Release Date", value: info.bios_release_date },
            {
              label: "DRAM Speed (MHz)",
              value: info.dram_speed_mhz !== "—" ? info.dram_speed_mhz : "—",
            },
            {
              label: "Processor Speed (MHz)",
              value: info.processor_speed_mhz !== "—" ? info.processor_speed_mhz : "—",
            },
          ]}
        />
      </div>

      <OptimizeBanner />
    </div>
  );
}
