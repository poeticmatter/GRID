import { useState } from 'react';
import { useGridStore } from '../../store/useGridStore';
import { useDeckStore } from '../../store/useDeckStore';
import { useUIStore } from '../../store/useUIStore';
import { Dispatch } from '../../engine/orchestrator';
import { checkPatternFit, getAffectedCells, rotatePattern } from '../../engine/grid-logic';
import type { Coordinate } from '../../engine/types';

export const GhostOverlay = () => {
    const { grid } = useGridStore();
    const { hand } = useDeckStore();
    const { selectedCardId, rotation } = useUIStore();
    const [hoveredCell, setHoveredCell] = useState<Coordinate | null>(null);

    if (!selectedCardId) return null;

    const card = hand.find(c => c.id === selectedCardId);
    if (!card || card.action === 'RESET') return null;

    const rotatedPattern = rotatePattern(card.pattern, rotation);
    let affected: { x: number, y: number }[] = [];
    let valid = false;

    if (hoveredCell) {
        valid = checkPatternFit(grid, rotatedPattern, hoveredCell.x, hoveredCell.y);
        affected = getAffectedCells(grid, rotatedPattern, hoveredCell.x, hoveredCell.y);
    }

    const handleClick = (x: number, y: number) => {
        Dispatch({ type: 'PLAY_CARD', payload: { cardId: selectedCardId, x, y } });
        setHoveredCell(null);
    };

    return (
        <div
            className="absolute inset-2 grid grid-cols-6 gap-1 z-20 pointer-events-auto"
            onMouseLeave={() => setHoveredCell(null)}
        >
            {grid.map((row, y) => (
                row.map((_, x) => {
                    const isAffected = affected.some(c => c.x === x && c.y === y);
                    return (
                        <div
                            key={`overlay-${x}-${y}`}
                            className="w-12 h-12 relative cursor-pointer"
                            onMouseEnter={() => setHoveredCell({ x, y })}
                            onClick={() => handleClick(x, y)}
                        >
                            {isAffected && (
                                <div className={`absolute inset-0 transition-opacity duration-150 rounded-sm mix-blend-overlay ${valid ? 'bg-green-400/50' : 'bg-red-500/60'}`} />
                            )}
                        </div>
                    );
                })
            ))}
        </div>
    );
};
