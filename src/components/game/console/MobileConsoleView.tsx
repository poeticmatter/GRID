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
    onConfirm
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
                className="w-full max-w-md pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border-t border-cyan-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-[max(1rem,env(safe-area-inset-bottom))]"
            >
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-3 flex items-center justify-between group"
                >
                    <div className="flex items-center gap-2 ml-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                            {isResolving ? 'SPATIAL OVERRIDE ACTIVE' : `${pendingEffects.length} Effects Stacked`}
                        </span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-500" /> : <ChevronUp className="w-4 h-4 text-cyan-500" />}
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
                                        <DPad 
                                            layout="horizontal" 
                                            onMove={onDpadMove} 
                                            onRotate={onRotate} 
                                            onConfirm={onConfirm}
                                            confirmLabel="Confirm"
                                        />
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
