import { useEffect, useRef } from 'react';
import { useViewModel } from '../../hooks/useViewModel';
import { useUIStore } from '../../store/useUIStore';
import { Cell } from './Cell';
import { GhostOverlay } from './GhostOverlay';
import { ReprogramOverlay } from './ReprogramOverlay';
import { TargetingInteractionLayer } from './TargetingInteractionLayer';

export const Board = () => {
  const { grid } = useViewModel();
  const gridRef = useRef<HTMLDivElement>(null);

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
      <TargetingInteractionLayer />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
    </div>
  );
};

