use crate::models::{CleanOptions, CleanResult};
use crate::platform::{run_cmd, run_ps};

pub fn run_cleaner(opts: CleanOptions) -> CleanResult {
    let mut items = Vec::new();
    let mut freed_bytes: u64 = 0;

    if opts.temp_files {
        if let Ok(out) = run_ps(
            r#"
            $paths = @($env:TEMP, "$env:LOCALAPPDATA\Temp", "$env:WINDIR\Temp")
            $freed = 0
            foreach ($p in $paths) {
                if (Test-Path $p) {
                    Get-ChildItem $p -ErrorAction SilentlyContinue | ForEach-Object {
                        try {
                            $freed += ($_.Length)
                            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
                        } catch {}
                    }
                }
            }
            Write-Output $freed
            "#,
        ) {
            if let Ok(n) = out.trim().parse::<u64>() {
                freed_bytes += n;
            }
            items.push("Temporary files".into());
        }
    }

    if opts.shader_cache {
        if let Ok(_) = run_ps(
            r#"
            $paths = @("$env:LOCALAPPDATA\D3DSCache", "$env:LOCALAPPDATA\NVIDIA\DXCache")
            foreach ($p in $paths) {
                if (Test-Path $p) { Remove-Item $p\* -Recurse -Force -ErrorAction SilentlyContinue }
            }
            "#,
        ) {
            items.push("Shader cache".into());
        }
    }

    if opts.dns_cache {
        if run_cmd("ipconfig", &["/flushdns"]).is_ok() {
            items.push("DNS cache".into());
        }
    }

    if opts.recycle_bin {
        if run_ps("Clear-RecycleBin -Force -ErrorAction SilentlyContinue").is_ok() {
            items.push("Recycle bin".into());
        }
    }

    let freed_mb = freed_bytes as f64 / 1024.0 / 1024.0;
    let message = if items.is_empty() {
        "No cleanup options selected.".into()
    } else {
        format!("Cleaned {} item(s).", items.len())
    };

    CleanResult {
        freed_mb,
        items,
        message,
    }
}
