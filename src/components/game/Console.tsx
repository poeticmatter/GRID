import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useTargetingStore } from '../../store/useTargetingStore';
import { useUIStore } from '../../store/useUIStore';
import { useGridStore } from '../../store/useGridStore';
import { useMobile } from '../../hooks/useMobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch } from '../../engine/orchestrator';
import { Layers, ChevronUp, ChevronDown, RotateCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export const Console = () => {
    const { gameState, pendingEffects, effectQueue } = useGameStore();
    const { hoveredCoordinate, setHoveredCoordinate } = useTargetingStore();
    const { grid } = useGridStore();
    const isMobile = useMobile();
    const [isExpanded, setIsExpanded] = useState(false);

    const activeEffect = effectQueue[0]?.effect;
    const isResolving = gameState === 'EFFECT_RESOLUTION' && !!activeEffect;
    const isVisible = (gameState === 'EFFECT_ORDERING' || gameState === 'EFFECT_RESOLUTION') && (pendingEffects.length > 0 || isResolving);

    // Mobile: Auto-collapse list when an effect starts resolution
    useEffect(() => {
        if (isMobile && isResolving) {
            setIsExpanded(false);
        }
    }, [isResolving, isMobile]);

    // Mobile Virtual Cursor Initialization
    useEffect(() => {
        if (isMobile && gameState === 'EFFECT_RESOLUTION' && activeEffect?.type === 'RUN' && hoveredCoordinate === null) {
            // Find center of board. Grid is 6x6 usually.
            const centerY = Math.floor(grid.length / 2);
            const centerX = Math.floor(grid[0]?.length / 2) || 0;
            setHoveredCoordinate({ x: centerX, y: centerY });
        }
    }, [gameState, activeEffect?.type, isMobile, grid, setHoveredCoordinate]);

    if (!isVisible) return null;

    const handleDpadMove = (dx: number, dy: number) => {
        if (!hoveredCoordinate) return;
        const newX = Math.max(0, Math.min(grid[0].length - 1, hoveredCoordinate.x + dx));
        const newY = Math.max(0, Math.min(grid.length - 1, hoveredCoordinate.y + dy));
        setHoveredCoordinate({ x: newX, y: newY });
    };

    const handleConfirm = () => {
        if (activeEffect?.type === 'RUN' && hoveredCoordinate) {
            Dispatch({ type: 'RESOLVE_RUN', payload: { x: hoveredCoordinate.x, y: hoveredCoordinate.y, pattern: activeEffect.pattern } });
            setHoveredCoordinate(null);
        }
    };

    const renderDpad = () => (
        <div className="flex flex-col items-center gap-2 bg-slate-900/40 p-4 rounded-xl border border-cyan-500/20 mb-4 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-2">
                <div />
                <button 
                    onClick={() => handleDpadMove(0, -1)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 active:scale-95 transition-all"
                >
                    <ArrowUp className="w-6 h-6 text-cyan-400" />
                </button>
                <div />
                
                <button 
                    onClick={() => handleDpadMove(-1, 0)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 text-cyan-400" />
                </button>
                
                <button 
                    onClick={() => Dispatch({ type: 'ROTATE_CARD' })}
                    className="w-12 h-12 bg-rose-500/20 border border-rose-500/40 rounded-lg flex items-center justify-center active:bg-rose-500/40 active:scale-95 transition-all"
                >
                    <RotateCw className="w-6 h-6 text-rose-400" />
                </button>
                
                <button 
                    onClick={() => handleDpadMove(1, 0)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 active:scale-95 transition-all"
                >
                    <ArrowRight className="w-6 h-6 text-cyan-400" />
                </button>

                <div />
                <button 
                    onClick={() => handleDpadMove(0, 1)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 active:scale-95 transition-all"
                >
                    <ArrowDown className="w-6 h-6 text-cyan-400" />
                </button>
                <div />
            </div>

            <button 
                onClick={handleConfirm}
                className="w-full h-12 mt-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex items-center justify-center gap-2 font-black text-emerald-400 uppercase tracking-widest active:bg-emerald-500/40 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
                <Check className="w-5 h-5" />
                Confirm Run
            </button>
        </div>
    );

    if (isMobile) {
        return (
            <div className="fixed inset-x-0 bottom-[120px] z-[70] px-4 pointer-events-none flex flex-col items-center">
                <AnimatePresence>
                    {isResolving && activeEffect?.type === 'RUN' && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="pointer-events-auto"
                        >
                            {renderDpad()}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full max-w-md pointer-events-auto">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-t-lg p-2 flex items-center justify-between group shadow-xl"
                    >
                        <div className="flex items-center gap-2 ml-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                {pendingEffects.length} Effects Stacked
                            </span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-500" /> : <ChevronUp className="w-4 h-4 text-cyan-500" />}
                    </button>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-slate-900/95 border-x border-cyan-500/30 backdrop-blur-xl"
                            >
                                <div className="p-3 flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
                                    {pendingEffects.map((eff, i) => (
                                        <button
                                            key={`${eff.type}-${i}`}
                                            onClick={() => {
                                                if (gameState === 'EFFECT_ORDERING') {
                                                    Dispatch({ type: 'QUEUE_EFFECT', payload: { effect: eff } });
                                                }
                                            }}
                                            className={`
                                                relative p-2 text-left rounded border transition-all
                                                ${gameState === 'EFFECT_ORDERING' 
                                                    ? 'bg-cyan-950/40 border-cyan-500/30 hover:border-cyan-400' 
                                                    : 'bg-slate-800/50 border-slate-700 opacity-50'}
                                            `}
                                        >
                                            <div className="flex justify-between items-center uppercase tracking-wider">
                                                <span className="text-xs font-bold text-cyan-100">{eff.type}</span>
                                                {eff.amount && <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1 rounded">{eff.amount}</span>}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="h-1 bg-cyan-500/30 w-full rounded-b-lg" />
                </div>
            </div>
        );
    }

    // Desktop View
    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed right-6 top-1/2 -translate-y-1/2 z-[70] w-72 pointer-events-auto"
            >
                <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
                    <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-3">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <h3 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em]">Console</h3>
                        </div>
                        {isResolving && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                <span className="text-[9px] font-mono text-cyan-400">RESOLVING</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
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
                                    group relative p-3 text-left transition-all rounded-lg overflow-hidden border
                                    ${gameState === 'EFFECT_ORDERING' 
                                        ? 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-500/30 hover:border-cyan-400 cursor-pointer scale-100 hover:scale-[1.02]' 
                                        : 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed'}
                                `}
                            >
                                <div className="text-[9px] font-mono text-cyan-500/60 mb-1">EFFECT_INSTANCE_{i.toString().padStart(2, '0')}</div>
                                <div className="text-sm font-black text-cyan-50 text-shadow-glow uppercase tracking-wider flex justify-between items-center">
                                    {eff.type}
                                    {eff.amount && <span className="bg-cyan-500/20 px-1.5 rounded text-[10px] text-cyan-300">x{eff.amount}</span>}
                                </div>
                            </button>
                        ))}

                        {pendingEffects.length === 0 && !isResolving && (
                            <div className="py-8 text-center border border-dashed border-slate-700 rounded-lg">
                                <span className="text-[10px] font-mono text-slate-500">NO PENDING PROCESSES</span>
                            </div>
                        )}
                    </div>

                    {isResolving && activeEffect?.type === 'RUN' && (
                        <div className="mt-6 pt-6 border-t border-cyan-500/20 animate-in fade-in slide-in-from-bottom-2">
                             <button
                                onClick={() => Dispatch({ type: 'ROTATE_CARD' })}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg font-bold transition-all border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 shadow-xl group"
                            >
                                <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                                ROTATE GRID
                            </button>
                            <div className="mt-3 text-[9px] font-mono text-slate-400 text-center uppercase tracking-widest opacity-60">
                                Manual Spatial Override Active
                            </div>
                        </div>
                    )}
                    
                    {!isResolving && pendingEffects.length > 0 && (
                        <div className="mt-5 pt-3 border-t border-cyan-500/20">
                            <p className="text-[9px] font-mono text-cyan-500/50 leading-tight flex items-center gap-2">
                                <span className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                                SELECT PROCESS TO INITIALIZE_
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
