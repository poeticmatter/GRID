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
  RED: 'bg-rose-600 border-rose-400',
  BLUE: 'bg-cyan-600 border-cyan-400',
  GREEN: 'bg-emerald-600 border-emerald-400',
  YELLOW: 'bg-amber-500 border-amber-300',
  PURPLE: 'bg-fuchsia-600 border-fuchsia-400',
};

const SYMBOL_MAP: Record<CellSymbol, React.ReactNode> = {
  SHIELD: <Shield className="w-5 h-5 text-white/90 drop-shadow-md" />,
  EYE: <Eye className="w-5 h-5 text-white/90 drop-shadow-md" />,
  SKULL: <Skull className="w-5 h-5 text-white/90 drop-shadow-md" />,
  NONE: null,
};

export const Cell = ({ cell, isAffected, isValidCut, onClick, onMouseEnter }: CellProps) => {
  const { color, symbol, state, x, y } = cell;

  if (state === 'BROKEN') {
    return (
      <div
        className="w-12 h-12 bg-slate-900/50 border border-slate-800 rounded-sm"
        data-x={x}
        data-y={y}
      />
    );
  }

  const baseClasses = clsx(
    'w-12 h-12 flex items-center justify-center rounded-sm border-2 transition-all duration-100',
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
