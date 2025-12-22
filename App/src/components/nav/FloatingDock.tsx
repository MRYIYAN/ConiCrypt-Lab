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
import { useState, useEffect, useRef, useCallback } from 'react';
import type { View } from '../../App';
import styles from './FloatingDock.module.css';

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
  { id: 'biometric', label: 'Biometric Analysis', icon: <Grid3x3 size={22} /> },
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
  // Estado de snap del dock
  type DockSnap = 'center' | 'left' | 'right';
  const [snap, setSnap] = useState<DockSnap>('center');

  // Posición animada explícita del wrapper (evitar variants para x/y)
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const dockRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({
    top: 12,
    left: 12,
    right: Math.max(12, window.innerWidth - 72),
    bottom: Math.max(12, window.innerHeight - 72),
  });

  const updatePositionForSnap = useCallback((next: DockSnap) => {
    const rect = dockRef.current?.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const marginSide = 12;
    const marginBottom = 24;
    const w = rect?.width ?? 0;
    const h = rect?.height ?? 0;

    if (next === 'left') {
      setPosition({ x: marginSide, y: Math.max(16, (vh - h) / 2) });
    } else if (next === 'right') {
      setPosition({ x: Math.max(16, vw - w - marginSide), y: Math.max(16, (vh - h) / 2) });
    } else {
      setPosition({ x: Math.max(16, (vw - w) / 2), y: Math.max(16, vh - h - marginBottom) });
    }
  }, []);

  // Initialize centered position after mount
  useEffect(() => {
    updatePositionForSnap('center');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snap thresholded by viewport edges
  function handleSnap(point: { x: number; y: number }) {
    const threshold = 80;
    const width = window.innerWidth;

    if (point.x < threshold) {
      setSnap('left');
      updatePositionForSnap('left');
    } else if (point.x > width - threshold) {
      setSnap('right');
      updatePositionForSnap('right');
    } else {
      setSnap('center');
      updatePositionForSnap('center');
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setDragConstraints({
        top: 12,
        left: 12,
        right: Math.max(12, window.innerWidth - 72),
        bottom: Math.max(12, window.innerHeight - 72),
      });

      if (window.innerWidth < 768) {
        if (snap !== 'center') {
          setSnap('center');
        }
        updatePositionForSnap('center');
      } else {
        updatePositionForSnap(snap);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [snap, updatePositionForSnap]);

  return (
    <motion.div
      // Wrapper: fixed + animado por x/y; sin variants de posición absoluta
      className={`fixed z-40 ${styles.dockWrapper} ${styles.root}`}
      ref={dockRef}
      drag
      dragConstraints={dragConstraints}
      dragMomentum={false}
      dragElastic={0.15}
      animate={position}
      onDragEnd={(_, info) => handleSnap(info.point)}
      layout
      transition={{
        layout: { type: 'spring', stiffness: 420, damping: 30 },
        default: { type: 'spring', stiffness: 320, damping: 30 },
      }}
    >
      <motion.div
        className={`relative rounded-3xl ${styles.dockContainer} ${
          snap === 'center' ? styles.horizontal : styles.vertical
        }`}
        // Entrada con escala/opacidad para montar suavemente
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        // Spring de layout para cambios de orientación (horizontal/vertical)
        transition={{
          layout: { type: 'spring', stiffness: 500, damping: 35 },
          type: 'spring',
          stiffness: 300,
          damping: 25,
          delay: 0.2,
        }}
        layout
      >
        {/* Overlay animado: gradiente radial decorativo */}
        <motion.div
          className={styles.overlay}
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
        <div className={styles.edgeGlow} />

        {/* Lista de ítems del dock */}
        <div
          className={`relative items-center ${
            snap === 'center' ? styles.itemsHorizontal : styles.itemsVertical
          }`}
        >
          {dockItems.map((item) => {
            const isActive = activeView === (item.id as View);
            const isHovered = hoveredTab === item.id;

            return (
              <div key={item.id} className="relative">
                <motion.button
                  onClick={() => onChangeView(item.id as View)}
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`${styles.dockButton} ${
                    isActive ? styles.dockButtonActive : isHovered ? styles.dockButtonHovered : ''
                  }`}
                  // Botón: tamaño fijo, redondeado, transición; colores según estado
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
                    className={styles.icon}
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
                      className={`${styles.activeIndicator} ${snap !== 'center' ? styles.indicatorVertical : ''}`}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Glow de hover */}
                  {isHovered && !isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={styles.hoverGlow}
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
                    <div className={styles.tooltip}>{item.label}</div>
                    {/* Flecha del tooltip */}
                    <div className={styles.tooltipArrow} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Halo/handle visual para feedback de arrastre */}
        <div className={styles.dragHandle}>
          <div className={styles.gripDots}>
            <span className={styles.gripDot} />
            <span className={styles.gripDot} />
            <span className={styles.gripDot} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}