import type { Card as CardType, CellColor, Coordinate } from '../../engine/types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  rotation?: number;
}

const COLOR_MAP: Record<CellColor, string> = {
  RED: 'border-rose-500 shadow-rose-500/20 bg-rose-950/40',
  BLUE: 'border-cyan-500 shadow-cyan-500/20 bg-cyan-950/40',
  GREEN: 'border-emerald-500 shadow-emerald-500/20 bg-emerald-950/40',
  YELLOW: 'border-amber-500 shadow-amber-500/20 bg-amber-950/40',
  PURPLE: 'border-fuchsia-500 shadow-fuchsia-500/20 bg-fuchsia-950/40',
};

// Helper to check if a mini-grid cell is part of pattern
const isPatternCell = (x: number, y: number, pattern: Coordinate[]) => {
  return pattern.some(p => p.x === x && p.y === y);
};

export const Card = ({ card, isSelected, onClick, rotation = 0 }: CardProps) => {
  const { name, visualColor, pattern } = card;

  return (
    <motion.div
      layoutId={`card-${card.id}`}
      className={clsx(
        'w-32 h-48 border-2 rounded-lg p-2 flex flex-col relative cursor-pointer transition-colors backdrop-blur-md',
        COLOR_MAP[visualColor],
        isSelected ? 'border-white shadow-xl scale-105 z-20' : 'opacity-90 hover:opacity-100 hover:scale-105'
      )}
      onClick={onClick}
      whileHover={{ y: -5 }}
      animate={{
        y: isSelected ? -20 : 0,
        scale: isSelected ? 1.1 : 1
      }}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-center mb-2 border-b border-white/20 pb-1 truncate">
        {name}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {card.action === 'RESET' ? (
          <div className="text-rose-500 flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-rose-500 rounded-full flex items-center justify-center mb-2 animate-pulse">
              !
            </div>
            <div className="text-xs font-bold">SYSTEM RESET</div>
          </div>
        ) : (
          {/* Mini Grid Visualization (5x5) */ }
          < motion.div 
          className="grid grid-cols-5 gap-0.5 p-1 bg-black/30 rounded"
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
        {Array.from({ length: 25 }).map((_, i) => {
          const x = (i % 5) - 2; // -2 to 2
          const y = Math.floor(i / 5) - 2; // -2 to 2
          const active = isPatternCell(x, y, pattern);

          return (
            <div
              key={i}
              className={clsx(
                'w-2.5 h-2.5 rounded-[1px]',
                active ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-white/5'
              )}
            />
          );
        })}
    </motion.div>
  )
}
      </div >

  <div className="mt-2 text-[10px] text-white/50 text-center font-mono">
    EXECUTE
  </div>
    </motion.div >
  );
};
