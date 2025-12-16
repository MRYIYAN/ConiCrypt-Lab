//===========================================================================//
//                              FLOATING DOCK                                 //
//===========================================================================//
// Barra de navegación inferior con animaciones (Framer Motion).
// - Estado controlado interno: pestaña activa y hovered.
// - Estética: gradientes, blur, sombras y glow en hover/activo.
// - Accesibilidad visual: tooltip al hover.
//===========================================================================//

//---------------------------------------------------------------------------//
//                                IMPORTS                                     //
//---------------------------------------------------------------------------//YYSSS
import { motion } from 'framer-motion';
import { Home, Circle, Grid3x3, Clock, Settings } from 'lucide-react';
import { useState } from 'react';
// Import View type to type props
import type { View } from '../../App';

//---------------------------------------------------------------------------//
//                                TIPOS/ITEMS                                 //
//---------------------------------------------------------------------------//
interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
// Map IDs to App View type (use "conics" not "conic")
const dockItems: DockItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={22} /> },
  { id: 'conics', label: 'Curvas Cónicas', icon: <Circle size={22} /> },
  { id: 'ecc', label: 'ECC Mode', icon: <Grid3x3 size={22} /> },
  { id: 'history', label: 'Historial', icon: <Clock size={22} /> },
  { id: 'settings', label: 'Configuración', icon: <Settings size={22} /> },
];

//---------------------------------------------------------------------------//
//                           COMPONENTE PRINCIPAL                             //
//---------------------------------------------------------------------------//
export function FloatingDock({
  activeView,
  onChangeView,
}: {
  activeView: View;
  onChangeView: (view: View) => void;
}) {
  // Estado UI: pestaña activa y elemento con hover
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <motion.div
      // Entrada con escala/opacidad para montar suavemente
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
      // Posicionamiento: fijo y centrado con translateX; offset fino con margin-left
      className="fixed bottom-8 left-1/2 z-40"
      style={{ 
        transform: 'translateX(-50%)',
        marginLeft: '-180px',
      }}
    >
      <motion.div
        // Contenedor visual con gradiente, blur y sombras internas/externas
        className="relative rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 35, 0.95), rgba(25, 25, 45, 0.95))',
          backdropFilter: 'blur(40px) saturate(150%)',
          border: '1px solid rgba(59, 75, 255, 0.25)',
          padding: '12px 16px',
          boxShadow: `
            0 0 0 1px rgba(59, 75, 255, 0.15),
            0 16px 48px rgba(0, 0, 0, 0.7),
            0 0 80px rgba(59, 75, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3)
          `,
        }}
      >
        {/* Overlay animado: gradiente radial decorativo */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 75, 255, 0.2), transparent 70%)',
          }}
          animate={{
            background: [
              'radial-gradient(circle at 30% 50%, rgba(59, 75, 255, 0.2), transparent 70%)',
              'radial-gradient(circle at 70% 50%, rgba(123, 44, 255, 0.15), transparent 70%)',
              'radial-gradient(circle at 30% 50%, rgba(59, 75, 255, 0.2), transparent 70%)',
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Glow suave en los bordes */}
        <div 
          className="absolute -inset-0.5 rounded-3xl pointer-events-none opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(59, 75, 255, 0.1), transparent)',
            filter: 'blur(8px)',
          }}
        />

        {/* Lista de ítems del dock */}
        <div className="relative flex items-center gap-2">
          {dockItems.map((item) => {
            const isActive = activeView === (item.id as View);
            const isHovered = hoveredTab === item.id;

            return (
              <div key={item.id} className="relative">
                <motion.button
                  onClick={() => onChangeView(item.id as View)}
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  // Botón: tamaño fijo, redondeado, transición; colores según estado
                  className="relative p-3 rounded-2xl transition-all flex items-center justify-center"
                  style={{
                    width: '52px',
                    height: '52px',
                    color: isActive ? '#FFFFFF' : isHovered ? '#E4E4EC' : '#6C6C8C',
                    backgroundColor: isActive 
                      ? 'rgba(59, 75, 255, 0.4)' 
                      : isHovered 
                      ? 'rgba(123, 44, 255, 0.2)' 
                      : 'transparent',
                    border: isActive 
                      ? '1px solid rgba(59, 75, 255, 0.5)' 
                      : '1px solid transparent',
                    boxShadow: isActive 
                      ? '0 0 20px rgba(59, 75, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                      : 'none',
                  }}
                  // Animaciones de interacción
                  whileHover={{ 
                    scale: 1.05,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  {/* Ícono con glow dinámico según estado */}
                  <motion.div
                    animate={{
                      filter: isActive 
                        ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))' 
                        : isHovered
                        ? 'drop-shadow(0 0 6px rgba(228, 228, 236, 0.4))'
                        : 'drop-shadow(0 0 0px transparent)',
                    }}
                  >
                    {item.icon}
                  </motion.div>
                  
                  {/* Indicador activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1.5 left-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ 
                        backgroundColor: '#3B4BFF',
                        boxShadow: '0 0 12px rgba(59, 75, 255, 0.9), 0 0 24px rgba(59, 75, 255, 0.6)',
                        transform: 'translateX(-50%)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Glow de hover */}
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        border: '1px solid rgba(123, 44, 255, 0.3)',
                        boxShadow: '0 0 16px rgba(123, 44, 255, 0.2)',
                      }}
                    />
                  )}
                </motion.button>

                {/* Tooltip del ítem */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <div 
                      className="px-4 py-2 rounded-xl"
                      style={{ 
                        color: '#E4E4EC',
                        background: 'linear-gradient(135deg, rgba(18, 18, 35, 0.98), rgba(25, 25, 45, 0.98))',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(59, 75, 255, 0.3)',
                        fontSize: '13px',
                        fontWeight: 500,
                        boxShadow: `
                          0 4px 20px rgba(0, 0, 0, 0.6),
                          0 0 30px rgba(59, 75, 255, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `,
                      }}
                    >
                      {item.label}
                    </div>
                    {/* Flecha del tooltip */}
                    <div 
                      className="absolute -bottom-1 left-1/2 w-2 h-2"
                      style={{
                        backgroundColor: 'rgba(18, 18, 35, 0.98)',
                        border: '1px solid rgba(59, 75, 255, 0.3)',
                        borderTop: 'none',
                        borderLeft: 'none',
                        transform: 'translateX(-50%) rotate(45deg)',
                      }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}