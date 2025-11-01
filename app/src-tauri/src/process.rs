use serde_json::Value;
use std::io::{Write, BufRead};
use std::process::{Command, Stdio};
use std::time::Duration;

pub fn execute_core_binary(mode: &str, payload: &Value) -> Result<Value, String> {
    // Path to the core binary
    let binary_path = if cfg!(target_os = "windows") {
        "../../core/bin/conicrypt.exe"
    } else {
        "../../core/bin/conicrypt"
    };

    // Spawn the process
    let mut child = Command::new(binary_path)
        .arg(mode)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn process: {}", e))?;

    // Write input to stdin
    if let Some(mut stdin) = child.stdin.take() {
        let input = serde_json::to_string(payload)
            .map_err(|e| format!("Failed to serialize input: {}", e))?;
        
        stdin.write_all(input.as_bytes())
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        
        stdin.flush()
            .map_err(|e| format!("Failed to flush stdin: {}", e))?;
    }

    // Wait for process to complete with timeout
    let output = child.wait_with_output()
        .map_err(|e| format!("Failed to wait for process: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Process failed: {}", stderr));
    }

    // Parse output
    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse output: {}", e))
}
