import { motion } from 'framer-motion';
import { Layers, RotateCw } from 'lucide-react';
import { EffectCard } from './EffectCard';
import type { Effect } from '../../../engine/types';

interface DesktopConsoleViewProps {
    isResolving: boolean;
    pendingEffects: Effect[];
    gameState: string;
    onQueueEffect: (effect: Effect) => void;
    onRotate: () => void;
    activeEffectType?: string;
}

export const DesktopConsoleView = ({
    isResolving,
    pendingEffects,
    gameState,
    onQueueEffect,
    onRotate,
    activeEffectType
}: DesktopConsoleViewProps) => {
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[70] w-72 pointer-events-auto"
        >
            <div className="bg-emerald-950/90 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-4 border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Console</h3>
                    </div>
                    {isResolving && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-mono text-emerald-400">RESOLVING</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {pendingEffects.map((eff, i) => (
                        <EffectCard
                            key={`${eff.type}-${i}`}
                            effect={eff}
                            index={i}
                            isActive={true}
                            isOrdering={gameState === 'EFFECT_ORDERING'}
                            onClick={() => onQueueEffect(eff)}
                            variant="desktop"
                        />
                    ))}

                    {pendingEffects.length === 0 && !isResolving && (
                        <div className="py-8 text-center border border-dashed border-emerald-900/30 rounded-lg">
                            <span className="text-[10px] font-mono text-emerald-700/50">NO PENDING PROCESSES</span>
                        </div>
                    )}
                </div>

                {isResolving && activeEffectType === 'RUN' && (
                    <div className="mt-6 pt-6 border-t border-emerald-500/20 animate-in fade-in slide-in-from-bottom-2">
                            <button
                            onClick={onRotate}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-white p-3 rounded-lg font-bold transition-all border border-emerald-800/50 hover:border-emerald-400 hover:text-emerald-400 shadow-xl group"
                        >
                            <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                            ROTATE GRID
                        </button>
                        <div className="mt-3 text-[9px] font-mono text-emerald-700/60 text-center uppercase tracking-widest opacity-60">
                            Manual Spatial Override Active
                        </div>
                    </div>
                )}
                
                {!isResolving && pendingEffects.length > 0 && (
                    <div className="mt-5 pt-3 border-t border-emerald-500/20">
                        <p className="text-[9px] font-mono text-emerald-500/50 leading-tight flex items-center gap-2">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            SELECT PROCESS TO INITIALIZE_
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
