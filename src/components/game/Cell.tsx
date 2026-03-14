import type { Cell as CellType, CellColor, CellSymbol } from '../../engine/types';
import { Shield, Eye, Skull } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

interface CellProps {
  cell: CellType;
  isAffected: boolean;
  isValidCut: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const COLOR_MAP: Record<CellColor, string> = {
  ORANGE: 'bg-emerald-950 border-orange-500 text-orange-400',
  SKY: 'bg-emerald-950 border-sky-400 text-sky-400',
  EMERALD: 'bg-emerald-950 border-emerald-500 text-emerald-400',
  LIME: 'bg-emerald-950 border-lime-400 text-lime-400',
  FUCHSIA: 'bg-emerald-950 border-fuchsia-500 text-fuchsia-400',
};

const SYMBOL_MAP: Record<CellSymbol, React.ReactNode> = {
  SHIELD: <Shield className="w-5 h-5 text-current drop-shadow-md" />,
  EYE: <Eye className="w-5 h-5 text-current drop-shadow-md" />,
  SKULL: <Skull className="w-5 h-5 text-current drop-shadow-md" />,
  NONE: null,
};

export const Cell = ({ cell, isAffected, isValidCut, onClick, onMouseEnter }: CellProps) => {
  const { color, symbol, state, x, y } = cell;

  if (state === 'BROKEN') {
    return (
      <div
        className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-sm"
        data-x={x}
        data-y={y}
      />
    );
  }

  const baseClasses = clsx(
    'w-full h-full flex items-center justify-center rounded-sm border-2 transition-all duration-100',
    COLOR_MAP[color],
    'relative overflow-hidden cursor-pointer'
  );

  // Ghost Overlay Logic
  const overlayClasses = clsx(
    'absolute inset-0 transition-opacity duration-150',
    isAffected ? (isValidCut ? 'bg-green-400/50 mix-blend-overlay' : 'bg-red-500/60 mix-blend-overlay') : 'opacity-0'
  );

  return (
    <motion.div
      layoutId={cell.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={twMerge(baseClasses, isAffected && 'scale-105 z-10 shadow-lg')}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      data-x={x}
      data-y={y}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

      {/* Symbol */}
      <div className="relative z-10">
        {SYMBOL_MAP[symbol]}
      </div>

      {/* Ghost Overlay */}
      <div className={overlayClasses} />
    </motion.div>
  );
};
