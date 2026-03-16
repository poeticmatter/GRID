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
    onResolveSystemReset: () => void;
    onCancel: () => void;
    isCardCommitted: boolean;
    activeEffectType?: string;
}

export const DesktopConsoleView = ({
    isResolving,
    pendingEffects,
    gameState,
    onQueueEffect,
    onRotate,
    onResolveSystemReset,
    onCancel,
    isCardCommitted,
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
            <div className="bg-grid-bg/95 backdrop-blur-xl border border-green-500/30 rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between mb-4 border-b border-green-500/20 pb-3">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-phosphor" />
                        <h3 className="text-[11px] font-black text-phosphor uppercase tracking-[0.2em]">Console</h3>
                    </div>
                    {isResolving && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-phosphor/10 border border-phosphor/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-phosphor animate-pulse" />
                            <span className="text-[9px] font-mono text-phosphor">RESOLVING</span>
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
                        <div className="py-8 text-center border border-dashed border-green-900/30 rounded-lg">
                            <span className="text-[10px] font-mono text-green-700/50">NO PENDING PROCESSES</span>
                        </div>
                    )}
                </div>

                {isResolving && activeEffectType === 'RUN' && (
                    <div className="mt-6 pt-6 border-t border-green-500/20 animate-in fade-in slide-in-from-bottom-2">
                            <button
                            onClick={onRotate}
                            className="w-full flex items-center justify-center gap-2 bg-phosphor/10 hover:bg-phosphor/20 text-white p-3 rounded-lg font-bold transition-all border border-phosphor/30 hover:border-phosphor hover:text-phosphor shadow-xl group"
                        >
                            <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                            ROTATE GRID
                        </button>
                        <button
                            onClick={onCancel}
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white p-3 rounded-lg font-bold transition-all border border-zinc-700/50 hover:border-zinc-400 shadow-xl uppercase tracking-widest text-xs"
                        >
                            {isCardCommitted ? 'Finish Early' : 'Cancel / Undo'}
                        </button>
                        <div className="mt-3 text-[9px] font-mono text-green-700/60 text-center uppercase tracking-widest opacity-60">
                            Manual Spatial Override Active
                        </div>
                    </div>
                )}

                {isResolving && activeEffectType === 'REPROGRAM' && (
                    <div className="mt-6 pt-6 border-t border-green-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <button
                            onClick={onCancel}
                            className="w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white p-3 rounded-lg font-bold transition-all border border-zinc-700/50 hover:border-zinc-400 shadow-xl uppercase tracking-widest text-xs"
                        >
                            {isCardCommitted ? 'End Reprogram' : 'Cancel / Undo'}
                        </button>
                    </div>
                )}

                {isResolving && activeEffectType === 'SYSTEM_RESET' && (
                    <div className="mt-6 pt-6 border-t border-green-500/20 animate-in fade-in slide-in-from-bottom-2">
                        <button
                            onClick={onResolveSystemReset}
                            className="w-full flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-white p-3 rounded-lg font-bold transition-all border border-red-800/50 hover:border-red-400 hover:text-red-400 shadow-xl group uppercase tracking-widest text-xs"
                        >
                            Confirm System Reset
                        </button>
                        <button
                            onClick={onCancel}
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white p-3 rounded-lg font-bold transition-all border border-zinc-700/50 hover:border-zinc-400 shadow-xl uppercase tracking-widest text-xs"
                        >
                            {isCardCommitted ? 'Finish Early' : 'Cancel / Undo'}
                        </button>
                        <div className="mt-3 text-[9px] font-mono text-red-500/60 text-center uppercase tracking-widest opacity-60">
                            Warning: Grid Wipe Imminent
                        </div>
                    </div>
                )}
                
                {!isResolving && pendingEffects.length > 0 && (
                    <div className="mt-5 pt-3 border-t border-green-500/20">
                        <p className="text-[9px] font-mono text-green-500/50 leading-tight flex items-center gap-2">
                            <span className="w-1 h-1 bg-phosphor rounded-full animate-pulse" />
                            SELECT PROCESS TO INITIALIZE_
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
