use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::CorsLayer;

use crate::process::execute_core_binary;

#[derive(Clone)]
pub struct AppState {
    // Can be extended with shared state if needed
}

pub async fn start_websocket_server() {
    let state = AppState {};

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .layer(CorsLayer::permissive())
        .with_state(Arc::new(state));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:9090")
        .await
        .expect("Failed to bind to port 9090");

    println!("WebSocket server listening on ws://127.0.0.1:9090/ws");

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();

    while let Some(msg) = receiver.next().await {
        if let Ok(msg) = msg {
            match msg {
                Message::Text(text) => {
                    println!("Received message: {}", text);
                    
                    let response = match process_message(&text).await {
                        Ok(result) => result,
                        Err(e) => json!({ "error": e }),
                    };

                    let response_text = serde_json::to_string(&response).unwrap();
                    
                    if let Err(e) = sender.send(Message::Text(response_text)).await {
                        println!("Error sending response: {}", e);
                        break;
                    }
                }
                Message::Close(_) => {
                    println!("Client disconnected");
                    break;
                }
                _ => {}
            }
        } else {
            break;
        }
    }
}

async fn process_message(text: &str) -> Result<Value, String> {
    let message: Value = serde_json::from_str(text)
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    let op = message.get("op")
        .and_then(|v| v.as_str())
        .ok_or("Missing 'op' field")?;

    let payload = message.get("payload")
        .ok_or("Missing 'payload' field")?
        .clone();

    match op {
        "analyze_conic" => {
            execute_core_binary("--conic", &payload)
        }
        "simulate_ecc" => {
            execute_core_binary("--ecc", &payload)
        }
        _ => Err(format!("Unknown operation: {}", op)),
    }
}
