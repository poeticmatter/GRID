import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { DPad } from './DPad';
import { EffectCard } from './EffectCard';
import type { Effect } from '../../../engine/types';

interface MobileConsoleViewProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isResolving: boolean;
    pendingEffects: Effect[];
    gameState: string;
    onQueueEffect: (effect: Effect) => void;
    onDpadMove: (dx: number, dy: number) => void;
    onRotate: () => void;
    onConfirm: () => void;
    onResolveSystemReset: () => void;
    onCancel: () => void;
    isCardCommitted: boolean;
    activeEffectType?: string;
}

export const MobileConsoleView = ({
    isExpanded,
    setIsExpanded,
    isResolving,
    pendingEffects,
    gameState,
    onQueueEffect,
    onDpadMove,
    onRotate,
    onConfirm,
    onResolveSystemReset,
    onCancel,
    isCardCommitted,
    activeEffectType
}: MobileConsoleViewProps) => {
    return (
        <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[80] pointer-events-none flex flex-col items-center"
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full max-w-md pointer-events-auto bg-zinc-950/95 backdrop-blur-2xl border-t border-green-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-3 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-2 ml-2">
                        <Layers className="w-4 h-4 text-green-400" />
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                            {isResolving ? 'SPATIAL OVERRIDE ACTIVE' : `${pendingEffects.length} Effects Stacked`}
                        </span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-green-500" /> : <ChevronUp className="w-4 h-4 text-green-500" />}
                </button>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 flex flex-col gap-2 max-h-[35vh]">
                                {isResolving ? (
                                    <div className="py-2 animate-in fade-in zoom-in-95 duration-200">
                                        {activeEffectType === 'SYSTEM_RESET' ? (
                                            <div className="py-6 pt-2 animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    onClick={onResolveSystemReset}
                                                    className="w-full flex items-center justify-center gap-2 bg-red-900/40 hover:bg-red-800/60 text-white p-4 rounded-xl font-bold transition-all border border-red-800/50 hover:border-red-400 active:scale-95 shadow-xl uppercase tracking-[0.2em] text-sm"
                                                >
                                                    Confirm System Reset
                                                </button>
                                                <button
                                                    onClick={onCancel}
                                                    className="mt-2 w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white p-4 rounded-xl font-bold transition-all border border-zinc-700/50 hover:border-zinc-400 active:scale-95 shadow-xl uppercase tracking-[0.2em] text-sm"
                                                >
                                                    {isCardCommitted ? 'Finish Early' : 'Cancel / Undo'}
                                                </button>
                                                <div className="mt-4 text-[10px] font-mono text-red-500/60 text-center uppercase tracking-widest opacity-60">
                                                    CRITICAL: Terminal Reboot Required
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <DPad
                                                    layout="horizontal"
                                                    onMove={onDpadMove}
                                                    onRotate={onRotate}
                                                    onConfirm={onConfirm}
                                                    confirmLabel="Confirm"
                                                />
                                                <button
                                                    onClick={onCancel}
                                                    className="mt-3 w-full flex items-center justify-center gap-2 bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 hover:text-white p-3 rounded-xl font-bold transition-all border border-zinc-700/50 hover:border-zinc-400 active:scale-95 shadow-xl uppercase tracking-[0.2em] text-xs"
                                                >
                                                    {isCardCommitted ? (activeEffectType === 'REPROGRAM' ? 'End Reprogram' : 'Finish Early') : 'Cancel / Undo'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-4">
                                        {pendingEffects.map((eff, i) => (
                                            <EffectCard
                                                key={`${eff.type}-${i}`}
                                                effect={eff}
                                                index={i}
                                                isActive={true}
                                                isOrdering={gameState === 'EFFECT_ORDERING'}
                                                onClick={() => onQueueEffect(eff)}
                                                variant="mobile"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
