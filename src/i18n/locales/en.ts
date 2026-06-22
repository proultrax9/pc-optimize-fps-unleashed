import type { Messages } from "../types";

export const en: Messages = {
  brand: { subtitle: "Optimizer" },
  nav: {
    performance: "Performance",
    tools: "Tools",
    overview: "Overview",
    scanner: "Scanner",
    tweaks: "Tweaks",
    boost: "Boost",
    cleaner: "Cleaner",
    rollback: "Rollback",
    games: "Games",
    network: "Network",
    settings: "Settings",
  },
  common: {
    admin: "Admin",
    restart: "Restart",
    restorePoint: "Restore point",
    advisor: "Advisor",
    openGuide: "Open Guide",
    active: "active",
    live: "live",
    syncing: "syncing…",
    save: "Save Settings",
    saved: "Saved!",
    more: "more",
    risk: "risk",
  },
  risk: { safe: "Safe", medium: "Medium", high: "High", extreme: "Extreme" },
  categories: {
    windows: "Windows",
    gpu: "GPU",
    cpu: "CPU",
    network: "Network",
    advanced: "Advanced",
  },
  pages: {
    overview: {
      title: "System Overview",
      subtitle: "Logged in as {user} · Windows performance monitor",
      performanceIndex: "Performance Index",
      performanceDesc: "Based on power plan, game mode, and memory capacity.",
      tweaksActive: "{active}/{total} tweaks active",
      score: "score",
    },
    tweaks: {
      title: "Tweaks",
      subtitle: "Toggle individual optimizations. Each tweak shows its risk level.",
      advancedWarn:
        "Advanced zone. GPU clock, fan curves, and security toggles can cause instability. Always create a restore point first.",
      bundleHint: "Want a one-click bundle?",
      bundleLink: "Go to Boost presets →",
    },
    boost: {
      title: "Boost",
      subtitle:
        "One-click preset bundles. Changes apply to your real system when running as desktop app.",
      openTweaks: "Open Tweaks",
    },
    settings: {
      title: "Settings",
      subtitle: "Safety policies, language, and app configuration.",
      language: "Language",
      languageDesc: "Switch the entire interface between English and Thai.",
      restoreBefore: "Restore point before boost",
      restoreBeforeDesc:
        "Prompt to create a Windows restore point before Competitive/Extreme boost.",
      confirmRisk: "Confirm high-risk tweaks",
      confirmRiskDesc: "Show extra confirmation for Extreme boost and dangerous tweaks.",
      runtime: "Runtime",
      data: "Data",
      footer: "FPS Unleashed v0.1.0 · Run as Administrator for registry, services, and restore points.",
      desktop: "Desktop (Tauri)",
      browser: "Browser preview — run `pnpm tauri dev` for full features",
    },
    scanner: { title: "Scanner", subtitle: "Scan your system for optimization opportunities." },
    cleaner: { title: "Cleaner", subtitle: "Free disk space and clear caches." },
    rollback: { title: "Rollback", subtitle: "Revert applied tweaks and restore points." },
    games: { title: "Games", subtitle: "Installed games and launch profiles." },
    network: { title: "Network", subtitle: "Latency tools — DNS flush, adapter tuning, and ping tests." },
  },
  tweaks: {
    "win-game-mode": {
      name: "Enable Game Mode",
      desc: "Prioritizes game processes and reduces background interruptions.",
    },
    "win-power-high": {
      name: "High Performance Power Plan",
      desc: "Switches to High Performance so CPU and GPU stay responsive.",
    },
    "win-visual-fx": {
      name: "Disable Visual Effects",
      desc: "Turns off animations and transparency to free CPU/GPU cycles.",
    },
    "win-game-dvr": {
      name: "Disable Xbox Game Bar DVR",
      desc: "Stops background recording overhead that can hurt FPS and add latency.",
    },
    "win-telemetry": {
      name: "Disable Telemetry Services",
      desc: "Reduces background data collection services during gaming sessions.",
    },
    "win-fullscreen-opt": {
      name: "Disable Fullscreen Optimizations",
      desc: "Can lower input lag in some titles; may cause tearing in others.",
    },
    "win-bg-apps": {
      name: "Limit Background Apps",
      desc: "Prevents non-essential UWP apps from running in the background.",
    },
    "win-disable-power-saving": {
      name: "Disable All Power Saving",
      desc: "Max performance: CPU 100%, USB suspend off, PCIe ASPM off, disk never sleep, NIC power save off.",
    },
    "win-priority-26": {
      name: "Win32 Priority Separation (0x26)",
      desc: "Gaming CPU scheduler profile — competitive WinPriority preset (0x26).",
    },
    "win-mmcss-latency": {
      name: "MMCSS Gaming Profile",
      desc: "System Responsiveness 0, Games task high priority, Lazy Mode timeout maxed.",
    },
    "win-system-ini-fps": {
      name: "system.ini Latency Profile",
      desc: "Applies [386Enh] time-slice tweaks. Backs up system.ini first.",
    },
    "gpu-shader-cache": {
      name: "Clear DirectX Shader Cache",
      desc: "Removes stale shader cache that can cause stutter after driver updates.",
    },
    "gpu-max-perf": {
      name: "Prefer Maximum Performance",
      desc: "Sets NVIDIA/AMD power management to maximum performance per application.",
    },
    "gpu-low-latency": {
      name: "Low Latency Mode",
      desc: "Enables driver low-latency path where supported. Game-dependent results.",
    },
    "gpu-hags-advisor": {
      name: "HAGS Status Check",
      desc: "Scans Hardware Accelerated GPU Scheduling and recommends per your GPU.",
    },
    "gpu-power-limit": {
      name: "GPU Power Limit",
      desc: "Adjusts power limit via vendor SDK. Requires thermal headroom.",
    },
    "gpu-clock-offset": {
      name: "GPU Clock Offset",
      desc: "Core/memory offset tuning. Wrong values can crash games or BSOD.",
    },
    "cpu-game-priority": {
      name: "Game Process High Priority",
      desc: "Raises active game process priority while session is running.",
    },
    "cpu-core-parking": {
      name: "Disable CPU Core Parking",
      desc: "Keeps all cores awake for lower latency; increases idle power draw.",
    },
    "cpu-timer-res": {
      name: "Timer Resolution (Gaming)",
      desc: "Requests 0.5ms timer while gaming. Reverts when game exits.",
    },
    "cpu-undervolt": {
      name: "CPU Undervolt Guide",
      desc: "Step-by-step advisor only. No automatic voltage changes.",
    },
    "cpu-power-limit": {
      name: "CPU Power Limit (PL1/PL2)",
      desc: "Wraps vendor tooling for power limits. Requires stability testing.",
    },
    "net-dns-flush": { name: "Flush DNS Cache", desc: "Clears resolver cache to fix stale DNS entries." },
    "net-adapter-power": {
      name: "Disable Adapter Power Saving",
      desc: "Prevents NIC from sleeping; can reduce ping spikes on Wi-Fi/Ethernet.",
    },
    "net-nagle": {
      name: "Disable Nagle's Algorithm",
      desc: "May reduce latency in some online games. Test before keeping enabled.",
    },
    "net-throttling": {
      name: "Network Throttling Index",
      desc: "Tunes Windows multimedia network throttling for lower latency.",
    },
    "adv-fan-curve": {
      name: "Fan Curve Tuning",
      desc: "Manual fan curve via vendor tools. Poor curves = overheating or noise.",
    },
    "adv-ram-standby": {
      name: "Standby Memory Cleaner",
      desc: "Flushes standby list on demand while gaming. Use only if RAM is tight.",
    },
    "adv-vbs-warn": {
      name: "VBS / Core Isolation Check",
      desc: "Detects virtualization security features and explains FPS trade-offs.",
    },
    "adv-vbs-disable": {
      name: "Disable Memory Integrity",
      desc: "Can improve FPS on some CPUs. Reduces security — not recommended for daily use.",
    },
    "adv-bios-xmp": {
      name: "XMP / EXPO Advisor",
      desc: "Checks if RAM runs below rated speed. Guides BIOS enable — no auto flash.",
    },
  },
  boost: {
    safe: {
      name: "Safe Boost",
      tagline: "Low risk · Recommended for everyone",
      warning: "Safe for most systems. Some background apps may pause temporarily while gaming.",
    },
    competitive: {
      name: "Competitive Boost",
      tagline: "FPS + latency · For serious gamers",
      warning:
        "Adjusts services, registry, and power settings. Xbox Game Bar recording may stop working. Create a restore point first.",
    },
    extreme: {
      name: "Extreme Boost",
      tagline: "Maximum gains · Higher instability risk",
      warning:
        "May cause BSOD, game crashes, or network issues on some systems. Only use with good cooling and a restore point.",
    },
    expert: {
      name: "Expert Guide",
      tagline: "BIOS / OC advisor · No auto-apply",
      warning:
        "Advisor mode only. BIOS, undervolt, and OC changes can brick your system if done wrong.",
    },
  },
  guides: {
    "gpu-hags-advisor": {
      title: "HAGS Status Check",
      summary:
        "Hardware Accelerated GPU Scheduling can help or hurt FPS depending on your GPU and driver.",
      steps: [
        "Open Settings → System → Display → Graphics → Default graphics settings.",
        "Find “Hardware-accelerated GPU scheduling” and note if it is On or Off.",
        "NVIDIA RTX 20-series and newer: try ON for lower latency in DX12 games.",
        "Restart the PC after changing HAGS, then run the same benchmark twice.",
        "Keep whichever setting gives better 1% lows — not just average FPS.",
      ],
    },
    "cpu-undervolt": {
      title: "CPU Undervolt Guide",
      summary: "Undervolting lowers heat and can improve boost clocks. Wrong values cause crashes.",
      warning:
        "Do one step at a time. If games crash or you get BSOD, revert the last change immediately.",
      steps: [
        "Download your motherboard vendor tool (Intel XTU, AMD Ryzen Master, or BIOS offset).",
        "Run a 15-minute stress test at stock settings and note max temperature.",
        "Lower CPU core voltage offset by −5 mV (or one small step in BIOS).",
        "Re-test the same game or Cinebench — watch for crashes or WHEA errors.",
        "Repeat small steps until stable, then stop. Do not chase maximum undervolt.",
        "Save a BIOS profile or export settings before closing the tool.",
      ],
    },
    "adv-vbs-warn": {
      title: "VBS / Core Isolation Check",
      summary:
        "Virtualization-based security can cost 5–15% FPS on some CPUs. Disabling reduces protection.",
      steps: [
        "Open Windows Security → Device security → Core isolation details.",
        "Check if Memory integrity is On or Off.",
        "Run your main game with it ON and note average + 1% low FPS.",
        "If FPS is significantly lower, consider turning Memory integrity OFF.",
        "Only disable if you accept reduced security — not recommended on daily drivers.",
        "Reboot after any change and re-test the same scene for a fair comparison.",
      ],
    },
    "adv-bios-xmp": {
      title: "XMP / EXPO Advisor",
      summary: "RAM may run below its rated speed if XMP/EXPO is disabled in BIOS.",
      warning:
        "Enabling XMP/EXPO is usually safe with QVL RAM, but unstable profiles can cause boot loops.",
      steps: [
        "Open Task Manager → Performance → Memory and note the current speed (MHz).",
        "Compare with the speed printed on your RAM stick label (e.g. 3200, 6000).",
        "Reboot into BIOS (Del/F2) → find XMP (Intel) or EXPO (AMD) profile.",
        "Enable Profile 1 only — do not manually tune timings on the first try.",
        "Save & exit. If the PC fails to boot, clear CMOS and retry a lower profile.",
        "Back in Windows, confirm the new speed in Task Manager and run a quick memtest.",
      ],
    },
  },
  guideUi: {
    mode: "Advisor mode",
    title: "Expert Guide Checklist",
    subtitle: "Scans your real system first — verifiable steps auto-check when passed.",
    liveScan: "Live system scan",
    scanning: "Scanning your system…",
    manualSteps: "Manual steps",
    stepsCompleted: "{done}/{total} steps completed",
    autoVerified: "auto-verified",
    pendingCount: "{count} verified step(s) still pending",
    riskWaivedBanner:
      "Risk accepted — skipped incomplete checks. You are responsible for BIOS/undervolt changes.",
    warnBanner:
      "Verifiable steps are checked via WMI/Registry. Manual steps (stress test, reboot, BIOS) must be checked yourself.",
    waiveBtn: "Accept all risks — skip guide",
    waiveBtnDone: "Risk already accepted",
    saving: "Saving…",
    waiveConfirm:
      "Accept all risks?\n\nYou will skip unverified steps — BIOS, undervolt, and security changes can destabilize or damage your system.\n\nThis will be recorded on your PC.",
    doneClear: "Done — close guide",
    donePartial: "Close guide",
    closeConfirm:
      "Some steps are still unverified.\n\nClose anyway? Complete remaining steps or use Accept all risks first.",
    statusVerified: "Verified",
    statusPending: "Pending",
    statusFailed: "Failed",
    statusManual: "Manual",
    waitingScan: "Waiting for scan…",
    progress: "{verified}/{total} verified · {done}/{steps} steps",
    scanningProgress: "scanning…",
    includes: "Includes {count} tweaks",
    viewChecklist: "View Checklist",
    applyBoost: "Apply Boost",
    applying: "Applying…",
    restoreRecommended: "Restore point recommended before applying",
  },
  verify: {
    hags_registry_readable: {
      verified: "HAGS registry readable — currently enabled",
      pending: "Cannot read HAGS — check Graphics settings manually",
    },
    hags_gpu_tuned: {
      verified: "GPU + HAGS setting matches recommendation",
      pending: "HAGS may need adjustment for your GPU — compare FPS",
    },
    undervolt_tool_installed: {
      verified: "Undervolt tool detected",
      pending: "Install Intel XTU, Ryzen Master, or use BIOS offset",
    },
    memory_integrity_readable: {
      verified: "Memory Integrity status readable",
      pending: "Open Windows Security → Core isolation",
    },
    memory_integrity_gaming_choice: {
      verified: "Memory Integrity off — max gaming performance",
      pending: "Memory Integrity still on — disable for max FPS (less secure)",
      failed: "Memory Integrity still on",
    },
    ram_speed_readable: {
      verified: "RAM speed detected from system",
      pending: "Cannot read RAM speed — check Task Manager",
    },
    ram_speed_matches_label: {
      verified: "Running speed matches or exceeds rated SPD",
      pending: "Compare running MHz with RAM label",
      failed: "RAM below rated speed — enable XMP/EXPO in BIOS",
    },
    xmp_profile_enabled: {
      verified: "XMP/EXPO appears enabled",
      pending: "Enable XMP Profile 1 in BIOS",
      failed: "XMP/EXPO likely disabled",
    },
    ram_speed_confirmed: {
      verified: "RAM speed confirmed in Windows",
      pending: "Confirm speed in Task Manager after BIOS",
      failed: "Speed still below rated — retry XMP/EXPO",
    },
  },
};
