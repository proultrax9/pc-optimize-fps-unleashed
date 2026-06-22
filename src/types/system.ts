export type SystemInfo = {
  username: string;
  performance_score: number;
  cpu_name: string;
  cpu_cores: number;
  cpu_physical_cores: number;
  gpu_name: string;
  gpu_vram_gb: string;
  memory_total_gb: string;
  memory_type: string;
  os_name: string;
  os_version: string;
  storage_name: string;
  storage_total_gb: string;
  tweaks_total: number;
  tweaks_active: number;
  power_plan: string;
  game_mode_enabled: boolean;
  bios_manufacturer: string;
  bios_version: string;
  bios_serial: string;
  bios_release_date: string;
  dram_speed_mhz: string;
  processor_speed_mhz: string;
};

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
};
