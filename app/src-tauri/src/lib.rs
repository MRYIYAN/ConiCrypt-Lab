mod process;

use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::{StreamExt, SinkExt};
use serde_json::Value;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  // Start WebSocket server in a separate thread
  std::thread::spawn(|| {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
      start_websocket_server().await;
    });
  });

  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

async fn start_websocket_server() {
  let addr = "127.0.0.1:9090";
  let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
  println!("WebSocket server listening on: {}", addr);

  while let Ok((stream, _)) = listener.accept().await {
    tokio::spawn(handle_connection(stream));
  }
}

async fn handle_connection(stream: tokio::net::TcpStream) {
  let ws_stream = accept_async(stream)
    .await
    .expect("Error during WebSocket handshake");

  let (mut ws_sender, mut ws_receiver) = ws_stream.split();

  while let Some(msg) = ws_receiver.next().await {
    match msg {
      Ok(msg) => {
        if msg.is_text() {
          let text = msg.to_text().unwrap();
          
          // Parse the request
          match serde_json::from_str::<Value>(text) {
            Ok(request) => {
              let mode = request["mode"].as_str().unwrap_or("");
              
              let response = match mode {
                "conic" => process::process_conic_request(request.clone()),
                "ecc" => process::process_ecc_request(request.clone()),
                _ => Err("Unknown mode".to_string()),
              };
              
              let response_json = match response {
                Ok(val) => val,
                Err(e) => serde_json::json!({
                  "status": "error",
                  "message": e
                }),
              };
              
              let response_text = serde_json::to_string(&response_json).unwrap();
              let _ = ws_sender.send(tokio_tungstenite::tungstenite::Message::Text(response_text)).await;
            }
            Err(e) => {
              let error_msg = serde_json::json!({
                "status": "error",
                "message": format!("Invalid JSON: {}", e)
              });
              let _ = ws_sender.send(tokio_tungstenite::tungstenite::Message::Text(error_msg.to_string())).await;
            }
          }
        }
      }
      Err(e) => {
        eprintln!("WebSocket error: {}", e);
        break;
      }
    }
  }
}
