import { motion, easeInOut } from 'framer-motion';

export function WifiAnimatedIcon({ className }: { className?: string }) {
  const barFill = (delay: number) => ({
    animate: {
      opacity: [0.3, 1, 1, 0.3],
      fill: ['#ffffff', '#4DFF8F', '#4DFF8F', '#ffffff'],
    },
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: easeInOut,
      delay,
    },
  });

  const barStroke = (delay: number) => ({
    animate: {
      opacity: [0.3, 1, 1, 0.3],
      stroke: ['#ffffff', '#4DFF8F', '#4DFF8F', '#ffffff'],
    },
    transition: {
      duration: 2.8,
      repeat: Infinity,
      ease: easeInOut,
      delay,
    },
  });

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Barra inferior (punto) */}
      <motion.path
        d="M12 18a1.5 1.5 0 1 0 0.001 3.001A1.5 1.5 0 0 0 12 18z"
        {...barFill(0)}
      />

      {/* Barra media */}
      <motion.path
        d="M8.5 15.5a5 5 0 0 1 7 0"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        {...barStroke(0.3)}
      />

      {/* Barra superior */}
      <motion.path
        d="M5 12a9 9 0 0 1 14 0"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        {...barStroke(0.6)}
      />
    </svg>
  );
}
