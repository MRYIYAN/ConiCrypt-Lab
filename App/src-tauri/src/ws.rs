//================================================================//
// WS SERVER - WebSocket Tokio/Tungstenite para ConiCrypt Lab
//================================================================//

//--------------------------------//
// Dependencias y utilidades
//--------------------------------//
use futures_util::{SinkExt, StreamExt};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::accept_async;

//--------------------------------//
// Función principal del servidor WS
//--------------------------------//

/// Ejecuta un servidor WebSocket asíncrono en la dirección dada.
///
/// # Detalles
/// - Envía un mensaje de bienvenida al conectar.
/// - Hace eco de los mensajes recibidos.
/// - Cada conexión se maneja en una tarea Tokio separada.
///
///
/// # Argumentos
/// *  Dirección y puerto donde escuchar 
///
//-------------------------------//
pub async fn run_ws(addr: SocketAddr) -> anyhow::Result<()> {
    let listener = TcpListener::bind(addr).await?;
    println!("[WS] Listening on {}", addr);

    loop {
        let (stream, _) = listener.accept().await?;
        tokio::spawn(async move {
            if let Ok(ws_stream) = accept_async(stream).await {
                let (mut write, mut read) = ws_stream.split();
                // Enviar mensaje de bienvenida
                let _ = write.send(Message::Text(r#"{"event":"connected"}"#.into())).await;

                while let Some(Ok(msg)) = read.next().await {
                    if msg.is_text() || msg.is_binary() {
                        // eco de prueba
                        let _ = write.send(msg).await;
                    }
                }
            }
        });
    }
}

