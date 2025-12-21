import { motion } from 'framer-motion';

const GREEN = '#4DFF8F';
const WHITE = '#ffffff';

export function PyVizAnimatedIcon({ className }: { className?: string }) {
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
      {/* Base blanca */}
      <g stroke={WHITE}>
        {/* <  */}
        <path d="M8 6l-6 6 6 6" />
        {/* > */}
        <path d="M16 6l6 6-6 6" />
        {/* / del medio */}
        <path d="M14 5l-4 14" />
      </g>

      {/* Barrido verde izquierda -> derecha */}
      <motion.g
        stroke={GREEN}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'] }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 1.2,
        }}
      >
        <path d="M8 6l-6 6 6 6" />
        <path d="M16 6l6 6-6 6" />
        <path d="M14 5l-4 14" />
      </motion.g>
    </svg>
  );
}
