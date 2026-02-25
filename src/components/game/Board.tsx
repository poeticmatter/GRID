import { useGameStore } from '../../store/useGameStore';
import { Cell } from './Cell';
import { playSfx } from '../../engine/audio';

export const Board = () => {
  const { grid, affectedCells, validCut, playCard, setHover, selectedCardId } = useGameStore();

  const handleCellClick = (x: number, y: number) => {
    if (selectedCardId) {
        if (validCut) {
            playCard(selectedCardId, x, y);
        } else {
            playSfx('error');
        }
    }
  };

  const handleCellHover = (x: number, y: number) => {
    if (selectedCardId) {
      setHover(selectedCardId, x, y);
    }
  };

  return (
    <div
      className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl relative backdrop-blur-sm"
      onMouseLeave={() => setHover(selectedCardId, null, null)}
    >
      <div className="grid grid-cols-6 gap-1 relative z-10">
        {grid.map((row, y) => (
          row.map((cell, x) => {
             const isAffected = affectedCells.some(c => c.x === x && c.y === y);
             return (
               <Cell
                 key={cell.id}
                 cell={cell}
                 isAffected={isAffected}
                 isValidCut={validCut}
                 onClick={() => handleCellClick(x, y)}
                 onMouseEnter={() => handleCellHover(x, y)}
               />
             );
          })
        ))}
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
    </div>
  );
};
