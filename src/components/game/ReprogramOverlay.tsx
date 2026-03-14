import { useViewModel } from '../../hooks/useViewModel';
import { useGameStore } from '../../store/useGameStore';
import { useTargetingStore } from '../../store/useTargetingStore';
import type { EffectReprogram } from '../../engine/types';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
                    const dx = reprogramTargetSource ? x - reprogramTargetSource.x : 0;
                    const dy = reprogramTargetSource ? y - reprogramTargetSource.y : 0;
                    const isAdjacent = (Math.abs(dx) === 1 && dy === 0) || (dx === 0 && Math.abs(dy) === 1);

                    const getArrow = () => {
                        if (!isAdjacent || !reprogramTargetSource) return null;
                        
                        const props = { className: "w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" };
                        
                        if (dx === 1) return (
                            <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <ChevronRight {...props} />
                            </motion.div>
                        );
                        if (dx === -1) return (
                            <motion.div animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <ChevronLeft {...props} />
                            </motion.div>
                        );
                        if (dy === 1) return (
                            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <ChevronDown {...props} />
                            </motion.div>
                        );
                        if (dy === -1) return (
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
                                <ChevronUp {...props} />
                            </motion.div>
                        );
                        return null;
                    };

                    return (
                        <div
                            key={`reprog-visual-${x}-${y}`}
                            className="w-full h-full relative flex items-center justify-center"
                        >
                            {isSource && (
                                <div className="absolute inset-0 border-4 border-cyan-400/80 animate-pulse rounded-sm shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
                            )}

                            {reprogramTargetSource && !isSource && isAdjacent && (
                                <>
                                    <div className={`absolute inset-0 rounded-sm transition-colors ${isHovered ? 'bg-cyan-400/40' : 'bg-cyan-400/10'}`} />
                                    <div className="relative z-10">
                                        {getArrow()}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })
            ))}

            <div className="absolute -top-16 left-0 right-0 text-center pointer-events-none text-cyan-400 font-bold bg-black/80 border border-cyan-400/50 p-2 rounded shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur text-sm tracking-widest">
                REPROGRAM ({reprogramEffect.amount} LEFT): {reprogramTargetSource ? 'SELECT SWAP DESTINATION' : 'SELECT SOURCE TOKEN'}
            </div>
        </div>
    );
};

