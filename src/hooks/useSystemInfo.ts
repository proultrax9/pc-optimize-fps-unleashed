import { useCallback, useEffect, useState } from "react";
import { fetchSystemInfo } from "../lib/tauri";
import type { SystemInfo } from "../types/system";

const FALLBACK: SystemInfo = {
  username: "User",
  performance_score: 0,
  cpu_name: "Loading...",
  cpu_cores: 0,
  cpu_physical_cores: 0,
  gpu_name: "…",
  gpu_vram_gb: "—",
  memory_total_gb: "—",
  memory_type: "RAM",
  os_name: "Windows",
  os_version: "—",
  storage_name: "Loading...",
  storage_total_gb: "—",
  tweaks_total: 42,
  tweaks_active: 0,
  power_plan: "Unknown",
  game_mode_enabled: false,
  bios_manufacturer: "—",
  bios_version: "—",
  bios_serial: "—",
  bios_release_date: "—",
  dram_speed_mhz: "—",
  processor_speed_mhz: "—",
};

export function useSystemInfo() {
  const [info, setInfo] = useState<SystemInfo>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchSystemInfo();
      setInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system info");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { info, loading, error, refresh };
};
