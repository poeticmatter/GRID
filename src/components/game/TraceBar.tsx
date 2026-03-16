import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Shield } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { gameEventBus } from '../../engine/eventBus';

export const TraceBar: React.FC = () => {
    const { trace, maxTrace } = usePlayerStore((state) => state.playerStats);
    const [isFlashing, setIsFlashing] = useState(false);

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
                    "flex flex-col-reverse w-4 sm:w-6 h-full bg-slate-900/50 border border-slate-700/50 rounded-sm overflow-hidden backdrop-blur-sm transition-all",
                    isFlashing && "animate-glitch border-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                )}
            >
                {Array.from({ length: maxTrace }).map((_, i) => (
                    <div
                        key={i}
                        className={twMerge(
                            "flex-1 border-b border-slate-900/30 transition-all duration-300",
                            i < trace
                                ? isFlashing
                                    ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)] z-10"
                                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] z-10"
                                : "bg-slate-800"
                        )}
                    />
                ))}
            </div>
            <div className="flex flex-col items-center gap-1 opacity-80 mt-1">
                <Shield className={twMerge("w-3 h-3", isFlashing ? "text-cyan-300" : "text-rose-400")} />
                <span className={twMerge(
                    "text-[10px] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-lr] rotate-180",
                    isFlashing ? "text-cyan-300" : "text-rose-400"
                )}>
                    Trace
                </span>
            </div>
        </div>
    );
};
