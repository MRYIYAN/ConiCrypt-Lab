use std::process::{Command, Stdio};
use std::io::{Write, BufRead, BufReader};
use serde_json::Value;

pub struct CoreProcess {
    mode: String,
}

impl CoreProcess {
    pub fn new(mode: String) -> Self {
        CoreProcess { mode }
    }
    
    pub fn execute(&self, input: &str) -> Result<String, String> {
        // Path to the C core executable (relative to the Tauri app)
        let core_path = if cfg!(debug_assertions) {
            "../../core/bin/conicrypt"
        } else {
            "../core/bin/conicrypt"
        };
        
        let mut child = Command::new(core_path)
            .arg(&self.mode)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn process: {}", e))?;
        
        // Write input to stdin
        if let Some(mut stdin) = child.stdin.take() {
            stdin.write_all(input.as_bytes())
                .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        }
        
        // Read output from stdout
        let output = child.wait_with_output()
            .map_err(|e| format!("Failed to wait for process: {}", e))?;
        
        if output.status.success() {
            String::from_utf8(output.stdout)
                .map_err(|e| format!("Failed to parse output: {}", e))
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Process failed: {}", stderr))
        }
    }
}

pub fn process_conic_request(request: Value) -> Result<Value, String> {
    let input = serde_json::to_string(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;
    
    let processor = CoreProcess::new("--conic".to_string());
    let output = processor.execute(&input)?;
    
    serde_json::from_str(&output)
        .map_err(|e| format!("Failed to parse response: {}", e))
}

pub fn process_ecc_request(request: Value) -> Result<Value, String> {
    let input = serde_json::to_string(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;
    
    let processor = CoreProcess::new("--ecc".to_string());
    let output = processor.execute(&input)?;
    
    serde_json::from_str(&output)
        .map_err(|e| format!("Failed to parse response: {}", e))
}
