import { useState, useEffect, useRef } from 'react';
import type { Cell as CellType, CellColor, CellSymbol } from '../../engine/types';
import { LAYER_THEME } from '../../presentation/theme';
import { Shield, Eye, Skull } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { gameEventBus } from '../../engine/eventBus';

interface CellProps {
  cell: CellType;
  isAffected: boolean;
  isValidCut: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const SYMBOL_MAP: Record<CellSymbol, React.ReactNode> = {
  SHIELD: <Shield className="w-5 h-5 text-current drop-shadow-md" />,
  EYE: <Eye className="w-5 h-5 text-current drop-shadow-md" />,
  SKULL: <Skull className="w-5 h-5 text-current drop-shadow-md" />,
  NONE: null,
};

export const Cell = ({ cell, isAffected, isValidCut, onClick, onMouseEnter }: CellProps) => {
  const { color, symbol, state, x, y } = cell;

  const prevData = useRef(`${color}-${symbol}-${state}`);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHiddenVFX, setIsHiddenVFX] = useState(false);

  useEffect(() => {
    const handleReprogramSwap = (payload: any) => {
      const { source, dest } = payload;
      const isPartOfSwap = (source.x === x && source.y === y) || (dest.x === x && dest.y === y);
      
      if (isPartOfSwap) {
        setIsHiddenVFX(true);
        setTimeout(() => setIsHiddenVFX(false), 800);
      }
    };

    gameEventBus.on('VFX_REPROGRAM_SWAP', handleReprogramSwap);
    return () => gameEventBus.off('VFX_REPROGRAM_SWAP', handleReprogramSwap);
  }, [x, y]);

  useEffect(() => {
    const currentData = `${color}-${symbol}-${state}`;
    if (prevData.current !== currentData && state !== 'BROKEN') {
      setIsAnimating(true);
      prevData.current = currentData;
      const t = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(t);
    }
  }, [color, symbol, state]);

  if (state === 'BROKEN') {
    return (
      <div
        className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-sm"
        data-x={x}
        data-y={y}
      />
    );
  }

  if (state === 'CORRUPTED') {
    return (
      <div
        className="w-full h-full bg-slate-950 border border-slate-800 rounded-sm relative overflow-hidden flex items-center justify-center transition-all duration-300 animate-pulse"
        data-x={x}
        data-y={y}
      >
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen" 
          style={{ 
            backgroundImage: 'repeating-conic-gradient(#000 0% 25%, #222 0% 50%)', 
            backgroundSize: '2px 2px',
            animation: 'noise-move 0.2s infinite steps(2)'
          }} 
        />
        <style>{`
          @keyframes noise-move {
            0% { transform: translate(0, 0); }
            50% { transform: translate(1px, 1px); }
            100% { transform: translate(-1px, 0); }
          }
        `}</style>
      </div>
    );
  }

  const baseClasses = clsx(
    'w-full h-full flex items-center justify-center rounded-sm border-2 transition-all duration-100',
    LAYER_THEME[color].surface,
    LAYER_THEME[color].border,
    LAYER_THEME[color].text,
    'relative overflow-hidden cursor-pointer'
  );

  // Ghost Overlay Logic
  const overlayClasses = clsx(
    'absolute inset-0 transition-opacity duration-150',
    isAffected ? (isValidCut ? 'bg-green-400/50 mix-blend-overlay' : 'bg-red-500/60 mix-blend-overlay') : 'opacity-0'
  );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isAnimating ? [1, 1.15, 1] : 1,
        opacity: isHiddenVFX ? 0 : (isAnimating ? [0.5, 1, 0.8, 1] : 1),
        filter: isAnimating ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] : 'brightness(1)'
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={twMerge(baseClasses, isAffected && 'scale-105 z-10 shadow-lg')}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      data-x={x}
      data-y={y}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

      {/* Virus Indicator */}
      {cell.hasVirus && (
        <div className="absolute top-0.5 right-0.5 z-20">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
          </motion.div>
        </div>
      )}

      {/* Symbol */}
      <div className="relative z-10">
        {SYMBOL_MAP[symbol]}
      </div>

      {/* Ghost Overlay */}
      <div className={overlayClasses} />
    </motion.div>
  );
};
