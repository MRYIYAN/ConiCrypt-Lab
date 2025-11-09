#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//================================================================//
// MAIN - Entry point ConiCrypt Lab Desktop App (Tauri + WS)
//================================================================//

//--------------------------------//
// Módulos y dependencias
//--------------------------------//

use tauri_appconicrypt_lab_lib as lib; 
mod ws;

use crate::lib::Config;

/// Comando Tauri: ping
///
/// Este comando es invocado desde el frontend y retorna "pong".
#[tauri::command]
fn ping() -> String {
    "pong".into()
}

//--------------------------------//
// Función principal
//--------------------------------//
///
/// - Espera a que los backends (core y plotter) estén disponibles.
/// - Lanza el servidor WebSocket en segundo plano.
/// - Inicia la aplicación Tauri para la interfaz de usuario.
///
/// # Detalles
/// - El servidor WebSocket escucha en el puerto configurado.
/// - La aplicación Tauri expone comandos al frontend.
#[tokio::main]
async fn main() {
    // Esperar backends antes de iniciar
    let config = Config::load();
    config.wait_for_backends().await;

    println!(
        "[INIT] Configuración cargada:\n  CORE_URL = {}\n  PLOTTER_URL = {}\n  WS = {}",
        config.core_url,
        config.plotter_url,
        config.ws_address()
    );

    // Lanzar servidor WS asíncrono
    let ws_config = config.clone();
    tokio::spawn(async move {
        ws::start_ws_server(ws_config).await;
    });

    // Iniciar Tauri
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}