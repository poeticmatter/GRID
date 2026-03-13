import type { Card as CardType, CellColor, Coordinate, Effect } from '../../engine/types';
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

const BADGE_COLOR_MAP: Record<CellColor, string> = {
  RED: 'border-rose-500 shadow-rose-500/20 bg-rose-950',
  BLUE: 'border-cyan-500 shadow-cyan-500/20 bg-cyan-950',
  GREEN: 'border-emerald-500 shadow-emerald-500/20 bg-emerald-950',
  YELLOW: 'border-amber-500 shadow-amber-500/20 bg-amber-950',
  PURPLE: 'border-fuchsia-500 shadow-fuchsia-500/20 bg-fuchsia-950',
};

// Helper to check if a mini-grid cell is part of pattern
const isPatternCell = (x: number, y: number, pattern: Coordinate[]) => {
  return pattern.some(p => p.x === x && p.y === y);
};

const renderEffect = (effect: Effect, index: number, rotation: number) => {
  switch (effect.type) {
    case 'SYSTEM_RESET':
      return (
        <div key={index} className="text-rose-500 flex flex-col items-center flex-shrink-0">
          <div className="w-8 h-8 border-2 border-rose-500 rounded-full flex items-center justify-center mb-1 animate-pulse text-sm">
            !
          </div>
          <div className="text-[10px] font-bold">SYSTEM RESET</div>
        </div>
      );
    case 'RUN':
      return (
        <motion.div
          key={index}
          className="grid grid-cols-5 gap-0.5 p-1 bg-black/30 rounded flex-shrink-0"
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {Array.from({ length: 25 }).map((_, i) => {
            const x = (i % 5) - 2; // -2 to 2
            const y = Math.floor(i / 5) - 2; // -2 to 2
            const active = isPatternCell(x, y, effect.pattern);

            return (
              <div
                key={i}
                className={clsx(
                  'w-2 h-2 rounded-[1px]',
                  active ? 'bg-white shadow-[0_0_3px_rgba(255,255,255,0.8)]' : 'bg-white/5'
                )}
              />
            );
          })}
        </motion.div>
      );
    case 'REPROGRAM':
      return (
        <div key={index} className="flex flex-col items-center text-cyan-400 mt-1 flex-shrink-0 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded">
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[10px] font-bold">+{effect.amount} REPROG</span>
          </div>
        </div>
      );
    case 'END_TURN':
      return (
        <div key={index} className="text-[9px] text-gray-400 mt-1 text-center">
          END TURN
        </div>
      );
    default:
      return null;
  }
};

export const Card = ({ card, isSelected, onClick, rotation = 0 }: CardProps) => {
  const { name, visualColor, effects, memory } = card;

  return (
    <motion.div
      layoutId={`card-${card.id}`}
      className={clsx(
        'h-[clamp(140px,22vh,192px)] aspect-[2/3] border-2 rounded-lg p-2 flex flex-col relative cursor-pointer transition-all duration-300 backdrop-blur-md',
        COLOR_MAP[visualColor],
        isSelected ? 'border-white shadow-xl scale-110 z-30' : 'opacity-90 hover:opacity-100 hover:scale-[1.15] hover:z-20 hover:-translate-y-4'
      )}
      onClick={onClick}
      animate={{
        y: isSelected ? -30 : 0
      }}
    >
      {/* Memory Badge */}
      <div
        className={clsx(
          "absolute -top-2 -left-2 w-[clamp(1.5rem,3vh,2rem)] h-[clamp(1.5rem,3vh,2rem)] border-2 rounded-full flex items-center justify-center text-[clamp(0.6rem,1.2vh,0.875rem)] font-bold text-white shadow-lg z-10",
          BADGE_COLOR_MAP[visualColor]
        )}
        title="Memory Cost"
      >
        {memory}
      </div>

      <div className="text-[clamp(0.6rem,1.2vh,0.75rem)] font-bold uppercase tracking-wider text-center mb-1 border-b border-white/20 pb-1 truncate leading-tight">
        {name}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-2 overflow-hidden py-1">
        {effects.map((effect, idx) => renderEffect(effect, idx, rotation))}
      </div>

      <div className="mt-1 text-[10px] text-white/50 text-center font-mono">
        EXECUTE
      </div>
    </motion.div>
  );
};
