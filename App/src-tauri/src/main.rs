//================================================================//
// MAIN - Entry point ConiCrypt Lab Desktop App (Tauri + WS)
//================================================================//

//--------------------------------//
// Módulos y dependencias
//--------------------------------//
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod ws;

//--------------------------------//
// Comando Tauri: ping
//--------------------------------//
#[tauri::command]
fn ping() -> String {
    "pong".into()
}

//--------------------------------//
// Función principal
//--------------------------------//
/// 
/// - Lanza el servidor WebSocket en el puerto 9090.
/// - Inicializa la app Tauri y expone el comando `ping`.
/// - El servidor WS es accesible desde host.docker.internal.
///
/// # Uso
/// Ejecuta la app y el backend WS en paralelo.
///
//--------------------------------------------------//
#[tokio::main]
async fn main() {
    // Lanza el servidor WebSocket
    let ws_task = tokio::spawn(async {
        let addr = "0.0.0.0:9090".parse().unwrap(); // accesible desde host.docker 
        if let Err(e) = ws::run_ws(addr).await {
            eprintln!("[WS] error: {e:?}");
        }
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    let _ = ws_task.await;
}

