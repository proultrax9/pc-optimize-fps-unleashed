param(
    [string]$Version = "0.1.0"
)

$ErrorActionPreference = "Stop"
$Tag = "FPS_UNLEASHED_APP_V$Version"
$Gh = "C:\Program Files\GitHub CLI\gh.exe"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ReleaseDir = Join-Path $Root "release"

Set-Location $Root

if (-not (Test-Path $Gh)) {
    Write-Error "GitHub CLI not found. Install: winget install GitHub.cli"
}

& $Gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run once: gh auth login" -ForegroundColor Yellow
    exit 1
}

foreach ($file in @(
    "FPS Unleashed.exe",
    "FPS Unleashed Setup.exe",
    "FPS Unleashed.msi"
)) {
    if (-not (Test-Path (Join-Path $ReleaseDir $file))) {
        Write-Error "Missing release\$file — run .\build-exe.bat first"
    }
}

if (-not (git tag -l $Tag)) {
    git tag -a $Tag -m "FPS Unleashed v$Version"
    git push origin $Tag
}

$notes = @'
## FPS Unleashed v{0}

### Downloads
- FPS Unleashed.exe (portable)
- FPS Unleashed Setup.exe (installer)
- FPS Unleashed.msi (Windows Installer)

### Highlights
- 31 reversible tweaks, system scanner, boost presets
- Expert guides with step verification
- Rollback + restore points
- English / Thai UI
'@ -f $Version

& $Gh release create $Tag `
    --repo "proultrax9/pc-optimize-fps-unleashed" `
    --title $Tag `
    --notes $notes `
    --latest `
    (Join-Path $ReleaseDir "FPS Unleashed.exe") `
    (Join-Path $ReleaseDir "FPS Unleashed Setup.exe") `
    (Join-Path $ReleaseDir "FPS Unleashed.msi")

Write-Host "Published: https://github.com/proultrax9/pc-optimize-fps-unleashed/releases/tag/$Tag" -ForegroundColor Green
