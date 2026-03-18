import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useGameStore } from '../../store/useGameStore';
import { useActiveGlobalCountermeasures } from '../../store/selectors';
import { SvgMaskIcon } from './CellSymbols';
import { twMerge } from 'tailwind-merge';
import { gameEventBus } from '../../engine/eventBus';

export const TraceBar: React.FC = () => {
    const { trace, maxTrace } = usePlayerStore((state) => state.playerStats);
    const [isFlashing, setIsFlashing] = useState(false);

    // Ghost preview: compute projected trace when SYSTEM_RESET is active
    const effectQueue = useGameStore(s => s.effectQueue);
    const gameState = useGameStore(s => s.gameState);
    const activeEffect = effectQueue[0]?.effect;
    const isSystemResetPending = gameState === 'EFFECT_RESOLUTION' && activeEffect?.type === 'SYSTEM_RESET';

    const globalCountermeasures = useActiveGlobalCountermeasures();
    const ghostTraceDelta = isSystemResetPending
        ? globalCountermeasures.filter(cm => cm.type === 'TRACE').reduce((sum, cm) => sum + cm.value, 0)
        : 0;
    const projectedTrace = Math.min(maxTrace, trace + ghostTraceDelta);

    useEffect(() => {
        const handler = (payload: any) => {
            if (payload?.type === 'TRACE') {
                setIsFlashing(true);
                setTimeout(() => setIsFlashing(false), 400);
            }
        };
        gameEventBus.on('VISUAL_COUNTERMEASURE', handler);
        return () => gameEventBus.off('VISUAL_COUNTERMEASURE', handler);
    }, []);

    return (
        <div className="flex flex-col items-center h-full gap-2">
            <div
                className={twMerge(
                    "flex flex-col-reverse w-4 sm:w-6 h-full bg-grid-bg/70 border border-grid-border/60 rounded-sm overflow-hidden transition-all",
                    isFlashing && "animate-glitch border-phosphor/80 shadow-[0_0_12px_rgba(57,255,122,0.5)]"
                )}
            >
                {Array.from({ length: maxTrace }).map((_, i) => (
                    <div
                        key={i}
                        className={twMerge(
                            "flex-1 border-b border-slate-900/30 transition-all duration-300",
                            i < trace
                                ? isFlashing
                                    ? "bg-phosphor shadow-[0_0_10px_rgba(57,255,122,0.8)] z-10"
                                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] z-10"
                                : i < projectedTrace
                                    ? "bg-amber-400/40 border-amber-400/60 animate-pulse z-10"
                                    : "bg-grid-surface"
                        )}
                    />
                ))}
            </div>
            <div className="flex flex-col items-center gap-1 opacity-80 mt-1">
                <span className={twMerge(isFlashing ? "text-phosphor" : "text-rose-400")}>
                    <SvgMaskIcon file="radar-sweep.svg" size={24} />
                </span>
                <span className={twMerge(
                    "text-[10px] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-lr] rotate-180",
                    isFlashing ? "text-phosphor" : "text-rose-400"
                )}>
                    Trace
                </span>
            </div>
        </div>
    );
};
