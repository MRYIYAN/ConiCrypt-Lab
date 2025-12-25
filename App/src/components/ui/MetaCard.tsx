import { motion } from 'framer-motion';

interface MetaCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: 'green' | 'blue' | 'purple' | 'white';
}


const accentMap: Record<NonNullable<MetaCardProps['accent']>, string> = {
  green: 'text-[#4DFF8F]',
  blue: 'text-[#3B4BFF]',
  purple: 'text-[#7B2CFF]',
  white: 'text-white',
};

export function MetaCard({
  label,
  value,
  hint,
  accent = 'white',
}: MetaCardProps) {
  return (
    <motion.div
      layout="position"
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="
        bg-[#000000]/40
        border border-[#3B4BFF]/20
        rounded-lg p-4
        hover:border-[#3B4BFF]/40
        transition-colors
      "
    >
      {/* Label */}
      <div className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">
        {label}
      </div>

      {/* Value */}
      <div className={`text-xl font-mono mb-1 ${accentMap[accent]}`}>
        {value}
      </div>

      {/* Hint */}
      {hint && (
        <div className="text-xs text-gray-600 font-mono">
          {hint}
        </div>
      )}
    </motion.div>
  );
}
