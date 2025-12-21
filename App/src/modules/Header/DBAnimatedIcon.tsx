import { motion } from 'framer-motion';

const GREEN = '#4DFF8F';
const WHITE = '#ffffff';

export function DBAnimatedIcon({ className }: { className?: string }) {
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
      {/* Base blanca (icono completo) */}
      <g stroke={WHITE}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
        <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
        <path d="M3 19c0 1.7 4 3 9 3s9-1.3 9-3" />
      </g>

      {/* Pulso de escritura / lectura */}
      <motion.g
        stroke={GREEN}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* capa superior */}
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        {/* capa media */}
        <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
        {/* capa inferior */}
        <path d="M3 19c0 1.7 4 3 9 3s9-1.3 9-3" />
      </motion.g>
    </svg>
  );
}
