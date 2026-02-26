import { useGridStore } from '../../store/useGridStore';
import { useGameStore } from '../../store/useGameStore';
import type { EffectReprogram } from '../../engine/types';

export const ReprogramOverlay = () => {
    const { grid } = useGridStore();
    const { gameState, effectQueue, reprogramTargetSource, setReprogramSource, executeReprogram } = useGameStore();

    const activeEffect = effectQueue[0]?.effect;

    if (gameState !== 'EFFECT_RESOLUTION' || !activeEffect || activeEffect.type !== 'REPROGRAM') return null;

    const reprogramEffect = activeEffect as EffectReprogram;

    const handleClick = (x: number, y: number) => {
        if (!reprogramTargetSource) {
            const cell = grid[y][x];
            if (cell.state !== 'BROKEN') {
                setReprogramSource({ x, y });
            }
        } else {
            executeReprogram({ x, y });
        }
    };

    return (
        <div className="absolute inset-2 grid grid-cols-6 gap-1 z-30 pointer-events-auto">
            {grid.map((row, y) => (
                row.map((cell, x) => {
                    const isSource = reprogramTargetSource?.x === x && reprogramTargetSource?.y === y;
                    return (
                        <div
                            key={`reprog-${x}-${y}`}
                            className="w-12 h-12 relative cursor-pointer"
                            onClick={() => handleClick(x, y)}
                        >
                            {isSource && (
                                <div className="absolute inset-0 border-4 border-yellow-400/80 animate-pulse rounded-sm" />
                            )}
                            {!isSource && !reprogramTargetSource && cell.state !== 'BROKEN' && (
                                <div className="absolute inset-0 bg-yellow-400/20 hover:bg-yellow-400/40 rounded-sm transition-colors" />
                            )}
                            {reprogramTargetSource && !isSource && (
                                <div className="absolute inset-0 bg-blue-400/20 hover:bg-blue-400/50 rounded-sm transition-colors" />
                            )}
                        </div>
                    );
                })
            ))}

            <div className="absolute -top-16 left-0 right-0 text-center pointer-events-none text-yellow-400 font-bold bg-black/80 border border-yellow-400/50 p-2 rounded shadow-lg backdrop-blur text-sm">
                REPROGRAM ({reprogramEffect.amount} LEFT): {reprogramTargetSource ? 'SELECT DESTINATION' : 'SELECT TARGET TOKEN'}
            </div>
        </div>
    );
};
