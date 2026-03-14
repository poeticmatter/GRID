import { useViewModel } from '../../hooks/useViewModel';
import { useGameStore } from '../../store/useGameStore';
import { useTargetingStore } from '../../store/useTargetingStore';
import type { EffectReprogram } from '../../engine/types';

export const ReprogramOverlay = () => {
    const { grid } = useViewModel();
    const { gameState, effectQueue, reprogramTargetSource } = useGameStore();
    const hoveredCoordinate = useTargetingStore(state => state.hoveredCoordinate);

    const activeEffect = effectQueue[0]?.effect;

    if (gameState !== 'EFFECT_RESOLUTION' || !activeEffect || activeEffect.type !== 'REPROGRAM') return null;

    const reprogramEffect = activeEffect as EffectReprogram;

    return (
        <div className="absolute inset-2 w-full h-full grid grid-cols-6 grid-rows-6 gap-1 z-30 pointer-events-none">
            {grid.map((row, y) => (
                row.map((cell, x) => {
                    const isSource = reprogramTargetSource?.x === x && reprogramTargetSource?.y === y;
                    const isHovered = hoveredCoordinate?.x === x && hoveredCoordinate?.y === y;
                    const dx = reprogramTargetSource ? Math.abs(x - reprogramTargetSource.x) : 0;
                    const dy = reprogramTargetSource ? Math.abs(y - reprogramTargetSource.y) : 0;
                    const isAdjacent = dx + dy === 1;

                    return (
                        <div
                            key={`reprog-visual-${x}-${y}`}
                            className="w-full h-full relative"
                        >
                            {isSource && (
                                <div className="absolute inset-0 border-4 border-yellow-400/80 animate-pulse rounded-sm" />
                            )}

                            {!isSource && !reprogramTargetSource && cell.state !== 'BROKEN' && (
                                <div className={`absolute inset-0 rounded-sm transition-colors ${isHovered ? 'bg-yellow-400/40' : 'bg-yellow-400/20'}`} />
                            )}

                            {reprogramTargetSource && !isSource && isAdjacent && (
                                <div className={`absolute inset-0 rounded-sm transition-colors ${isHovered ? 'bg-blue-400/50' : 'bg-blue-400/20'}`} />
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

