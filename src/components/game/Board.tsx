import { useEffect, useRef } from 'react';
import { useViewModel } from '../../hooks/useViewModel';
import { useUIStore } from '../../store/useUIStore';
import { Cell } from './Cell';
import { GhostOverlay } from './GhostOverlay';
import { ReprogramOverlay } from './ReprogramOverlay';
import { TargetingInteractionLayer } from './TargetingInteractionLayer';
import { VFXOverlayLayer } from './VFXOverlayLayer';
import { Biohazard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Board = () => {
  const { grid } = useViewModel();
  const gridRef = useRef<HTMLDivElement>(null);

  const virusCount = grid?.flat().filter(c => c?.hasVirus).length ?? 0;

  useEffect(() => {
    if (!gridRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const gridEl = gridRef.current;
      if (!entry || !gridEl) return;

      // Use contentRect.width for sub-pixel accuracy (floating-point)
      const containerWidth = entry.contentRect.width;

      // Dynamically read CSS grid gap
      const style = window.getComputedStyle(gridEl);
      const gapStr = style.gap;
      const gapSize = parseFloat(gapStr) || 4;

      // Calculate precise, floating-point cellSize: (containerWidth - (5 * gapSize)) / 6
      // Assuming a 6-column grid as per grid-cols-6 class
      const cellSize = (containerWidth - (5 * gapSize)) / 6;

      // Dynamically compute nodeRadius -> ~8% of the cell size for proportionate HUD nodes.
      const nodeRadius = Math.max(cellSize * 0.08, 1);

      // Dispatch to store using getState() to avoid potential hook-driven re-renders within observer
      useUIStore.getState().setSpatialMetrics({ cellSize, gapSize, nodeRadius });
    });

    observer.observe(gridRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl relative backdrop-blur-sm w-full h-full flex flex-col items-center justify-center p-2"
    >
      <div
        ref={gridRef}
        className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full relative z-10 pointer-events-none"
      >
        {grid.map((row) => (
          row.map((cell) => {
            return (
              <Cell
                key={cell.id}
                cell={cell}
                isAffected={false}
                isValidCut={false}
                onClick={() => { }}
                onMouseEnter={() => { }}
              />
            );
          })
        ))}
      </div>

      <GhostOverlay />
      <ReprogramOverlay />
      <VFXOverlayLayer />
      <TargetingInteractionLayer />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Virus Tracker */}
      <AnimatePresence>
        {virusCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute -right-20 top-4 flex flex-col items-center gap-2 bg-slate-900/90 border border-red-500/50 p-3 rounded-lg backdrop-blur-md shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Biohazard className="w-8 h-8 text-red-500 drop-shadow-[0_0_8px_#ef4444]" />
            </motion.div>
            <div className="flex flex-col items-center">
              <span className="text-red-500 font-mono text-2xl font-black leading-none">{virusCount}</span>
              <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-tighter">Viruses</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

