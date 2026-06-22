export type CommandResult = {
  success: boolean;
  message: string;
};

export type TweakState = {
  id: string;
  applied: boolean;
  appliedAt?: string;
};

export type ApplyBoostResult = {
  applied: string[];
  failed: { id: string; error: string }[];
  message: string;
};

export type ScanFinding = {
  id: string;
  category: string;
  title: string;
  status: "ok" | "warn" | "info" | string;
  detail: string;
  recommendation: string;
};

export type ScanResult = {
  findings: ScanFinding[];
  fpsGain: string;
  latencyGain: string;
  stabilityRisk: string;
  recommendedMode: string;
  performanceScore: number;
};

export type RestorePoint = {
  sequenceNumber: number;
  description: string;
  creationTime: string;
};

export type RollbackEntry = {
  tweakId: string;
  appliedAt: string;
};

export type RollbackInfo = {
  entries: RollbackEntry[];
  lastBoost?: string;
  lastBoostAt?: string;
};

export type CleanOptions = {
  tempFiles: boolean;
  shaderCache: boolean;
  dnsCache: boolean;
  recycleBin: boolean;
};

export type CleanResult = {
  freedMb: number;
  items: string[];
  message: string;
};

export type PingResult = {
  host: string;
  latencyMs?: number;
  packetLoss?: number;
  message: string;
};

export type GameProfile = {
  id: string;
  name: string;
  executable: string;
  fpsCap: number;
  priority: string;
  launchOptions: string;
  notes: string[];
  installed: boolean;
  installPath?: string | null;
};

export type AppSettings = {
  createRestoreBeforeBoost: boolean;
  confirmExtremeTweaks: boolean;
  language: "en" | "th";
};

export type AdvisorFinding = {
  label: string;
  value: string;
  status: "pass" | "warn" | "info" | string;
  recommendation: string;
};

export type GuideAdvisorResult = {
  guideId: string;
  findings: AdvisorFinding[];
  steps: StepVerification[];
};

export type StepVerification = {
  stepIndex: number;
  verifyKey: string;
  status: "verified" | "pending" | "failed" | "manual" | string;
  detail: string;
};

export type AdvisorScanGuide = {
  guideId: string;
  verifyKeys: (string | null)[];
};

export type ExpertRiskStatus = {
  waived: boolean;
  waivedAt?: string | null;
};
