import { useState } from 'react';
import { useServerStore } from '../../store/useServerStore';
import type { NetworkNode, CellColor, CellSymbol } from '../../engine/types';
import { Lock, Database, Globe, ChevronDown, ChevronUp, Shield, Eye, Skull } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const COLOR_TEXT_MAP: Record<CellColor, string> = {
    RED: 'text-rose-400',
    BLUE: 'text-cyan-400',
    GREEN: 'text-emerald-400',
    YELLOW: 'text-amber-400',
    PURPLE: 'text-fuchsia-400',
};

const SYMBOL_ICON_MAP: Record<CellSymbol, React.ReactNode> = {
    SHIELD: <Shield className="w-3 h-3 inline" />,
    EYE: <Eye className="w-3 h-3 inline" />,
    SKULL: <Skull className="w-3 h-3 inline" />,
    NONE: null,
};

const ServerCard = ({ server }: { server: NetworkNode }) => {
    return (
        <motion.div
            layoutId={`server-${server.id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className="w-48 bg-slate-800/80 border border-slate-600 rounded p-2 flex flex-col gap-2 backdrop-blur-sm shadow-lg pointer-events-auto min-h-[140px]"
        >
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="text-xs font-mono font-bold text-white/80 truncate w-32">{server.name}</span>
                <span className="text-[10px] bg-slate-900 px-1 rounded text-white/50">{server.type.substring(0, 3)} L{server.difficulty}</span>
            </div>

            {/* Layers */}
            <div className="flex flex-col gap-2 mt-2 mb-2">
                {Object.entries(server.layers || {}).map(([colorStr, layerSlots]) => {
                    const color = colorStr as CellColor;
                    if (!layerSlots || layerSlots.length === 0) return null;

                    const progressLane = server.progress[color] || [];

                    return (
                        <div key={color} className="flex gap-1 flex-wrap">
                            {layerSlots.map((slot, idx) => {
                                const isCleared = progressLane[idx];
                                const colorClass = COLOR_TEXT_MAP[color];
                                const bgClass = colorClass.replace('text-', 'bg-') + '/20';
                                const borderClass = colorClass.replace('text-', 'border-');

                                return (
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "w-6 h-6 flex items-center justify-center rounded border transition-all duration-300",
                                            isCleared ? "bg-slate-900 border-slate-800 opacity-20 grayscale" : `${bgClass} ${borderClass}`
                                        )}
                                    >
                                        {slot.symbol !== 'NONE' && (
                                            <div className={clsx("drop-shadow-md", isCleared ? "text-slate-500" : "text-white")}>
                                                {SYMBOL_ICON_MAP[slot.symbol]}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto flex flex-col gap-1 border-t border-white/5 pt-2">
                {Object.entries(server.countermeasures || {}).map(([symbol, effect]) => {
                    if (!effect) return null;
                    return (
                        <div key={symbol} className="text-[10px] flex items-center gap-1.5 text-white/50">
                            <span className="text-white/80">{SYMBOL_ICON_MAP[symbol as CellSymbol]}</span>
                            <span className="font-mono">
                                {effect.value} {effect.type.replace('_', ' ')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};


const MiniNodeCard = ({ server, state }: { server: NetworkNode, state: 'ACTIVE' | 'CLEARED' | 'LOCKED' | 'HOME' }) => {
    const isCleared = state === 'CLEARED';
    const isLocked = state === 'LOCKED';
    const isActive = state === 'ACTIVE';
    const isHome = state === 'HOME';

    let bgClass = "bg-slate-800/90 border-slate-600";
    if (isHome) bgClass = "bg-cyan-950/40 border-cyan-500/50";
    if (isCleared) bgClass = "bg-emerald-950/40 border-emerald-500/50 opacity-60";
    if (isLocked) bgClass = "bg-slate-900 border-slate-700/50 opacity-40 grayscale";
    if (isActive) bgClass = "bg-slate-800/90 border-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] relative z-50";

    return (
        <motion.div
            layoutId={`server-${server.id}`}
            className={`w-36 rounded p-2 flex flex-col items-center gap-1 border-2 backdrop-blur-sm ${bgClass}`}
        >
            {isHome ? <Globe className="w-5 h-5 text-cyan-400" /> :
                server.type === 'MAINFRAME' ? <Database className="w-5 h-5 text-slate-400" /> :
                    <Lock className="w-5 h-5 text-slate-400" />}

            <div className="text-[10px] font-mono font-bold text-center truncate w-full text-white">
                {server.name}
            </div>

            {!isHome && (
                <div className="text-[8px] flex justify-between w-full text-white/50 px-1 font-mono">
                    <span>{server.type.substring(0, 3)}</span>
                    <span className={isActive ? "text-cyan-400 font-bold" : ""}>L{server.difficulty}</span>
                </div>
            )}

            {isCleared && <div className="text-[9px] text-emerald-400 font-bold font-mono uppercase tracking-widest mt-1">BYPASSED</div>}
            {isLocked && <div className="text-[9px] text-slate-500 font-bold font-mono tracking-widest mt-1">ENCRYPTED</div>}
            {isActive && <div className="text-[9px] text-cyan-400 font-bold font-mono uppercase tracking-widest mt-1">VULNERABLE</div>}
        </motion.div>
    );
};

export const NetworkMap = () => {
    const { activeServers, networkGraph } = useServerStore();
    const [isOpen, setIsOpen] = useState(false);

    if (!networkGraph || networkGraph.length === 0) return null;

    const getNodeState = (node: NetworkNode) => {
        if (node.type === 'HOME') return 'HOME';
        if (node.status === 'HACKED') return 'CLEARED';
        if (activeServers.some(s => s.id === node.id)) return 'ACTIVE';
        return 'LOCKED';
    };

    // Calculate depths iteratively
    const layoutLevels: NetworkNode[][] = [];
    const visited = new Set<string>();

    let currentLevelIds = [networkGraph.find(n => n.type === 'HOME')?.id].filter(Boolean) as string[];

    while (currentLevelIds.length > 0) {
        const levelNodes = currentLevelIds.map(id => networkGraph.find(n => n.id === id)).filter(Boolean) as NetworkNode[];
        layoutLevels.push(levelNodes);

        levelNodes.forEach(n => visited.add(n.id));

        const nextLevelIds = new Set<string>();
        levelNodes.forEach(n => {
            n.children.forEach(childId => {
                if (!visited.has(childId)) {
                    nextLevelIds.add(childId);
                }
            });
        });
        currentLevelIds = Array.from(nextLevelIds);
    }

    return (
        <div className="absolute top-24 w-full z-40 flex flex-col items-center pointer-events-none">

            <div className="flex gap-4 p-2 relative z-50">
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    className="pointer-events-auto bg-slate-900 border border-slate-700/80 px-6 py-2 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-lg shadow-black/50 text-white group"
                >
                    <Globe className={clsx(
                        "w-4 h-4 transition-all duration-500",
                        isOpen ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "text-white/40 group-hover:text-cyan-400/70"
                    )} />
                    <span className="text-xs font-mono font-bold tracking-[0.15em] text-white/80 group-hover:text-white transition-colors uppercase">
                        {isOpen ? 'Close Topology' : 'View Topology'}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </motion.button>
            </div>

            <div className="w-full relative flex justify-center mt-2">
                {!isOpen && (
                    <div className="absolute top-0 flex gap-4 p-4 items-start justify-center overflow-visible w-full pointer-events-auto min-h-[140px]">
                        <AnimatePresence>
                            {activeServers.filter(s => s.type !== 'HOME').map((server) => (
                                <ServerCard key={server.id} server={server} />
                            ))}
                        </AnimatePresence>
                        {activeServers.filter(s => s.type !== 'HOME').length === 0 && (
                            <div className="text-white/30 text-sm font-mono animate-pulse">
                                SCANNING FOR TARGETS...
                            </div>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="pointer-events-auto w-[90%] max-w-5xl bg-slate-950/95 border border-slate-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl p-8 flex flex-col items-center gap-10 relative overflow-y-auto max-h-[60vh] custom-scrollbar z-40"
                        >
                            {/* Topological Layout (Bottom Up) */}
                            {layoutLevels.slice().reverse().map((level, reversedDepthIndex) => {
                                const depth = layoutLevels.length - 1 - reversedDepthIndex;
                                return (
                                    <div key={depth} className="flex gap-10 relative justify-center w-full">
                                        {level.map(node => (
                                            <div key={node.id} className="relative z-10 flex flex-col items-center">
                                                <MiniNodeCard server={node} state={getNodeState(node)} />

                                                {/* Draw line downwards visually connecting to children below it -> wait, reversed array means children are ABOVE it! */}
                                                {/* If Home is on bottom, its children (depth 1) are visually rendered above Home. So Home draws lines UP to children. */}
                                                {/* Wait, the children array gives us IDs. Since flex layout handles flow natively, we can just draw generic upward stems. */}
                                                {node.type !== 'HOME' && (
                                                    <div className="absolute -bottom-10 w-0.5 h-10 bg-cyan-900/50 z-0 pointer-events-none" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
