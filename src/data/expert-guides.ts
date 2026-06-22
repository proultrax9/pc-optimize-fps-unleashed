export type ExpertGuideStep = {
  text: string;
  verifyKey?: string;
};

export type ExpertGuide = {
  id: string;
  title: string;
  risk: string;
  summary: string;
  steps: ExpertGuideStep[];
  warning?: string;
};

export const EXPERT_GUIDES: ExpertGuide[] = [
  {
    id: "gpu-hags-advisor",
    title: "HAGS Status Check",
    risk: "Safe",
    summary:
      "Hardware Accelerated GPU Scheduling can help or hurt FPS depending on your GPU and driver.",
    steps: [
      {
        text: "Open Settings → System → Display → Graphics → Default graphics settings.",
      },
      {
        text: "Find “Hardware-accelerated GPU scheduling” and note if it is On or Off.",
        verifyKey: "hags_registry_readable",
      },
      {
        text: "NVIDIA RTX 20-series and newer: try ON for lower latency in DX12 games.",
        verifyKey: "hags_gpu_tuned",
      },
      {
        text: "Restart the PC after changing HAGS, then run the same benchmark twice.",
      },
      {
        text: "Keep whichever setting gives better 1% lows — not just average FPS.",
      },
    ],
  },
  {
    id: "cpu-undervolt",
    title: "CPU Undervolt Guide",
    risk: "Medium",
    summary:
      "Undervolting lowers heat and can improve boost clocks. Wrong values cause crashes.",
    warning:
      "Do one step at a time. If games crash or you get BSOD, revert the last change immediately.",
    steps: [
      {
        text: "Download your motherboard vendor tool (Intel XTU, AMD Ryzen Master, or BIOS offset).",
        verifyKey: "undervolt_tool_installed",
      },
      {
        text: "Run a 15-minute stress test at stock settings and note max temperature.",
      },
      {
        text: "Lower CPU core voltage offset by −5 mV (or one small step in BIOS).",
      },
      {
        text: "Re-test the same game or Cinebench — watch for crashes or WHEA errors.",
      },
      {
        text: "Repeat small steps until stable, then stop. Do not chase maximum undervolt.",
      },
      {
        text: "Save a BIOS profile or export settings before closing the tool.",
      },
    ],
  },
  {
    id: "adv-vbs-warn",
    title: "VBS / Core Isolation Check",
    risk: "Safe",
    summary:
      "Virtualization-based security can cost 5–15% FPS on some CPUs. Disabling reduces protection.",
    steps: [
      {
        text: "Open Windows Security → Device security → Core isolation details.",
      },
      {
        text: "Check if Memory integrity is On or Off.",
        verifyKey: "memory_integrity_readable",
      },
      {
        text: "Run your main game with it ON and note average + 1% low FPS.",
      },
      {
        text: "If FPS is significantly lower, consider turning Memory integrity OFF.",
        verifyKey: "memory_integrity_gaming_choice",
      },
      {
        text: "Only disable if you accept reduced security — not recommended on daily drivers.",
      },
      {
        text: "Reboot after any change and re-test the same scene for a fair comparison.",
      },
    ],
  },
  {
    id: "adv-bios-xmp",
    title: "XMP / EXPO Advisor",
    risk: "Medium",
    summary:
      "RAM may run below its rated speed if XMP/EXPO is disabled in BIOS.",
    warning:
      "Enabling XMP/EXPO is usually safe with QVL RAM, but unstable profiles can cause boot loops.",
    steps: [
      {
        text: "Open Task Manager → Performance → Memory and note the current speed (MHz).",
        verifyKey: "ram_speed_readable",
      },
      {
        text: "Compare with the speed printed on your RAM stick label (e.g. 3200, 6000).",
        verifyKey: "ram_speed_matches_label",
      },
      {
        text: "Reboot into BIOS (Del/F2) → find XMP (Intel) or EXPO (AMD) profile.",
      },
      {
        text: "Enable Profile 1 only — do not manually tune timings on the first try.",
        verifyKey: "xmp_profile_enabled",
      },
      {
        text: "Save & exit. If the PC fails to boot, clear CMOS and retry a lower profile.",
      },
      {
        text: "Back in Windows, confirm the new speed in Task Manager and run a quick memtest.",
        verifyKey: "ram_speed_confirmed",
      },
    ],
  },
];

export const EXPERT_GUIDE_MAP = Object.fromEntries(
  EXPERT_GUIDES.map((g) => [g.id, g]),
) as Record<string, ExpertGuide>;

export function toAdvisorScanPayload(guides: ExpertGuide[]) {
  return guides.map((g) => ({
    guideId: g.id,
    verifyKeys: g.steps.map((s) => s.verifyKey ?? null),
  }));
}

export function localizeExpertGuide(
  guide: ExpertGuide,
  t: (key: string, vars?: Record<string, string | number>, fallback?: string) => string,
): ExpertGuide {
  const steps = guide.steps.map((step, i) => ({
    ...step,
    text: t(`guides.${guide.id}.steps.${i}`, undefined, step.text),
  }));
  return {
    ...guide,
    title: t(`guides.${guide.id}.title`, undefined, guide.title),
    summary: t(`guides.${guide.id}.summary`, undefined, guide.summary),
    warning: guide.warning
      ? t(`guides.${guide.id}.warning`, undefined, guide.warning)
      : undefined,
    steps,
  };
}
