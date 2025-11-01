// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod process;
mod ws;

use tokio::runtime::Runtime;

fn main() {
    // Create a Tokio runtime for the WebSocket server
    let rt = Runtime::new().expect("Failed to create Tokio runtime");
    
    // Spawn WebSocket server in a separate thread
    std::thread::spawn(move || {
        rt.block_on(async {
            ws::start_websocket_server().await;
        });
    });

    // Start Tauri application
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
