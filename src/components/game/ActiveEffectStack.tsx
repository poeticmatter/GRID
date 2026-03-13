import { useGameStore } from '../../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch } from '../../engine/orchestrator';
import { Layers } from 'lucide-react';

export const ActiveEffectStack = () => {
    const { gameState, pendingEffects } = useGameStore();

    // The sidebar should probably be visible whenever there are pending effects, 
    // even if we are currently resolving one (EFFECT_RESOLUTION).
    const isVisible = (gameState === 'EFFECT_ORDERING' || gameState === 'EFFECT_RESOLUTION') && pendingEffects.length > 0;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-[70] w-64 pointer-events-auto"
                >
                    <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Pending Effects</h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            {pendingEffects.map((eff, i) => (
                                <button
                                    key={`${eff.type}-${i}`}
                                    onClick={() => {
                                        if (gameState === 'EFFECT_ORDERING') {
                                            Dispatch({ type: 'QUEUE_EFFECT', payload: { effect: eff } });
                                        }
                                    }}
                                    disabled={gameState !== 'EFFECT_ORDERING'}
                                    className={`
                                        group relative p-3 text-left transition-all rounded overflow-hidden
                                        ${gameState === 'EFFECT_ORDERING' 
                                            ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer' 
                                            : 'bg-slate-800/50 border border-slate-700 opacity-50 cursor-not-allowed'}
                                    `}
                                >
                                    <div className="text-[10px] font-mono text-cyan-500/60 mb-0.5">SUB_PROCESS_{i + 1}</div>
                                    <div className="text-sm font-bold text-cyan-100 uppercase tracking-wider flex justify-between items-center">
                                        {eff.type}
                                        {eff.amount && <span className="bg-cyan-500/20 px-1.5 rounded text-[10px]">{eff.amount}</span>}
                                    </div>
                                    
                                    {gameState === 'EFFECT_ORDERING' && (
                                        <div className="absolute inset-y-0 right-0 w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-4 pt-2 border-t border-cyan-500/20">
                            <p className="text-[9px] font-mono text-slate-400 leading-tight">
                                SELECT EFFECT TO INITIALIZE RESOLUTION SEQUENCE.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
