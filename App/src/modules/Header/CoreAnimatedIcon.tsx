import { motion } from 'framer-motion';

const GREEN = '#4DFF8F';
const WHITE = '#ffffff';

export function CoreAnimatedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Núcleo */}
      <motion.rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1"
        initial={{ fill: WHITE, opacity: 0.6 }}
        animate={{
          fill: [WHITE, GREEN, WHITE],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Exterior / patillas */}
      <motion.g
        initial={{ stroke: WHITE, opacity: 0.4 }}
        animate={{
          stroke: [WHITE, GREEN, WHITE],
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.2, 
        }}
      >
        {/* Forma exacta Cpu (Lucide) */}
        <path d="M4 7h2M4 12h2M4 17h2" />
        <path d="M18 7h2M18 12h2M18 17h2" />
        <path d="M7 4v2M12 4v2M17 4v2" />
        <path d="M7 18v2M12 18v2M17 18v2" />
        <rect x="5" y="5" width="14" height="14" rx="2" />
      </motion.g>
    </svg>
  );
}
