//===========================================================================//
//                                DASHBOARD                                   //
//===========================================================================//
//  Pantalla principal con animaciones 3D (Framer Motion), banner ASCII con
//  efecto de escritura y panel de estado del sistema. Emite eventos de
//  navegación mediante onNavigate sin decidir la vista por sí mismo.
//===========================================================================//

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Wifi, CheckCircle2, Play } from 'lucide-react';

const asciiArt = 
`██████╗ ██████╗ ███╗   ██╗██╗ ██████╗██████╗ ██╗   ██╗██████╗ ████████╗     ██╗      █████╗ ██████╗ 
██╔════╝██╔═══██╗████╗  ██║██║██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝     ██║     ██╔══██╗██╔══██╗
██║     ██║   ██║██╔██╗ ██║██║██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║        ██║     ███████║██████╔╝
██║     ██║   ██║██║╚██╗██║██║██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║        ██║     ██╔══██║██╔══██╗
╚██████╗╚██████╔╝██║ ╚████║██║╚██████╗██║  ██║   ██║   ██║        ██║███████╗███████╗██║  ██║██████╔╝
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝`;


//---------------------------------------------------------------------------//
// Props del componente
// - onNavigate(view): Emite cambio de vista ("dashboard" | "conics").
//---------------------------------------------------------------------------//
interface DashboardProps {
  onNavigate: (view: "dashboard" | "conics") => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  //---------------------------------------------------------------------------//
  // Estados y refs
  // - typedText / isTypingComplete: animación de tipo de ASCII.
  // - showTypingCursor: cursor parpadeante durante la escritura.
  // - containerRef: contenedor con perspectiva para parallax 3D.
  //---------------------------------------------------------------------------//
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // ASCII art typing animation states
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showTypingCursor, setShowTypingCursor] = useState(true);

  // 3D Parallax transforms for helmet HUD effect
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);
  const translateZ = useTransform(mouseX, [-300, 300], [-20, 20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    let charIndex = 0;
    const typingSpeed = 12; // Aumentado de 5ms a 12ms para animación más lenta y legible
    
    const typingInterval = setInterval(() => {
      if (charIndex < asciiArt.length) {
        setTypedText(asciiArt.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, []);
  
  useEffect(() => {
    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowTypingCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  const statusItems = [
    { label: 'WebSocket', status: true, icon: <Wifi size={18} /> },
    { label: 'Núcleo C', status: true, icon: <CheckCircle2 size={18} /> },
    { label: 'Plotter Python', status: true, icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen flex items-center justify-center overflow-hidden"
      style={{
        perspective: '1200px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Fondo animado (glow) no interactivo
         - pointer-events-none para no bloquear el HUD.
         - Se anima con gradientes radiales en bucle. */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(59, 75, 255, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(123, 44, 255, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 80%, rgba(0, 228, 255, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(59, 75, 255, 0.15) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Contenedor principal con profundidad y parallax
         - transformStyle: 'preserve-3d' mantiene el stacking en Z.
         - min-h-screen asegura centrado vertical del contenido. */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          translateZ, // integrar translateZ en el transform pipeline de Framer Motion
          transformStyle: 'preserve-3d',
        }}
        transition={{
          type: 'spring',
          stiffness: 50,
          damping: 20,
        }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8"
      >
        {/* Logo with holographic effect */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            transform: 'translateZ(100px)',
            transformStyle: 'preserve-3d',
          }}
          className="mb-12 text-center"
        >
          {/* ASCII Art with typing animation */}
          <div className="flex items-center justify-center mb-6">
            <pre
              style={{
                color: '#4DFF8F',
                textShadow: '0 0 10px rgba(77, 255, 143, 0.6), 0 0 20px rgba(59, 75, 255, 0.4)',
                fontSize: '11px',
                lineHeight: '1.2',
                fontFamily: 'monospace',
                margin: 0,
                whiteSpace: 'pre',
                display: 'inline',
              }}
            >
              {typedText}
            </pre>
            {!isTypingComplete && (
              <motion.span
                animate={{ 
                  opacity: showTypingCursor ? 1 : 0,
                  boxShadow: showTypingCursor 
                    ? '0 0 15px rgba(77, 255, 143, 0.8)' 
                    : '0 0 0px rgba(77, 255, 143, 0)',
                }}
                className="inline-block w-1.5 h-3 ml-0.5 rounded-sm"
                style={{ 
                  backgroundColor: '#4DFF8F',
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>
          
          <motion.p
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: isTypingComplete ? 1 : 0,
              scale: isTypingComplete ? 1 : 0.8,
              y: isTypingComplete ? 0 : 20
            }}
            transition={{ 
              duration: 1.2,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1] // Ease out expo para más suavidad
            }}
            className="mt-4"
            style={{
              fontSize: '1.2rem',
              color: '#A4A4B8',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {isTypingComplete && (
              <>
                {['L', 'a', 'b', 'o', 'r', 'a', 't', 'o', 'r', 'i', 'o', ' ', 'I', 'n', 't', 'e', 'r', 'a', 'c', 't', 'i', 'v', 'o', ' ', 'd', 'e', ' ', 'C', 'r', 'i', 'p', 't', 'o', 'g', 'r', 'a', 'f', 'í', 'a'].map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      filter: 'blur(0px)'
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.03,
                      ease: 'easeOut'
                    }}
                    style={{
                      display: 'inline-block',
                      textShadow: '0 0 20px rgba(164, 164, 184, 0.4)',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </>
            )}
          </motion.p>
        </motion.div>

        {/* Panel de estado (glassmorphism + profundidad) */}
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 0.5, 
            duration: 2,
            type: 'spring',
            stiffness: 40,
            damping: 25
          }}
          style={{
            transform: 'translateZ(50px)',
            transformStyle: 'preserve-3d',
          }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <h3 className="mb-6 text-center" style={{ color: '#E4E4EC' }}>
            Estado del Sistema
          </h3>
          
          <div className="flex gap-6">
            {statusItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl"
                style={{
                  backgroundColor: item.status 
                    ? 'rgba(77, 255, 143, 0.1)' 
                    : 'rgba(255, 77, 109, 0.1)',
                  border: `1px solid ${item.status ? 'rgba(77, 255, 143, 0.3)' : 'rgba(255, 77, 109, 0.3)'}`,
                }}
              >
                <div style={{ color: item.status ? '#4DFF8F' : '#FF4D6D' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: '0.85rem', color: '#E4E4EC' }}>
                  {item.label}
                </span>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: item.status ? '#4DFF8F' : '#FF4D6D',
                  }}
                >
                  {item.status ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Botón CTA: navega a Curvas Cónicas
           - onNavigate("conics") → App cambia la vista a ConicAnalysis.
           - Animaciones: spring + hover/tap para respuesta visual. */}
        <motion.button
          onClick={() => onNavigate("conics")}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: 1.2,
            duration: 2,
            type: 'spring',
            stiffness: 40,
            damping: 25
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 40px rgba(59, 75, 255, 0.6)',
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            transform: 'translateZ(60px)',
            backgroundColor: '#3B4BFF',
            color: '#E4E4EC',
            padding: '16px 48px',
            borderRadius: '12px',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(59, 75, 255, 0.4)',
          }}
          className="flex items-center gap-3"
        >
          <Play size={20} fill="currentColor" />
          Iniciar Análisis
        </motion.button>
      </motion.div>
    </div>
  );
}