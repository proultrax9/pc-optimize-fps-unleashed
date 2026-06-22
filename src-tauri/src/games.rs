use crate::models::GameProfile;
use crate::platform::run_ps;

struct GameTemplate {
    id: &'static str,
    name: &'static str,
    executable: &'static str,
    fps_cap: u32,
    priority: &'static str,
    launch_options: &'static str,
    notes: &'static [&'static str],
}

const TEMPLATES: &[GameTemplate] = &[
    GameTemplate {
        id: "apex",
        name: "Apex Legends",
        executable: "r5apex.exe",
        fps_cap: 237,
        priority: "high",
        launch_options: "+fps_max 237 -novid -high",
        notes: &[
            "Disable V-Sync in-game.",
            "NVIDIA Reflex: On + Boost.",
            "Cap FPS to refresh rate - 3 for G-Sync.",
        ],
    },
    GameTemplate {
        id: "valorant",
        name: "Valorant",
        executable: "VALORANT-Win64-Shipping.exe",
        fps_cap: 0,
        priority: "high",
        launch_options: "",
        notes: &[
            "Fullscreen mode recommended.",
            "Disable fullscreen optimizations per-game if stuttering.",
        ],
    },
    GameTemplate {
        id: "cs2",
        name: "Counter-Strike 2",
        executable: "cs2.exe",
        fps_cap: 0,
        priority: "high",
        launch_options: "-novid -high",
        notes: &[
            "Use fps_max 0 or match refresh rate.",
            "Low latency mode in NVIDIA panel.",
        ],
    },
    GameTemplate {
        id: "fortnite",
        name: "Fortnite",
        executable: "FortniteClient-Win64-Shipping.exe",
        fps_cap: 240,
        priority: "high",
        launch_options: "-USEALLAVAILABLECORES -NOMANSKY",
        notes: &["Performance mode rendering."],
    },
];

pub fn get_profiles() -> Vec<GameProfile> {
    let detected = detect_installed_games();

    TEMPLATES
        .iter()
        .map(|t| {
            let hit = detected.get(t.executable);
            GameProfile {
                id: t.id.to_string(),
                name: t.name.to_string(),
                executable: t.executable.to_string(),
                fps_cap: t.fps_cap,
                priority: t.priority.to_string(),
                launch_options: t.launch_options.to_string(),
                notes: t.notes.iter().map(|s| (*s).to_string()).collect(),
                installed: hit.is_some(),
                install_path: hit.cloned(),
            }
        })
        .collect()
}

#[cfg(windows)]
fn detect_installed_games() -> std::collections::HashMap<String, String> {
    let exes: Vec<&str> = TEMPLATES.iter().map(|t| t.executable).collect();
    let list = exes
        .iter()
        .map(|e| format!("'{}'", e.replace('\'', "''")))
        .collect::<Vec<_>>()
        .join(",");

    let script = format!(
        r#"
$targets = @({list})
$result = @{{}}
$steamPath = (Get-ItemProperty 'HKCU:\Software\Valve\Steam' -ErrorAction SilentlyContinue).SteamPath

foreach ($exe in $targets) {{
  $procName = $exe -replace '\.exe$',''
  $running = Get-Process -Name $procName -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($running -and $running.Path) {{
    $result[$exe] = $running.Path
    continue
  }}

  if ($steamPath) {{
    $hit = Get-ChildItem (Join-Path $steamPath 'steamapps\common') -Recurse -Filter $exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hit) {{
      $result[$exe] = $hit.FullName
      continue
    }}
  }}

  $drives = (Get-PSDrive -PSProvider FileSystem).Root
  foreach ($drive in $drives) {{
    $paths = @(
      (Join-Path $drive 'Program Files'),
      (Join-Path $drive 'Program Files (x86)'),
      (Join-Path $drive 'Games'),
      (Join-Path $drive 'XboxGames')
    )
    foreach ($base in $paths) {{
      if (-not (Test-Path $base)) {{ continue }}
      $hit = Get-ChildItem $base -Recurse -Filter $exe -Depth 5 -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($hit) {{
        $result[$exe] = $hit.FullName
        break
      }}
    }}
    if ($result.ContainsKey($exe)) {{ break }}
  }}
}}

$result | ConvertTo-Json -Compress
"#
    );

    match run_ps(&script) {
        Ok(raw) => parse_game_paths(&raw),
        Err(_) => std::collections::HashMap::new(),
    }
}

#[cfg(windows)]
fn parse_game_paths(raw: &str) -> std::collections::HashMap<String, String> {
    let trimmed = raw.trim().trim_start_matches('\u{feff}');
    let Some(json_line) = trimmed.lines().find(|l| l.starts_with('{')) else {
        return std::collections::HashMap::new();
    };
    serde_json::from_str(json_line).unwrap_or_default()
}

#[cfg(not(windows))]
fn detect_installed_games() -> std::collections::HashMap<String, String> {
    std::collections::HashMap::new()
}
