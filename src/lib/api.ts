import { invoke } from "@tauri-apps/api/core";

import type { SystemInfo } from "../types/system";

import type {

  AppSettings,

  ApplyBoostResult,

  CleanOptions,

  CleanResult,

  CommandResult,

  GameProfile,

  GuideAdvisorResult,

  AdvisorScanGuide,

  ExpertRiskStatus,

  PingResult,

  RestorePoint,

  RollbackInfo,

  ScanResult,

  TweakState,

} from "../types/api";



function requireTauri(): void {

  if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {

    throw new Error("FPS Unleashed must be run as the desktop app.");

  }

}



async function invokeCmd<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {

  requireTauri();

  return invoke<T>(cmd, args);

}



export const api = {

  getSystemInfo: () => invokeCmd<SystemInfo>("get_system_info"),



  runAdvisorScan: (guides?: AdvisorScanGuide[]) =>

    invokeCmd<GuideAdvisorResult[]>("run_advisor_scan", { guides: guides ?? null }),



  getExpertRiskStatus: () => invokeCmd<ExpertRiskStatus>("get_expert_risk_status"),



  waiveExpertRisk: () => invokeCmd<CommandResult>("waive_expert_risk"),



  clearExpertRiskWaiver: () => invokeCmd<CommandResult>("clear_expert_risk_waiver"),



  getTweakStates: () => invokeCmd<TweakState[]>("get_tweak_states"),



  applyTweak: (id: string) => invokeCmd<CommandResult>("apply_tweak", { id }),



  revertTweak: (id: string) => invokeCmd<CommandResult>("revert_tweak", { id }),



  applyBoost: (preset: string) => invokeCmd<ApplyBoostResult>("apply_boost", { preset }),



  runScanner: () => invokeCmd<ScanResult>("run_scanner"),



  createRestorePoint: (description: string) =>

    invokeCmd<CommandResult>("create_restore_point", { description }),



  listRestorePoints: () => invokeCmd<RestorePoint[]>("list_restore_points"),



  getRollbackInfo: () => invokeCmd<RollbackInfo>("get_rollback_info"),



  rollbackAll: () => invokeCmd<CommandResult>("rollback_all"),



  runCleaner: (options: CleanOptions) => invokeCmd<CleanResult>("run_cleaner", { options }),



  getGameProfiles: () => invokeCmd<GameProfile[]>("get_game_profiles"),



  pingTest: (host: string) => invokeCmd<PingResult>("ping_test", { host }),



  getSettings: () => invokeCmd<AppSettings>("get_settings"),



  saveSettings: (settings: AppSettings) => invokeCmd<CommandResult>("save_settings", { settings }),



  getDataDir: () => invokeCmd<string>("get_data_dir"),

};



export function isTauri(): boolean {

  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

}

