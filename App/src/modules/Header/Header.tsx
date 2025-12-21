import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { WifiAnimatedIcon } from './WifiAnimatedIcon';
import { CoreAnimatedIcon } from './CoreAnimatedIcon';
import { PyVizAnimatedIcon } from './PyVizAnimatedIcon';
import { DBAnimatedIcon } from './DBAnimatedIcon';
import styles from './Header.module.css';

interface HeaderProps {
  moduleName: string;
}

/* Variantes del contenedor */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

/* Variantes de cada indicador */
const itemVariants: Variants = {
  hidden: {
    y: -40,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      y: {
        type: 'spring' as const,
        stiffness: 220, // más lento
        damping: 10,    // más rebote
        mass: 1.3,      // más peso
      },
      opacity: {
        duration: 0.35,
        ease: 'easeOut',
      },
    },
  },
};

export function Header({ moduleName }: HeaderProps) {
  return (
    <motion.div
      className={styles.root}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <motion.div
        className={styles.left}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{
          delay: 0.15 + 0.12 * 4, // espera a que caigan WS, Core, PyViz, DB
        }}
        whileInView={{
          y: [0, -8, 0], // saltito más visible
        }}
      >
        <AnimatedIndicator
          label="WS"
          customIcon={<WifiAnimatedIcon className={styles.icon} />}
        />
        <Separator />
        <AnimatedIndicator
          label="Core"
          customIcon={<CoreAnimatedIcon className={styles.icon} />}
        />
        <Separator />
        <AnimatedIndicator
          label="PyViz"
          customIcon={<PyVizAnimatedIcon className={styles.icon} />}
        />
        <Separator />
        <AnimatedIndicator
          label="DB"
          customIcon={<DBAnimatedIcon className={styles.icon} />}
        />
      </motion.div>

      <div className={styles.spacer} />

      <div className={styles.moduleText}>
        <span className={styles.moduleAccent}>MODULE:</span> {moduleName}
      </div>
    </motion.div>
  );
}

/* Indicator animado */
function AnimatedIndicator({
  label,
  icon,
  customIcon,
}: {
  label: string;
  icon?: LucideIcon;
  customIcon?: ReactNode;
}) {
  const Icon = icon;
  return (
    <motion.div className={styles.indicator} variants={itemVariants}>
      <div className={styles.indicatorDot} />
      {customIcon ?? (Icon && <Icon className={styles.icon} />)}
      <span className={styles.label}>{label}</span>
    </motion.div>
  );
}

function Separator() {
  return <div className={styles.separator} />;
}
