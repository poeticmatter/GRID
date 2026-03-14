import React from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TraceBar: React.FC = () => {
    const { trace, maxTrace } = usePlayerStore((state) => state.playerStats);

    return (
        <div className="flex flex-col items-center h-full gap-2">
            <div className="flex flex-col-reverse w-4 sm:w-6 h-full bg-slate-900/50 border border-slate-700/50 rounded-sm overflow-hidden backdrop-blur-sm">
                {Array.from({ length: maxTrace }).map((_, i) => (
                    <div
                        key={i}
                        className={twMerge(
                            "flex-1 border-b border-slate-900/30 transition-all duration-300",
                            i < trace
                                ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] z-10"
                                : "bg-slate-800"
                        )}
                    />
                ))}
            </div>
            <div className="flex flex-col items-center gap-1 opacity-80 mt-1">
                <Shield className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-rose-400 uppercase [writing-mode:vertical-lr] rotate-180">
                    Trace
                </span>
            </div>
        </div>
    );
};
