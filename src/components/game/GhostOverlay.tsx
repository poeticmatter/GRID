import { useState } from 'react';
import { useGridStore } from '../../store/useGridStore';
import { useGameStore } from '../../store/useGameStore';
import { useUIStore } from '../../store/useUIStore';
import { checkPatternFit, getAffectedCells, rotatePattern } from '../../engine/grid-logic';
import type { Coordinate, EffectCut } from '../../engine/types';
import { Dispatch } from '../../engine/orchestrator';

export const GhostOverlay = () => {
    const { grid } = useGridStore();
    const { gameState, effectQueue } = useGameStore();
    const { rotation } = useUIStore();
    const [hoveredCell, setHoveredCell] = useState<Coordinate | null>(null);

    const activeEffect = effectQueue[0]?.effect;

    if (gameState !== 'EFFECT_RESOLUTION' || !activeEffect || activeEffect.type !== 'CUT') return null;

    const cutEffect = activeEffect as EffectCut;
    const rotatedPattern = rotatePattern(cutEffect.pattern, rotation);
    let affected: { x: number, y: number }[] = [];
    let valid = false;

    if (hoveredCell) {
        valid = checkPatternFit(grid, rotatedPattern, hoveredCell.x, hoveredCell.y);
        affected = getAffectedCells(grid, rotatedPattern, hoveredCell.x, hoveredCell.y);
    }

    const handleClick = (x: number, y: number) => {
        Dispatch({ type: 'RESOLVE_CUT', payload: { x, y, pattern: rotatedPattern } });
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
