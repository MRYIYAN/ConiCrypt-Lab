//================================================================//
// MAIN - Entry point ConiCrypt Lab Desktop App 
//================================================================//
//
// Este archivo define el componente principal de la aplicación de escritorio
//
// - Escucha eventos WebSocket en el puerto 9090 para recibir notificaciones en tiempo real.
// - Actualiza la UI cuando se recibe el evento "update_conic" 
// - Incluye un formulario que envía datos al backend Rust usando Tauri invoke.
// - Presenta enlaces y logos de Vite, Tauri y React.
//
// Este componente es el punto de entrada visual e interactivo de la app suerte :)
//
//--------------------------------//
// Módulos y dependencias
//--------------------------------//
import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api";
import "./App.css";

/**
 * Componente principal de la aplicación
 * 
 * - Escucha eventos WebSocket en 9090
 * - Refresca la UI con "update_conic"
 * - Expone un formulario para saludar usando Tauri invoke.
 * 
 * @returns JSX.Element
 */
function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:9090");
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.event === "update_conic") {
          console.log("update_conic recibido!");
          // Aquí refrescá el JSON o re-renderizara el gráfico
        }
      } catch (err) {
        console.error("Error WS:", err);
      }
    };
    return () => ws.close();
  }, []);

  /**
   * Envía el nombre al backend Rust usando Tauri invoke.
   */
  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
