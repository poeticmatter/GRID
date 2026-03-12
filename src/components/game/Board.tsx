import { useEffect, useRef } from 'react';
import { useGridStore } from '../../store/useGridStore';
import { useUIStore } from '../../store/useUIStore';
import { Cell } from './Cell';
import { GhostOverlay } from './GhostOverlay';
import { ReprogramOverlay } from './ReprogramOverlay';
import { TargetingInteractionLayer } from './TargetingInteractionLayer';

export const Board = () => {
  const { grid } = useGridStore();
  const setSpatialMetrics = useUIStore(state => state.setSpatialMetrics);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    let timeoutId: number | null = null;

    const observer = new ResizeObserver(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        const gridEl = gridRef.current;
        if (!gridEl || !gridEl.firstChild) return;

        const firstCell = gridEl.firstChild as HTMLElement;
        // Use offsetWidth for unscaled DOM layout values
        const cellSize = firstCell.offsetWidth || 48;

        let gapSize = 4; // Default gap
        if (gridEl.children.length > 1) {
          const secondCell = gridEl.children[1] as HTMLElement;
          // Calculate grid gap from distance between first and second children
          const gap = secondCell.offsetLeft - (firstCell.offsetLeft + firstCell.offsetWidth);
          if (gap > 0) {
            gapSize = gap;
          }
        }

        // Dynamically compute nodeRadius -> ~8% of the cell size for proportionate HUD nodes.
        const nodeRadius = Math.max(cellSize * 0.08, 1);

        setSpatialMetrics({ cellSize, gapSize, nodeRadius });
      }, 150);
    });

    observer.observe(gridRef.current);

    // Also observe the first cell whenever grid renders just in case
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [setSpatialMetrics]);

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

