import { useGameStore } from '../../store/useGameStore';
import { Cell } from './Cell';
import { GhostOverlay } from './GhostOverlay';

export const Board = () => {
  const { grid } = useGameStore();

  return (
    <div
      className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl relative backdrop-blur-sm"
    >
      <div className="grid grid-cols-6 gap-1 relative z-10 pointer-events-none">
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

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
    </div>
  );
};
