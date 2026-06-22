**English** · [ไทย](README_TH.md)

# FPS Unleashed

**Windows desktop PC optimizer for gaming performance** — built with **Tauri 2**, **React 19**, and **Rust**.

| | |
|---|---|
| **Version** | 0.1.0 |
| **Platform** | Windows 10 / 11 (x64) |
| **Languages** | English · [ไทย](README_TH.md) |

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Modules & Features](#modules--features)
5. [Tweaks Catalog (31 rules)](#tweaks-catalog-31-rules)
6. [Boost Presets](#boost-presets)
7. [Expert Guide System](#expert-guide-system)
8. [Safety, Rollback & Data](#safety-rollback--data)
9. [Development](#development)
10. [Build & Release](#build--release)

---

## What It Does

FPS Unleashed is a native Windows app that reads your **real hardware** (CPU, GPU, RAM, BIOS, power plan) and helps you tune the system for gaming — safely and reversibly.

### Key benefits

| Benefit | How FPS Unleashed helps |
|---------|-------------------------|
| **Higher FPS** | Power plans, Game Mode, GPU max performance, shader cache cleanup, background service reduction |
| **Smoother frames** | Removes stutter sources (telemetry, DVR, visual FX, standby RAM pressure) |
| **Lower input lag** | MMCSS profile, timer resolution, priority separation (0x26), fullscreen optimizations, low-latency GPU path |
| **Better ping stability** | DNS flush, NIC power saving off, Nagle / throttling tweaks, built-in ping test |
| **Know before you tweak** | System Scanner scores your PC and recommends the right Boost preset |
| **Stay in control** | Every tweak shows risk level; most can be reverted; Rollback All + Windows restore points |
| **Expert-friendly** | Step-by-step BIOS / HAGS / undervolt guides with live verification — no blind auto-changes |
| **Bilingual UI** | Full English and Thai on core pages (Tweaks, Boost, Settings, Expert Guide) |

Everything runs **locally** on your PC via Rust — no cloud, no account, no browser tab pretending to optimize your registry.

---

## Quick Start

### For end users

1. Open the `release/` folder.
2. **Portable:** double-click `FPS Unleashed.exe`
3. **Install:** run `FPS Unleashed Setup.exe` or `FPS Unleashed.msi`
4. Or use `Run FPS Unleashed.bat` at the project root (points to `release\FPS Unleashed.exe`).

> **Recommended:** right-click → **Run as administrator** so registry tweaks, services, restore points, and power settings can apply fully.

### Release folder (always current)

After each build, `release/` should contain **only these three files**:

| File | Purpose |
|------|---------|
| `FPS Unleashed.exe` | Portable app — no install required |
| `FPS Unleashed Setup.exe` | NSIS installer |
| `FPS Unleashed.msi` | Windows Installer package |

---

## Project Structure

```
FPS Unleashed/
├── src/                    # React + TypeScript UI
│   ├── pages/              # One page per sidebar module
│   ├── components/         # Layout, dashboard, tweaks, boost
│   ├── data/               # Tweaks, boost presets, expert guides
│   ├── i18n/               # English + Thai strings
│   └── context/            # TweakProvider (global tweak state)
├── src-tauri/              # Rust backend (Tauri commands)
│   └── src/
│       ├── tweaks/         # Apply / revert engine
│       ├── hardware*.rs    # WMI + GPU VRAM probe
│       ├── scanner.rs      # System scan logic
│       ├── restore.rs      # Restore points + rollback
│       ├── cleaner.rs      # Disk cleanup
│       ├── games.rs        # Game profile detection
│       ├── network.rs      # Ping test
│       ├── advisor.rs      # Expert guide step verification
│       └── store.rs        # Persisted state (JSON)
├── release/                # Shippable binaries (see above)
├── assets/                 # Logos and media
├── docs/                   # Extra documentation
├── build-exe.bat           # Build + copy all 3 release artifacts
└── Run FPS Unleashed.bat   # Launch portable exe
```

**Persisted state location:** `%LOCALAPPDATA%\fps-unleashed\state.json`

---

## Modules & Features

The sidebar is split into **Performance** and **Tools**.

### Overview (Dashboard)

**Route:** `/`

Live system dashboard powered by real hardware probes (WMI + `nvidia-smi` / registry for accurate GPU VRAM).

| UI block | What it shows |
|----------|---------------|
| **Performance Index** | Score 0–100 from power plan, Game Mode, applied tweaks, RAM, and GPU tier |
| **Power / Game Mode / Tweaks** | Active power plan, Game Mode on/off, `applied/total` tweak count |
| **Hardware grid** | CPU, GPU (+ VRAM), RAM, OS, storage, optimization summary |
| **System Details** | BIOS manufacturer/version/serial/date, DRAM speed (MHz), processor speed (MHz) |
| **Ready to boost?** | Shortcut banner → Boost page |

---

### Scanner

**Route:** `/scanner`

Analyzes the live system **before** you apply tweaks.

**Outputs:**
- **FPS Gain** — estimated headroom (Low / Medium / High)
- **Latency Gain** — network & scheduler latency potential
- **Stability Risk** — risk if aggressive tweaks are applied
- **Recommended Mode** — suggests Safe / Competitive / Extreme / Maintenance
- **Performance score** — 0–100 with link to suggested Boost preset
- **Findings list** — per-item status (`ok` / `warn`), category, recommendation

**Checks include:** Game Mode, power plan, RAM size & speed, GPU VRAM, telemetry services, Xbox DVR, fullscreen optimizations, HAGS, VBS, DRAM XMP headroom, applied tweak count, and more.

---

### Tweaks

**Route:** `/tweaks`

Manual control of **31 optimization rules** across 5 tabs:

| Tab | Count | Focus |
|-----|-------|-------|
| Windows | 11 | OS, power, MMCSS, system.ini latency |
| GPU | 6 | Shader cache, max perf, low latency, HAGS advisor |
| CPU | 5 | Priority, core parking, timer resolution, undervolt guide |
| Network | 4 | DNS, NIC power, Nagle, throttling index |
| Advanced | 5 | Fan curve, standby RAM, VBS, memory integrity, XMP advisor |

Each row shows:
- Risk badge (Safe → Extreme)
- Admin / Restart / Restore-point requirements
- Toggle to apply or revert
- **Open Guide** for advisor-only tweaks (no auto-apply)

---

### Boost

**Route:** `/boost`

One-click bundles that apply multiple tweaks in sequence.

| Preset | Risk | Tweaks | Best for |
|--------|------|--------|----------|
| **Safe Boost** | Safe | 7 | Everyone — low risk daily gaming |
| **Competitive Boost** | Medium | 18 | Ranked / esports — FPS + latency |
| **Extreme Boost** | High | 22 | Max gains — needs cooling + restore point |
| **Expert Guide** | Extreme | 4 advisors | BIOS / OC — **no auto-apply** |

Flow:
1. Optional restore point (if enabled in Settings)
2. Risk confirmation for Competitive / Extreme
3. Batch apply with per-tweak success/failure report
4. Expert opens **checklist modal** with live step verification

---

### Cleaner

**Route:** `/cleaner`

Disk hygiene — select targets then run:

| Option | Action |
|--------|--------|
| Temporary files | Windows + user `%TEMP%` folders |
| Shader cache | DirectX / GPU shader cache (can fix stutter after driver updates) |
| DNS cache | Flush resolver (`ipconfig /flushdns`) |
| Recycle bin | Empty recycle bin |

Reports freed space (MB) and cleaned item list.

---

### Rollback

**Route:** `/restore`

Safety center:

- **Create Restore Point** — Windows System Restore snapshot
- **Last boost** — timestamp of last Boost preset applied
- **Applied tweaks list** — every tweak FPS Unleashed changed, with revert status
- **Rollback All** — reverts every applied tweak in one action

---

### Games

**Route:** `/games`

Detects installed titles and shows competitive presets:

| Game | Detection | Profile includes |
|------|-----------|------------------|
| Apex Legends | Steam / EA install paths | FPS cap, priority, launch notes |
| Valorant | Riot Client paths | Competitive settings notes |
| Counter-Strike 2 | Steam library | Launch options, priority |
| Fortnite | Epic Games folder | Performance notes |

Shows **Installed / Not found** badge. Auto-apply on game launch is planned — use Tweaks + Boost for now.

---

### Network

**Route:** `/network`

Latency toolkit:

- **Flush DNS** — clears resolver cache
- **Adapter Power Off** — disables NIC power saving
- **Ping test** — test any host (default `8.8.8.8`), shows avg latency ms and packet loss %

Link to Tweaks page for Nagle / throttling index.

---

### Settings

**Route:** `/settings`

| Setting | Default | Effect |
|---------|---------|--------|
| **Language** | English | UI locale (EN / ไทย) — also switchable in sidebar |
| **Create restore point before Boost** | On | Prompts before Competitive / Extreme |
| **Confirm extreme tweaks** | On | Extra warning dialogs for high-risk actions |

Also shows runtime mode (Tauri desktop vs browser preview) and data directory path.

---

### Language Switcher (Sidebar)

Above **Settings** in the sidebar:

- **ไทย** / **EN** toggle
- Syncs with Settings → Language
- Tweaks, Boost, Expert Guide, Settings pages are fully translated; Scanner / Cleaner / Network / Games remain English in v0.1.0

---

## Tweaks Catalog (31 rules)

### Windows (11)

| ID | Name | What it does |
|----|------|--------------|
| `win-game-mode` | Enable Game Mode | Prioritizes game processes; reduces background interruptions |
| `win-power-high` | High Performance Power Plan | Switches to High Performance power scheme |
| `win-visual-fx` | Disable Visual Effects | Turns off animations and transparency |
| `win-game-dvr` | Disable Xbox Game Bar DVR | Stops background recording overhead |
| `win-telemetry` | Disable Telemetry Services | Reduces DiagTrack / data collection services |
| `win-fullscreen-opt` | Disable Fullscreen Optimizations | Can lower input lag; may cause tearing in some titles |
| `win-bg-apps` | Limit Background Apps | Stops non-essential UWP background apps |
| `win-disable-power-saving` | Disable All Power Saving | CPU 100%, USB suspend off, PCIe ASPM off, disk never sleep, NIC save off |
| `win-priority-26` | Win32 Priority Separation (0x26) | Competitive CPU scheduler profile (0x26) |
| `win-mmcss-latency` | MMCSS Gaming Profile | System Responsiveness 0, Games task priority, Lazy Mode timeout |
| `win-system-ini-fps` | system.ini Latency Profile | `[386Enh]` time-slice tweaks; backs up `system.ini` first |

### GPU (6)

| ID | Name | What it does |
|----|------|--------------|
| `gpu-shader-cache` | Clear DirectX Shader Cache | Removes stale shader cache (not reversible — safe cleanup) |
| `gpu-max-perf` | Prefer Maximum Performance | NVIDIA/AMD max performance power management |
| `gpu-low-latency` | Low Latency Mode | Driver low-latency path where supported |
| `gpu-hags-advisor` | HAGS Status Check | **Advisor only** — scans HAGS registry, recommends ON/OFF per GPU |
| `gpu-power-limit` | GPU Power Limit | Power limit via vendor tooling — needs thermal headroom |
| `gpu-clock-offset` | GPU Clock Offset | Core/memory offset — wrong values can crash or BSOD |

### CPU (5)

| ID | Name | What it does |
|----|------|--------------|
| `cpu-game-priority` | Game Process High Priority | Raises active game process priority |
| `cpu-core-parking` | Disable CPU Core Parking | Keeps all cores awake; higher idle power |
| `cpu-timer-res` | Timer Resolution (Gaming) | Requests 0.5 ms timer while gaming |
| `cpu-undervolt` | CPU Undervolt Guide | **Advisor only** — step-by-step undervolt checklist |
| `cpu-power-limit` | CPU Power Limit (PL1/PL2) | Vendor power limit tooling — needs stability testing |

### Network (4)

| ID | Name | What it does |
|----|------|--------------|
| `net-dns-flush` | Flush DNS Cache | Clears resolver cache |
| `net-adapter-power` | Disable Adapter Power Saving | Prevents NIC sleep / ping spikes |
| `net-nagle` | Disable Nagle's Algorithm | May reduce latency in some online games |
| `net-throttling` | Network Throttling Index | Tunes Windows multimedia network throttling |

### Advanced (5)

| ID | Name | What it does |
|----|------|--------------|
| `adv-fan-curve` | Fan Curve Tuning | Manual fan curve via vendor tools |
| `adv-ram-standby` | Standby Memory Cleaner | Flushes standby list when RAM is tight |
| `adv-vbs-warn` | VBS / Core Isolation Check | **Advisor only** — detects VBS, explains FPS trade-off |
| `adv-vbs-disable` | Disable Memory Integrity | Can improve FPS; **reduces security** |
| `adv-bios-xmp` | XMP / EXPO Advisor | **Advisor only** — checks if RAM runs below rated speed |

---

## Boost Presets

### Safe Boost (7 tweaks)
`win-game-mode`, `win-power-high`, `win-visual-fx`, `win-bg-apps`, `gpu-shader-cache`, `cpu-game-priority`, `net-dns-flush`

Low risk. Good first step for any PC.

### Competitive Boost (18 tweaks)
Adds DVR off, telemetry off, fullscreen opt off, GPU max perf + low latency, timer resolution, NIC power, Nagle off, and full latency power bundle (`win-disable-power-saving`, `win-priority-26`, `win-mmcss-latency`).

Medium risk. **Restore point recommended.**

### Extreme Boost (22 tweaks)
Adds core parking off, network throttling, `win-system-ini-fps`, standby RAM cleaner.

High risk — possible BSOD or instability on some systems. **Restore point strongly recommended.**

### Expert Guide (advisor only)
Opens checklist for: HAGS, CPU undervolt, VBS check, XMP/EXPO BIOS guide.

- **No automatic changes** to BIOS, voltage, or clocks
- Steps can be **auto-verified** via WMI/registry
- **Accept all risks — skip guide** option with persisted waiver

---

## Expert Guide System

Advisor tweaks never auto-modify dangerous settings. Instead:

1. **Checklist modal** shows numbered steps with risk summary
2. **Verify** buttons check registry/WMI keys per step
3. **Waiver** — advanced users can skip the guide after accepting risks (stored in `state.json`)

Guides: HAGS Status, CPU Undervolt, VBS / Core Isolation, XMP / EXPO BIOS.

---

## Safety, Rollback & Data

| Concern | How FPS Unleashed handles it |
|---------|------------------------------|
| Reversible tweaks | Most tweaks save previous values and support revert |
| Batch undo | Rollback page → **Rollback All** |
| Windows restore | Manual or pre-Boost restore points |
| Risk tiers | Safe / Medium / High / Extreme badges on every tweak |
| Admin rights | Required for registry, services, power plan — run as Administrator |
| State file | `%LOCALAPPDATA%\fps-unleashed\state.json` — tweak states, settings, waiver |

**Disclaimer:** Extreme tweaks, undervolting, and BIOS changes can cause crashes or data loss. Always create a restore point and know how to revert.

---

## Development

**Requirements:** Node.js 22+, pnpm, Rust (stable), Visual Studio C++ Build Tools 2022

```powershell
cd FPS Unleashed
pnpm install
pnpm tauri dev
```

| Command | Purpose |
|---------|---------|
| `pnpm tauri dev` | Hot-reload UI + Rust backend |
| `npx tsc --noEmit` | TypeScript check |
| `pnpm build` | Frontend production build only |

**Stack:** Tauri 2 · React 19 · React Router 7 · Tailwind CSS 4 · Lucide icons · Rust `spawn_blocking` for WMI/registry I/O

---

## Build & Release

```powershell
.\build-exe.bat
```

This script:
1. Installs dependencies
2. Runs TypeScript check
3. Runs `pnpm tauri build`
4. Copies **all three** artifacts into `release/`:
   - `FPS Unleashed.exe`
   - `FPS Unleashed Setup.exe`
   - `FPS Unleashed.msi`
5. Removes stale files (old versioned installers)

---

## License

Private project — see repository owner for distribution terms.
