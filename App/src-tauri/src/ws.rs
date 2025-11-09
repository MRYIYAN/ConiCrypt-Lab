//----------------------------------------------------------------//
// WS - Servidor WebSocket (Tokio + tokio-tungstenite)
//----------------------------------------------------------------//

use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use crate::lib::Config;

/// Inicia un servidor WebSocket asíncrono.
///
/// # Detalles
/// - Escucha conexiones en la dirección configurada.
/// - Envía un mensaje de bienvenida al conectar.
/// - Hace eco de los mensajes recibidos.
/// - Cada conexión se maneja en una tarea Tokio separada.
///
/// # Argumentos
/// - `config`: Configuración centralizada con URLs y puerto WS.
pub async fn start_ws_server(config: Config) {
    let bind_addr = format!("0.0.0.0:{}", config.ws_port);
    let listener = TcpListener::bind(&bind_addr)
        .await
        .expect("No se pudo iniciar el servidor WebSocket");

    println!("[WS] Escuchando en {}", config.ws_address());
    println!("[WS] Accediendo al CORE en {}", config.core_url);
    println!("[WS] Accediendo al PLOTTER en {}", config.plotter_url);

    loop {
        let (stream, _) = match listener.accept().await {
            Ok(s) => s,
            Err(e) => {
                eprintln!("[WS] Error al aceptar conexión: {}", e);
                continue;
            }
        };

        // Variables para uso futuro con core/plotter
        let _core = config.core_url.clone();
        let _plotter = config.plotter_url.clone();

        tokio::spawn(async move {
            let ws_stream = match accept_async(stream).await {
                Ok(ws) => ws,
                Err(e) => {
                    eprintln!("[WS] Fallo al hacer handshake WS: {}", e);
                    return;
                }
            };

            println!("[WS] Nueva conexión establecida ✅");
            let (mut write, mut read) = ws_stream.split();

            // Enviar mensaje inicial
            if let Err(e) = write
                .send(Message::Text(r#"{"event":"connected"}"#.into()))
                .await
            {
                eprintln!("[WS] Error enviando bienvenida: {}", e);
                return;
            }

            // Bucle principal del WebSocket
            while let Some(msg_res) = read.next().await {
                let msg = match msg_res {
                    Ok(m) => m,
                    Err(e) => {
                        eprintln!("[WS] Error leyendo mensaje: {}", e);
                        break;
                    }
                };

                if msg.is_text() || msg.is_binary() {
                    let txt = msg.to_text().unwrap_or("<binary>");
                    println!("[WS] Mensaje recibido: {}", txt);

                    if let Err(e) = write.send(Message::Text(format!("Echo: {}", txt))).await {
                        eprintln!("[WS] Error enviando respuesta: {}", e);
                        break;
                    }
                }
            }

            println!("[WS] Conexión cerrada");
        });
    }
}