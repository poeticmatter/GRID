import { useState, useEffect, useRef } from 'react';
import type { Cell as CellType } from '../../engine/types';
import { LAYER_THEME } from '../../presentation/theme';
import { SymbolIcon } from './CellSymbols';
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


export const Cell = ({ cell, isAffected, isValidCut, onClick, onMouseEnter }: CellProps) => {
  const { color, symbol, state, x, y, hasVirus } = cell;

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
        className="w-full h-full bg-grid-bg/60 border border-grid-border rounded-sm"
        data-x={x}
        data-y={y}
      />
    );
  }

  if (state === 'CORRUPTED') {
    return (
      <div
        className="w-full h-full bg-black border border-green-900 rounded-sm relative overflow-hidden"
        data-x={x}
        data-y={y}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-conic-gradient(#00ff41 0% 25%, #001a00 0% 50%)',
            backgroundSize: '2px 2px',
            opacity: 0.85,
            animation: 'corrupt-noise 0.12s infinite steps(4)'
          }}
        />
        <style>{`
          @keyframes corrupt-noise {
            0%   { transform: translate(0, 0); }
            25%  { transform: translate(-1px, 1px); }
            50%  { transform: translate(1px, -1px); }
            75%  { transform: translate(-1px, -1px); }
            100% { transform: translate(1px, 0); }
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

      {/* Symbol */}
      <div className="relative z-10">
        <SymbolIcon symbol={symbol} />
      </div>

      {/* Ghost Overlay */}
      <div className={overlayClasses} />

      {/* Virus indicator */}
      {hasVirus && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute inset-0 border-2 border-rose-500/80 rounded-sm animate-pulse" />
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_4px_rgba(244,63,94,0.9)]" />
        </div>
      )}
    </motion.div>
  );
};
