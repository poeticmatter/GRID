import type { Card as CardType, Coordinate, Effect } from '../../engine/types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

interface CardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  rotation?: number;
}



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
                  active ? 'bg-phosphor shadow-[0_0_4px_rgba(57,255,122,0.9)]' : 'bg-phosphor/5'
                )}
              />
            );
          })}
        </motion.div>
      );
    case 'REPROGRAM':
      return (
        <div key={index} className="flex flex-col items-center text-phosphor mt-1 flex-shrink-0 bg-phosphor/5 border border-phosphor/30 px-2 py-0.5 rounded">
          <div className="flex items-center space-x-1">
            <span style={{
              display: 'inline-block', width: 24, height: 24,
              backgroundColor: 'currentColor',
              maskImage: 'url(/icons/symbols/program-exe.svg)',
              maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center',
              WebkitMaskImage: 'url(/icons/symbols/program-exe.svg)',
              WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
            }} />
            <span className="text-[10px] font-bold">+{effect.amount} REPROG</span>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const Card = ({ card, isSelected, onClick, rotation = 0 }: CardProps) => {
  const { name, effects, memory } = card;

  return (
    <motion.div
      layoutId={`card-${card.id}`}
      className={clsx(
        'h-[clamp(140px,22vh,192px)] aspect-[2/3] relative cursor-pointer transition-all duration-300',
        isSelected ? 'scale-110 z-30' : 'opacity-90 hover:opacity-100 hover:scale-[1.15] hover:z-20 hover:-translate-y-4'
      )}
      onClick={onClick}
      animate={{ y: isSelected ? -30 : 0 }}
    >
      {/* Card body — owns the border, rounded corners and overflow clip */}
      <div className={clsx(
        'w-full h-full border-2 rounded-lg flex flex-col backdrop-blur-md overflow-hidden bg-grid-bg',
        isSelected ? 'border-phosphor shadow-[0_0_20px_rgba(57,255,122,0.5)]' : 'border-phosphor/40'
      )}>
        <div className="text-[clamp(0.6rem,1.2vh,0.75rem)] font-bold uppercase tracking-wider text-center p-1 truncate leading-tight bg-grid-bg border-b-2 border-phosphor text-phosphor">
          {name}
        </div>

        {/* Memory chips — stacked row under the title */}
        <div className="flex flex-row items-center px-1.5 pt-1 pb-0">
          {Array.from({ length: memory }).map((_, i) => (
            <Cpu
              key={i}
              className="w-[clamp(0.6rem,1.2vh,0.8rem)] h-[clamp(0.6rem,1.2vh,0.8rem)] text-phosphor/70"
              style={{ marginLeft: i === 0 ? 0 : '-0.2em' }}
            />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-2 overflow-hidden py-1 px-2">
          {effects.map((effect, idx) => renderEffect(effect, idx, rotation))}
        </div>

        <div className="mt-1 pb-2 text-[10px] font-mono text-phosphor/50 text-center animate-pulse">
          EXECUTE
        </div>
      </div>
    </motion.div>
  );
};
