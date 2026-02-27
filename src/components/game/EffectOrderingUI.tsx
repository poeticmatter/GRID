import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';
import { Dispatch } from '../../engine/orchestrator';

export const EffectOrderingUI = () => {
    const { gameState, pendingEffects, effectQueue } = useGameStore();

    if (gameState !== 'EFFECT_ORDERING') return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-[60] flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-auto"
        >
            <h2 className="text-3xl font-black text-cyan-400 mb-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                SEQUENCE EFFECTS
            </h2>

            <div className="flex gap-12 w-full max-w-4xl">
                <div className="flex-1 bg-slate-900/80 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold text-slate-400 mb-4 border-b border-slate-700 pb-2">PENDING SEQUENCES</h3>
                    <div className="flex flex-col gap-3">
                        {pendingEffects.length === 0 && <span className="text-slate-600 italic">No remaining sequences.</span>}
                        {pendingEffects.map((eff, i) => (
                            <button
                                key={i}
                                onClick={() => Dispatch({ type: 'QUEUE_EFFECT', payload: { effect: eff } })}
                                className="p-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 rounded text-left transition-all text-cyan-100 uppercase tracking-widest font-mono text-sm"
                            >
                                + {eff.type} {eff.type === 'REPROGRAM' && `(${eff.amount})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-emerald-950/30 p-6 rounded-lg border border-emerald-900/50">
                    <h3 className="text-lg font-bold text-emerald-500 mb-4 border-b border-emerald-900/50 pb-2">EXECUTION LAYER</h3>
                    <div className="flex flex-col gap-3 min-h-[150px]">
                        {effectQueue.length === 0 && <span className="text-emerald-900/60 italic">Select pending sequences to queue.</span>}
                        {effectQueue.map((active, i) => (
                            <div key={i} className="p-3 bg-emerald-900/20 border border-emerald-600/50 rounded text-emerald-300 uppercase tracking-widest font-mono text-sm flex gap-3 items-center">
                                <span className="bg-emerald-600/30 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">{i + 1}</span>
                                {active.effect.type} {active.effect.type === 'REPROGRAM' && `(${active.effect.amount})`}
                            </div>
                        ))}
                    </div>

                    {pendingEffects.length === 0 && (
                        <button
                            onClick={() => Dispatch({ type: 'CONFIRM_EFFECT_ORDER' })}
                            className="mt-6 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.02]"
                        >
                            EXECUTE QUEUE
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
