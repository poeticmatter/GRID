import { useGameStore } from '../../store/useGameStore';
import type { ServerNode, CellColor, CellSymbol } from '../../engine/types';
import { Shield, Eye, Skull } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const COLOR_TEXT_MAP: Record<CellColor, string> = {
  RED: 'text-rose-400',
  BLUE: 'text-cyan-400',
  GREEN: 'text-emerald-400',
  YELLOW: 'text-amber-400',
  PURPLE: 'text-fuchsia-400',
};

const SYMBOL_ICON_MAP: Record<CellSymbol, React.ReactNode> = {
  SHIELD: <Shield className="w-3 h-3 inline" />,
  EYE: <Eye className="w-3 h-3 inline" />,
  SKULL: <Skull className="w-3 h-3 inline" />,
  NONE: null,
};

const ServerCard = ({ server }: { server: ServerNode }) => {
  return (
    <motion.div
      layoutId={`server-${server.id}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      className="w-48 bg-slate-800/80 border border-slate-600 rounded p-2 flex flex-col gap-2 backdrop-blur-sm shadow-lg"
    >
      <div className="flex justify-between items-center border-b border-white/10 pb-1">
        <span className="text-xs font-mono font-bold text-white/80 truncate w-32">{server.name}</span>
        <span className="text-[10px] bg-slate-900 px-1 rounded text-white/50">Lvl {server.difficulty}</span>
      </div>

      {/* Requirements */}
      <div className="flex flex-col gap-1">
        {/* Colors */}
        {Object.entries(server.requirements.colors).map(([color, req]) => {
          if (!req) return null;
          const progress = server.progress.colors[color as CellColor] || 0;
          const percent = Math.min(100, (progress / req) * 100);

          return (
            <div key={color} className="text-xs">
              <div className="flex justify-between mb-0.5">
                <span className={clsx('font-bold', COLOR_TEXT_MAP[color as CellColor])}>{color}</span>
                <span className="text-white/60">{progress}/{req}</span>
              </div>
              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full transition-all duration-300', COLOR_TEXT_MAP[color as CellColor].replace('text-', 'bg-'))}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Countermeasures */}
        {Object.entries(server.requirements.symbols || {}).map(([symbol, req]) => {
          if (!req) return null;
          return (
            <div key={symbol} className="text-[10px] text-red-400 flex items-center gap-1 mt-1 border-t border-white/5 pt-1">
              <span>TRAP:</span>
              {SYMBOL_ICON_MAP[symbol as CellSymbol]}
              <span>x{req} REQUIRED</span>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-white/40 italic text-center mt-auto">
        Penalty: {server.penaltyType} ({server.penaltyValue})
      </div>
    </motion.div>
  );
};

export const ServerRow = () => {
  const { activeServers } = useGameStore();

  return (
    <div className="flex gap-4 p-4 items-start justify-center overflow-visible min-h-[140px]">
      <AnimatePresence mode="popLayout">
        {activeServers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </AnimatePresence>

      {activeServers.length === 0 && (
        <div className="text-white/30 text-sm font-mono animate-pulse">
          SCANNING FOR TARGETS...
        </div>
      )}
    </div>
  );
};
