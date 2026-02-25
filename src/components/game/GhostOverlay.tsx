import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { checkPatternFit, getAffectedCells, rotatePattern } from '../../engine/grid-logic';
import { Coordinate } from '../../engine/types';
import { playSfx } from '../../engine/audio';

export const GhostOverlay = () => {
    const { grid, hand, selectedCardId, rotation, playCard } = useGameStore();
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
        if (valid) {
            playCard(selectedCardId, x, y);
            setHoveredCell(null); // Optional: clear hover state on play
        } else {
            playSfx('error');
        }
    };

    return (
        <div
            className="absolute inset-2 grid grid-cols-6 gap-1 z-20 pointer-events-auto"
            onMouseLeave={() => setHoveredCell(null)}
        >
            {grid.map((row, y) => (
                row.map((cell, x) => {
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
