import { useServerStore } from '../../store/useServerStore';
import type { NetworkNode, CellColor, CellSymbol } from '../../engine/types';
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

const ServerCard = ({ server }: { server: NetworkNode }) => {
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
        <span className="text-[10px] bg-slate-900 px-1 rounded text-white/50">{server.type} L{server.difficulty}</span>
      </div>

      {/* Layers */}
      <div className="flex flex-col gap-2 mt-2 mb-2">
        {Object.entries(server.layers || {}).map(([colorStr, layerSlots]) => {
          const color = colorStr as CellColor;
          if (!layerSlots || layerSlots.length === 0) return null;

          const progressLane = server.progress[color] || [];

          return (
            <div key={color} className="flex gap-1 flex-wrap">
              {layerSlots.map((slot, idx) => {
                const isCleared = progressLane[idx];
                const colorClass = COLOR_TEXT_MAP[color];
                const bgClass = colorClass.replace('text-', 'bg-') + '/20';
                const borderClass = colorClass.replace('text-', 'border-');

                return (
                  <div
                    key={idx}
                    className={clsx(
                      "w-6 h-6 flex items-center justify-center rounded border transition-all duration-300",
                      isCleared ? "bg-slate-900 border-slate-800 opacity-20 grayscale" : `${bgClass} ${borderClass}`
                    )}
                  >
                    {slot.symbol !== 'NONE' && (
                      <div className={clsx("drop-shadow-md", isCleared ? "text-slate-500" : "text-white")}>
                        {SYMBOL_ICON_MAP[slot.symbol]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/5 pt-2">
        {Object.entries(server.countermeasures || {}).map(([symbol, effect]) => {
          if (!effect) return null;
          return (
            <div key={symbol} className="text-[10px] flex items-center gap-1.5 text-white/50">
              <span className="text-white/80">{SYMBOL_ICON_MAP[symbol as CellSymbol]}</span>
              <span className="font-mono">
                {effect.value} {effect.type.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export const ServerRow = () => {
  const { activeServers } = useServerStore();

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
