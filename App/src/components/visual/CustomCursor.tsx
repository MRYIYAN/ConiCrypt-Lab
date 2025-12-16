import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);

  // Suavizado del cursor con spring
  const springConfig = { damping: 60, stiffness: 800 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    let hoverTimeout: NodeJS.Timeout;

    // Detectar elementos interactivos con debounce
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') !== null ||
        target.closest('a') !== null;
      
      clearTimeout(hoverTimeout);
      
      if (isInteractive) {
        hoverTimeout = setTimeout(() => {
          setIsHovering(true);
        }, 50);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      clearTimeout(hoverTimeout);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Cursor principal */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-9999 mix-blend-screen"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        {/* Círculo exterior con glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: isHovering ? 40 : 16,
            height: isHovering ? 40 : 16,
            x: isHovering ? -20 : -8,
            y: isHovering ? -20 : -8,
            backgroundColor: isHovering ? '#7B2CFF' : '#3B4BFF',
            boxShadow: isHovering 
              ? '0 0 20px rgba(123, 44, 255, 0.6), 0 0 40px rgba(123, 44, 255, 0.3)'
              : '0 0 12px rgba(59, 75, 255, 0.5), 0 0 24px rgba(59, 75, 255, 0.25)',
          }}
          animate={{
            width: isHovering ? 40 : 16,
            height: isHovering ? 40 : 16,
            x: isHovering ? -20 : -8,
            y: isHovering ? -20 : -8,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />

        {/* Punto central */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            x: -2,
            y: -2,
            backgroundColor: '#FFFFFF',
            opacity: isHovering ? 0 : 1,
          }}
          animate={{
            opacity: isHovering ? 0 : 1,
            scale: isHovering ? 0 : 1,
          }}
          transition={{
            duration: 0.15,
          }}
        />

        {/* Icono cuando está sobre elemento interactivo */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            x: -20,
            y: -20,
            opacity: isHovering ? 1 : 0,
            scale: isHovering ? 1 : 0,
          }}
          animate={{
            opacity: isHovering ? 1 : 0,
            scale: isHovering ? 1 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Terminal prompt icon: > _ */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {/* Chevron derecho (>) */}
            <path
              d="M5 4 L11 10 L5 16"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Línea guion bajo (_) */}
            <line
              x1="12"
              y1="14"
              x2="17"
              y2="14"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Anillo exterior animado cuando está hover */}
        <motion.div
          className="absolute rounded-full border-2"
          style={{
            width: isHovering ? 56 : 0,
            height: isHovering ? 56 : 0,
            x: isHovering ? -28 : -8,
            y: isHovering ? -28 : -8,
            borderColor: '#7B2CFF',
            opacity: isHovering ? 0.25 : 0,
          }}
          animate={{
            width: isHovering ? 56 : 0,
            height: isHovering ? 56 : 0,
            x: isHovering ? -28 : -8,
            y: isHovering ? -28 : -8,
            opacity: isHovering ? [0.25, 0] : 0,
            scale: isHovering ? [1, 1.1] : 1,
          }}
          transition={{
            opacity: { duration: 1.2, repeat: Infinity, ease: 'easeOut' },
            scale: { duration: 1.2, repeat: Infinity, ease: 'easeOut' },
            width: { type: 'spring', stiffness: 500, damping: 30 },
            height: { type: 'spring', stiffness: 500, damping: 30 },
          }}
        />
      </motion.div>

      {/* Estela del cursor (trail effect) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-9999 rounded-full"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          background: 'radial-gradient(circle, rgba(59, 75, 255, 0.2) 0%, transparent 70%)',
        }}
      />
    </>
  );
}