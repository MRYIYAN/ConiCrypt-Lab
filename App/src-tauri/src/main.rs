#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//================================================================//
// MAIN - Entry point ConiCrypt Lab Desktop App (Tauri + WS)
//================================================================//

//--------------------------------//
// Módulos y dependencias
//--------------------------------//

use tauri_appconicrypt_lab_lib as lib;
use lib::Config;

mod ws;

#[tauri::command]
fn ping() -> String {
    "pong".into()
}

#[tokio::main]
async fn main() {
    // 1️ Cargar configuración
    let config = Config::load();

    // 2️ Bloqueo controlado: esperamos a core y plotter antes de Tauri
    config.wait_for_backends().await;

    println!(
        "[INIT] Configuración cargada:\n  CORE_URL = {}\n  PLOTTER_URL = {}\n  WS = {}",
        config.core_url,
        config.plotter_url,
        config.ws_address()
    );

    // 3️ Lanzar WS en background con Tokio
    let ws_config = config.clone();
    tokio::spawn(async move {
        ws::start_ws_server(ws_config).await;
    });

    // 4️ Arrancar Tauri una vez que los servicios están listos
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ping])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}