import { useState, useMemo } from 'react';
import { useServerStore } from '../../store/useServerStore';
import type { NetworkNode, CellColor, CellSymbol } from '../../engine/types';
import { Lock, Database, Globe, ChevronDown, ChevronUp, Shield, Eye, Skull, Server as ServerIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { CityBackground } from './CityBackground';

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

const CircularNodeIcon = ({ server, state }: { server: NetworkNode, state: 'ACTIVE' | 'CLEARED' | 'LOCKED' | 'HOME' }) => {
    const isCleared = state === 'CLEARED';
    const isLocked = state === 'LOCKED';
    const isActive = state === 'ACTIVE';
    const isHome = state === 'HOME';

    let bgClass = "bg-slate-800 border-slate-600 text-slate-400";
    if (isHome) bgClass = "bg-cyan-950 border-cyan-500 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]";
    if (isCleared) bgClass = "bg-emerald-950 border-emerald-500 text-emerald-400 opacity-80 grid-clear";
    if (isLocked) bgClass = "bg-slate-900 border-slate-700 text-slate-600 opacity-50 grayscale";
    if (isActive) bgClass = "bg-slate-800 border-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] z-50";

    return (
        <motion.div
            layoutId={`server-${server.id}`}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 backdrop-blur-md relative cursor-default group shadow-lg pointer-events-auto ${bgClass}`}
        >
            {isHome ? <Globe className="w-6 h-6" /> :
                server.type === 'MAINFRAME' ? <Database className="w-5 h-5" /> :
                    server.type === 'ICE' ? <Lock className="w-5 h-5" /> :
                        <ServerIcon className="w-5 h-5" />}

            {isActive && (
                <div className="absolute -inset-2 border-2 border-cyan-400/50 rounded-full animate-ping pointer-events-none" />
            )}

            {/* Tooltip on hover */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 text-white text-[10px] py-1.5 px-3 rounded pointer-events-none whitespace-nowrap font-mono border border-slate-600/50 z-50 flex flex-col items-center shadow-xl">
                <span className="font-bold text-cyan-400 text-xs mb-0.5">{server.name}</span>
                <span className="text-white/60">{server.type} {server.type !== 'HOME' && `L${server.difficulty}`}</span>
            </div>

            {/* Sub-label for status */}
            <div className="absolute -bottom-5 text-[9px] font-mono font-bold tracking-widest text-slate-400 pointer-events-none drop-shadow-md whitespace-nowrap">
                {isHome && 'HOME'}
                {isCleared && 'BYPASSED'}
                {isLocked && 'ENCRYPTED'}
                {isActive && 'TARGET'}
            </div>
        </motion.div>
    );
};

export const NetworkMap = () => {
    const { activeServers, networkGraph } = useServerStore();
    const [isOpen, setIsOpen] = useState(false);

    const nodeCoords = useMemo(() => {
        if (!networkGraph || networkGraph.length === 0) return {};

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

        const coords: Record<string, { x: number, y: number }> = {};
        const maxDepth = layoutLevels.length;

        layoutLevels.forEach((level, depth) => {
            // Home is at depth 0 (bottom). Deepest nodes are at maxDepth-1 (top).
            // So y % goes from 90% (bottom) to 15% (top).
            const y = maxDepth > 1 ? 85 - (depth / (maxDepth - 1)) * 65 : 85;

            level.forEach((node, i) => {
                const count = level.length;
                // Distribute evenly horizontally between 20% and 80%
                const x = count > 1 ? 20 + (i / (count - 1)) * 60 : 50;
                coords[node.id] = { x, y };
            });
        });

        return coords;
    }, [networkGraph]);

    if (!networkGraph || networkGraph.length === 0) return null;

    const getNodeState = (node: NetworkNode) => {
        if (node.type === 'HOME') return 'HOME';
        if (node.status === 'HACKED') return 'CLEARED';
        if (activeServers.some(s => s.id === node.id)) return 'ACTIVE';
        return 'LOCKED';
    };

    return (
        <>
            <div className="absolute top-24 w-full z-40 flex flex-col items-center pointer-events-none">
                <div className="w-full relative flex justify-center mt-2">
                    {!isOpen && (
                        <div className="absolute top-0 flex flex-col items-center w-full">
                            <div className="flex gap-4 p-2 relative z-50">
                                <motion.button
                                    onClick={() => setIsOpen(true)}
                                    className="pointer-events-auto bg-slate-900 border border-slate-700/80 px-6 py-2 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-lg shadow-black/50 text-white group"
                                >
                                    <Globe className="w-4 h-4 text-white/40 group-hover:text-cyan-400/70 transition-all duration-500" />
                                    <span className="text-xs font-mono font-bold tracking-[0.15em] text-white/80 group-hover:text-white transition-colors uppercase">
                                        View Topology
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-white/40" />
                                </motion.button>
                            </div>
                            <div className="flex gap-4 p-4 items-start justify-start md:justify-center overflow-x-auto overflow-y-visible max-w-full pointer-events-auto min-h-[140px] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 w-screen h-screen z-[100] bg-slate-950 pointer-events-auto overflow-hidden flex flex-col"
                    >
                        {/* Close Button Pinned to Top */}
                        <div className="absolute top-6 w-full flex justify-center z-[110]">
                            <motion.button
                                onClick={() => setIsOpen(false)}
                                className="pointer-events-auto bg-slate-900 border border-cyan-500/50 px-8 py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white group"
                            >
                                <Globe className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-500" />
                                <span className="text-sm font-mono font-bold tracking-[0.2em] text-white group-hover:text-cyan-200 transition-colors uppercase">
                                    Close Topology
                                </span>
                                <ChevronUp className="w-5 h-5 text-white/80" />
                            </motion.button>
                        </div>
                        {/* Z-0: City Background Layer */}
                        <CityBackground nodeCoords={nodeCoords} />

                        {/* Z-10: SVG Edge Lines Layer */}
                        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                            {networkGraph.map(node => {
                                const p1 = nodeCoords[node.id];
                                if (!p1) return null;
                                return node.children.map(childId => {
                                    const p2 = nodeCoords[childId];
                                    if (!p2) return null;

                                    const isParentCleared = node.status === 'HACKED' || node.type === 'HOME';
                                    const isChildActive = activeServers.some(s => s.id === childId);
                                    const isActiveConnection = isParentCleared && isChildActive;

                                    return (
                                        <line
                                            key={`${node.id}-${childId}`}
                                            x1={`${p1.x}%`} y1={`${p1.y}%`}
                                            x2={`${p2.x}%`} y2={`${p2.y}%`}
                                            stroke={isActiveConnection ? "rgba(34, 211, 238, 0.4)" : "rgba(6, 182, 212, 0.15)"}
                                            strokeWidth={isActiveConnection ? "3" : "1.5"}
                                            strokeDasharray={!isActiveConnection ? "5 5" : "none"}
                                        />
                                    );
                                });
                            })}
                        </svg>

                        {/* Z-20: Absolute Positioned Node Circles Layer */}
                        {networkGraph.map(node => {
                            const coord = nodeCoords[node.id];
                            if (!coord) return null;
                            return (
                                <div
                                    key={node.id}
                                    className="absolute z-20"
                                    style={{
                                        left: `${coord.x}%`,
                                        top: `${coord.y}%`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    <CircularNodeIcon server={node} state={getNodeState(node)} />
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
