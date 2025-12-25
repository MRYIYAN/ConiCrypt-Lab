//----------------------------------------------------------------//
// LIB - Configuración y utilidades comunes (ConiCrypt Lab)
//----------------------------------------------------------------//

use std::{
    env,
    io::Write,
    net::TcpStream as StdTcpStream,
    thread::sleep,
    time::{Duration, Instant},
};

/// Configuración centralizada para la aplicación.
///
/// Carga valores desde las variables de entorno con valores por defecto
/// para desarrollo local. Proporciona métodos para obtener direcciones
/// y esperar a que los servicios backend estén disponibles.
#[derive(Clone, Debug)]
pub struct Config {
    /// URL del servicio Core (HTTP).
    pub core_url: String,
    /// URL del servicio Plotter (HTTP).
    pub plotter_url: String,
    /// Host para el servidor WebSocket.
    pub ws_host: String,
    /// Puerto del servidor WebSocket (texto para interpolar).
    pub ws_port: String,
}

impl Config {
    /// Carga la configuración desde las variables de entorno o usa valores por defecto.
    ///
    /// Valores por defecto:
    /// - CORE_URL: http://127.0.0.1:5000
    /// - PLOTTER_URL: http://127.0.0.1:5001
    /// - WS_HOST: 127.0.0.1
    /// - WS_PORT: 9191
    pub fn load() -> Self {
        Self {
            core_url: env::var("CORE_URL").unwrap_or_else(|_| "http://127.0.0.1:5000".into()),
            plotter_url: env::var("PLOTTER_URL").unwrap_or_else(|_| "http://127.0.0.1:5001".into()),
            ws_host: env::var("WS_HOST").unwrap_or_else(|_| "127.0.0.1".into()),
            ws_port: env::var("WS_PORT").unwrap_or_else(|_| "9191".into()),
        }
    }

    /// Construye la dirección completa del WebSocket (ej. ws://host:port).
    pub fn ws_address(&self) -> String {
        format!("ws://{}:{}", self.ws_host, self.ws_port)
    }

    /// Extrae "host:port" de una URL como "http://host:puerto/…".
    ///
    /// Si no hay puerto en la URL, usa el puerto por defecto.
    fn host_port_from_url(url: &str, default_port: &str) -> String {
        let trimmed = url
            .trim_start_matches("http://")
            .trim_start_matches("https://");
        let first_seg = trimmed.split('/').next().unwrap_or(trimmed);
        if first_seg.contains(':') {
            first_seg.to_string()
        } else {
            format!("{}:{}", first_seg, default_port)
        }
    }

    /// Devuelve la dirección del servicio Core en formato "host:port".
    pub fn core_addr(&self) -> String {
        Self::host_port_from_url(&self.core_url, "5000")
    }

    /// Devuelve la dirección del servicio Plotter en formato "host:port".
    pub fn plotter_addr(&self) -> String {
        Self::host_port_from_url(&self.plotter_url, "5001")
    }

    /// Verifica si el Core responde mediante una solicitud HTTP síncrona.
    pub fn core_alive(&self) -> bool {
        reqwest::blocking::get(&self.core_url).is_ok()
    }

    /// Verifica si el Plotter responde mediante una solicitud HTTP síncrona.
    pub fn plotter_alive(&self) -> bool {
        reqwest::blocking::get(&self.plotter_url).is_ok()
    }

    /// Espera a que el backend Plotter esté disponible (solo Plotter, no Core).
    pub async fn wait_for_backends(&self) {
        println!("[INIT] Esperando backend Docker (plotter)...");

        for attempt in 1..=30 {
            let plotter_up = tokio::net::TcpStream::connect(self.plotter_addr()).await.is_ok();

            if plotter_up {
                println!("\n[OK] Plotter disponible");
                return;
            }

            if attempt == 1 {
                println!(
                    "[WAIT] Aguardando servicio en {} …",
                    self.plotter_addr()
                );
            }

            print!(".");
            let _ = std::io::stdout().flush();
            tokio::time::sleep(std::time::Duration::from_secs(2)).await;
        }

        eprintln!("\n[ERROR] Plotter no disponible");
        eprintln!("Asegúrate de ejecutar: docker compose up -d plotter");
        std::process::exit(1);
    }

    /// Espera BLOQUEANTE a que los backends estén disponibles.
    /// Usada ANTES de iniciar Tauri (seguro).
    pub fn wait_for_backends_blocking(&self) {
        let timeout = Duration::from_secs(60);
        let start = Instant::now();

        println!("[INIT] Esperando backend Docker (core/plotter)...");
        print!(
            "[WAIT] Aguardando servicios en {} y {} ",
            self.core_addr(),
            self.plotter_addr()
        );
        let _ = std::io::stdout().flush();

        while start.elapsed() < timeout {
            let core_up = StdTcpStream::connect(self.core_addr()).is_ok();
            let plot_up = StdTcpStream::connect(self.plotter_addr()).is_ok();

            if core_up && plot_up {
                println!("\n[OK] Backend Docker disponible");
                return;
            }

            print!(".");
            let _ = std::io::stdout().flush();
            sleep(Duration::from_secs(2));
        }

        eprintln!("\n[ERROR] Backend Docker no disponible");
        eprintln!("Asegúrate de ejecutar: docker compose up -d");
        std::process::exit(1);
    }
}