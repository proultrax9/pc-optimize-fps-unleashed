export type RiskLevel = "safe" | "medium" | "high" | "extreme";

export type TweakCategory = "windows" | "gpu" | "cpu" | "network" | "advanced";

export type Tweak = {
  id: string;
  name: string;
  description: string;
  category: TweakCategory;
  risk: RiskLevel;
  requiresAdmin: boolean;
  requiresRestart: boolean;
  requiresRestorePoint: boolean;
  reversible: boolean;
  /** If true, UI shows advisor/checklist only — no auto-apply */
  advisorOnly?: boolean;
};

export type BoostMode = "safe" | "competitive" | "extreme" | "expert";

export type BoostPreset = {
  id: BoostMode;
  name: string;
  tagline: string;
  risk: RiskLevel;
  tweakIds: string[];
  warning: string;
  requiresRestorePoint: boolean;
  advisorOnly?: boolean;
};
