//===========================================================================//
//                           APLICACIÓN PRINCIPAL                             //
//===========================================================================//
//  Componente raíz que define la arquitectura de capas de la UI:
//  - Capa de fondo (WireframeGeometryBackground)                          z-0
//  - Vista principal (Dashboard / ConicAnalysis)                          z-10
//  - Dock flotante y Terminal                                             z-30+
//  Gestiona el estado de navegación (View) y propaga cambios al Dock y al
//  Dashboard. Mantiene el cursor personalizado y el canvas sin scroll.
//===========================================================================//

import { useState } from "react";
import { FloatingDock } from "./components/nav/FloatingDock";
import { Terminal } from "./components/overlay/Terminal";
import { Dashboard } from "./modules/dashboard/Dashboard";
import { ConicAnalysis } from "./modules/conic-analysis/ConicAnalysis";
import { WireframeGeometryBackground } from "./components/visual/WireframeGeometryBackground";
import { CustomCursor } from "./components/visual/CustomCursor";

export type View =
  | "dashboard"
  | "conics"
  | "ecc"
  | "history"
  | "settings";

//---------------------------------------------------------------------------//
// Estado de navegación de la aplicación (vista activa)
// - Controlado en App para evitar estados duplicados en subcomponentes.
// - Se pasa a Dashboard y FloatingDock vía props.
//---------------------------------------------------------------------------//
export default function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div
      id="scene"
      className="relative w-screen h-screen overflow-hidden"
      style={{ cursor: "none" }}
    >
      {/* CAPA DE FONDO (no interactiva)
         - pointer-events-none evita bloquear la UI.
         - z-0 garantiza que la UI quede por encima. */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <WireframeGeometryBackground />
      </div>

      {/* VISTA PRINCIPAL (según estado 'view')
         - Solo renderiza el módulo activo.
         - Dashboard emite onNavigate("conics") para cambiar a ConicAnalysis. */}
      <div className="absolute inset-0 z-10">
        {view === "dashboard" && (
          <Dashboard onNavigate={setView} />
        )}

        {view === "conics" && <ConicAnalysis />}
      </div>

      {/* DOCK FLOTANTE (controlado por props: activeView / onChangeView)
         - Usa IDs alineados con el tipo View.
         - No guarda estado interno de pestañas; App es la fuente de verdad. */}
      <FloatingDock
        activeView={view}
        onChangeView={setView}
      />

      {/* TERMINAL + CURSOR PERSONALIZADO
         - Terminal se muestra en la capa superior.
         - CustomCursor desactiva el cursor del sistema y dibuja uno propio. */}
      <div className="fixed top-12 left-12 z-40">
        <Terminal />
      </div>

      <CustomCursor />
    </div>
  );
}
