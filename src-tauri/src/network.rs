use crate::models::PingResult;
use crate::platform::run_ps;

pub fn ping_test(host: &str) -> PingResult {
    let safe_host = host.replace('\'', "");
    let script = format!(
        r#"
        $r = Test-Connection -ComputerName '{safe_host}' -Count 4 -ErrorAction SilentlyContinue
        if ($r) {{
            $avg = ($r | Measure-Object -Property ResponseTime -Average).Average
            $lost = 100 - (($r.Count / 4) * 100)
            Write-Output "OK|$avg|$lost"
        }} else {{
            Write-Output "FAIL|0|100"
        }}
        "#
    );

    match run_ps(&script) {
        Ok(out) => {
            let parts: Vec<&str> = out.trim().split('|').collect();
            if parts.first() == Some(&"OK") {
                PingResult {
                    host: host.to_string(),
                    latency_ms: parts.get(1).and_then(|s| s.parse().ok()),
                    packet_loss: parts.get(2).and_then(|s| s.parse().ok()),
                    message: "Ping test complete.".into(),
                }
            } else {
                PingResult {
                    host: host.to_string(),
                    latency_ms: None,
                    packet_loss: Some(100.0),
                    message: "Host unreachable.".into(),
                }
            }
        }
        Err(e) => PingResult {
            host: host.to_string(),
            latency_ms: None,
            packet_loss: None,
            message: e,
        },
    }
}
