#[cfg(windows)]
mod imp {
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    const CREATE_NO_WINDOW: u32 = 0x08000000;

    pub fn run_cmd(program: &str, args: &[&str]) -> Result<String, String> {
        let output = Command::new(program)
            .args(args)
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("Failed to run {program}: {e}"))?;

        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

        if output.status.success() {
            Ok(if stdout.is_empty() { stderr } else { stdout })
        } else {
            Err(if stderr.is_empty() {
                format!("Command failed: {stdout}")
            } else {
                stderr
            })
        }
    }

    pub fn run_ps(script: &str) -> Result<String, String> {
        run_cmd(
            "powershell",
            &["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
        )
    }
}

#[cfg(not(windows))]
mod imp {
    pub fn run_cmd(_program: &str, _args: &[&str]) -> Result<String, String> {
        Err("Windows only".into())
    }

    pub fn run_ps(_script: &str) -> Result<String, String> {
        Err("Windows only".into())
    }
}

pub use imp::*;
