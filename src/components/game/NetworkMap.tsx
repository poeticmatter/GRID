import { useState, useMemo, useEffect } from 'react';
import { useViewModel } from '../../hooks/useViewModel';
import type { NetworkNode, CellColor, CellSymbol } from '../../engine/types';
import { LAYER_THEME } from '../../presentation/theme';
import { gameEventBus } from '../../engine/eventBus';
import { Dispatch } from '../../engine/orchestrator';
import { useUIStore } from '../../store/useUIStore';

import { Lock, Database, Globe, ChevronDown, ChevronUp, Server as ServerIcon, HelpCircle } from 'lucide-react';
import { SymbolIcon } from './CellSymbols';
import { clsx } from 'clsx';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { CityBackground } from './CityBackground';



interface CountermeasureNotification {
    id: number;
    nodeId: string;
    type: string;
    value: number;
}

const CM_LABEL: Record<string, string> = {
    TRACE:           'TRACE +',
    HARDWARE_DAMAGE: 'HW DMG -',
    NET_DAMAGE:      'NET DMG',
    VIRUS:           'VIRUS ×',
    CORRUPT:         'CORRUPT ×',
    NOISE:           'NOISE +',
};

const CM_COLOR: Record<string, string> = {
    TRACE:           'border-yellow-500/60 bg-yellow-950/80 text-yellow-300',
    HARDWARE_DAMAGE: 'border-orange-500/60 bg-orange-950/80 text-orange-300',
    NET_DAMAGE:      'border-red-500/60 bg-red-950/80 text-red-300',
    VIRUS:           'border-purple-500/60 bg-purple-950/80 text-purple-300',
    CORRUPT:         'border-pink-500/60 bg-pink-950/80 text-pink-300',
    NOISE:           'border-cyan-500/60 bg-cyan-950/80 text-cyan-300',
};

const CountermeasureToastLayer = () => {
    const [toasts, setToasts] = useState<CountermeasureNotification[]>([]);

    useEffect(() => {
        let counter = 0;
        const handler = (payload: any) => {
            const id = ++counter;
            setToasts(prev => [...prev, { id, nodeId: payload.nodeId, type: payload.type, value: payload.value }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 650);
        };

        gameEventBus.on('VISUAL_COUNTERMEASURE', handler);
        return () => gameEventBus.off('VISUAL_COUNTERMEASURE', handler);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className={`px-5 py-2 rounded-lg border backdrop-blur-xl font-mono font-bold text-sm shadow-2xl ${CM_COLOR[toast.type] ?? 'border-zinc-500/60 bg-zinc-900/80 text-zinc-300'}`}
                    >
                        <span className="tracking-widest uppercase text-xs opacity-70 mr-2">{CM_LABEL[toast.type] ?? toast.type}</span>
                        <span className="text-base">{toast.value}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

const ServerCard = ({ server }: { server: NetworkNode }) => {
    return (
        <motion.div
            layoutId={`server-${server.id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className="w-[clamp(140px,25vw,192px)] bg-grid-bg border border-green-500/40 rounded p-[clamp(0.375rem,1vh,0.5rem)] flex flex-col gap-1 shadow-lg pointer-events-auto min-h-0"
        >
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="text-[clamp(0.6rem,1.2vh,0.75rem)] font-mono font-bold text-phosphor truncate w-32">{server.name}</span>
                <span className="text-[clamp(0.5rem,1vh,0.625rem)] bg-grid-surface px-1 rounded text-phosphor/50 leading-none">{server.type.substring(0, 3)}</span>
            </div>

            {/* Layers */}
            <div className="flex flex-row my-[clamp(0.25rem,1.5vh,0.5rem)] gap-[clamp(0.25rem,1vh,0.5rem)]">
                {Object.entries(server.layers || {}).map(([colorStr, requirements]) => {
                    const color = colorStr as CellColor;
                    if (!requirements || requirements.length === 0) return null;

                    const progressLane = server.progress[color] || [];

                    return (
                        <div key={color} className="flex flex-col gap-[clamp(2px,0.5vh,4px)]">
                            {requirements.map((req, idx) => {
                                const isCleared = progressLane[idx];
                                return (
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "w-[clamp(1rem,2.5vh,1.25rem)] h-[clamp(1rem,2.5vh,1.25rem)] flex items-center justify-center rounded border transition-all duration-300",
                                            isCleared ? "bg-zinc-950 border-zinc-900 opacity-20 grayscale" : `${LAYER_THEME[color].bg} ${LAYER_THEME[color].border}`
                                        )}
                                    >
                                        <div className={clsx("font-mono text-[clamp(0.6rem,1.2vh,0.75rem)] font-bold", isCleared ? "text-slate-500" : "text-zinc-950")}>
                                            {req}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto flex flex-col gap-1 border-t border-white/5 pt-[clamp(0.25rem,1vh,0.5rem)]">
                {(server.countermeasures || []).map((cm, idx) => {
                    return (
                        <div key={idx} className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5 text-phosphor">
                                {cm.requiredSymbols.length > 0 ? cm.requiredSymbols.map((sym: CellSymbol, sIdx: number) => (
                                    <SymbolIcon key={sIdx} symbol={sym} size={24} />
                                )) : <span className="text-red-400 text-[9px] font-bold">!</span>}
                            </div>
                            <span className="font-mono text-phosphor">
                                {cm.value} {cm.type.replace('_', ' ')}
                            </span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const ReachableServerCard = ({ server }: { server: NetworkNode }) => {
    return (
        <motion.div
            layoutId={`server-${server.id}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className="w-[clamp(140px,25vw,192px)] bg-grid-bg border border-green-500/40 rounded p-[clamp(0.375rem,1vh,0.5rem)] flex flex-col gap-1 shadow-lg pointer-events-auto min-h-0 z-[110]"
        >
            <div className="flex justify-between items-center border-b border-white/10 pb-1">
                <span className="text-[clamp(0.6rem,1.2vh,0.75rem)] font-mono font-bold text-phosphor truncate w-32">{server.name}</span>
                <span className="text-[clamp(0.5rem,1vh,0.625rem)] bg-grid-surface px-1 rounded text-phosphor/50 leading-none">{server.type.substring(0, 3)}</span>
            </div>

            {/* Layer color indicators — one per color, no capacities shown */}
            <div className="flex flex-row my-[clamp(0.25rem,1.5vh,0.5rem)] gap-[clamp(0.25rem,1vh,0.5rem)]">
                {Object.keys(server.layers || {}).map((colorStr) => {
                    const color = colorStr as CellColor;
                    const requirements = server.layers[color];
                    if (!requirements || requirements.length === 0) return null;
                    return (
                        <div
                            key={color}
                            className={clsx(
                                "w-[clamp(1rem,2.5vh,1.25rem)] h-[clamp(1rem,2.5vh,1.25rem)] rounded border",
                                LAYER_THEME[color].bg, LAYER_THEME[color].border
                            )}
                        />
                    );
                })}
            </div>

            <button
                onClick={() => Dispatch({ type: 'ACCESS_NODE', payload: { nodeId: server.id } })}
                className="mt-auto w-full py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300/80 font-mono font-bold text-[clamp(0.5rem,1vh,0.625rem)] tracking-widest uppercase rounded hover:bg-amber-500/20 hover:border-amber-400 hover:text-amber-200 transition-colors active:scale-95"
            >
                ACCESS NODE
            </button>
        </motion.div>
    );
};

const CircularNodeIcon = ({ server, state, onClick, isSelected }: { server: NetworkNode, state: 'ACTIVE' | 'CLEARED' | 'LOCKED' | 'HOME' | 'REACHABLE', onClick?: () => void, isSelected?: boolean }) => {
    const isCleared = state === 'CLEARED';
    const isLocked = state === 'LOCKED';
    const isActive = state === 'ACTIVE';
    const isHome = state === 'HOME';
    const isReachable = state === 'REACHABLE';

    let bgClass = "bg-zinc-900/50 border-zinc-700 text-zinc-600";
    if (isHome) bgClass = "bg-grid-bg border-green-500 text-phosphor drop-shadow-[0_0_8px_rgba(57,255,122,0.8)]";
    if (isCleared) bgClass = "bg-grid-bg border-green-500 text-phosphor opacity-80 grid-clear";
    if (isLocked) bgClass = "bg-zinc-900/80 border-zinc-500 text-zinc-400 opacity-70";
    if (isActive) bgClass = "bg-grid-surface border-phosphor text-phosphor drop-shadow-[0_0_8px_rgba(57,255,122,0.8)] z-50";
    if (isReachable) bgClass = isSelected
        ? "bg-amber-950/80 border-amber-400 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] z-50 cursor-pointer"
        : "bg-zinc-900/70 border-amber-500/60 text-amber-400/80 cursor-pointer hover:border-amber-400 hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] transition-colors z-50";

    const isTerminal = server.type === 'SERVER' || server.type === 'MAINFRAME';
    const shapeClass = isTerminal ? 'rounded-lg' : 'rounded-full';

    const STEP_TIME = 0.5;
    const CYCLE_TIME = 4;
    const isReadyToAnimateDelay = server.gridY * STEP_TIME;

    return (
        <motion.div
            layoutId={`server-${server.id}`}
            className={`w-12 h-12 ${shapeClass} flex flex-col items-center justify-center border-2 backdrop-blur-md relative group shadow-lg pointer-events-auto ${bgClass}`}
            onClick={onClick}
        >
            {isHome ? <Globe className="w-6 h-6" /> :
                isLocked ? <HelpCircle className="w-5 h-5" /> :
                    isReachable ? <HelpCircle className="w-5 h-5" /> :
                        server.type === 'MAINFRAME' ? <Database className="w-5 h-5" /> :
                            server.type === 'ICE' ? <Lock className="w-5 h-5" /> :
                                <ServerIcon className="w-5 h-5" />}

            {/* Active Server Layer Preview */}
            {isActive && (
                <div className="absolute -top-5 flex gap-1 flex-wrap justify-center w-full max-w-[80px] pointer-events-none z-[60]">
                    {Object.entries(server.layers || {}).map(([colorStr, requirements]) => {
                        const color = colorStr as CellColor;
                        if (!requirements || requirements.length === 0) return null;

                        const progressLane = server.progress[color] || [];

                        return requirements.map((req, idx) => {
                            const isCleared = progressLane[idx];
                            return (
                                <div
                                    key={`${color}-${idx}`}
                                    className={clsx(
                                        "px-1 py-0.5 min-w-[12px] h-[14px] flex items-center justify-center rounded-sm text-[8px] font-mono font-bold border shadow-md transition-all duration-300",
                                        isCleared
                                            ? "bg-zinc-950 border-zinc-800 text-zinc-800 opacity-40 grayscale"
                                            : `${LAYER_THEME[color].bg} ${LAYER_THEME[color].border} text-zinc-950`
                                    )}
                                >
                                    {req}
                                </div>
                            );
                        });
                    })}
                </div>
            )}

            {/* Reachable Server Layer Preview (Small Indicators) */}
            {isReachable && (
                <div className="absolute -top-3 flex gap-1 flex-wrap justify-center w-full pointer-events-none z-[60]">
                    {Object.entries(server.layers || {}).map(([colorStr, requirements]) => {
                        const color = colorStr as CellColor;
                        if (!requirements || requirements.length === 0) return null;
                        return (
                            <div
                                key={color}
                                className={clsx(
                                    "w-2.5 h-2.5 rounded-sm border shadow-sm",
                                    LAYER_THEME[color].bg,
                                    LAYER_THEME[color].border
                                )}
                            />
                        );
                    })}
                </div>
            )}

            {isActive && (
                <motion.div
                    className={`absolute -inset-2 border-2 border-phosphor pointer-events-none ${shapeClass}`}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: CYCLE_TIME - 0.6,
                        delay: isReadyToAnimateDelay,
                        ease: "easeOut"
                    }}
                />
            )}

            {/* Sub-label for status */}
            <div className="absolute -bottom-5 text-[9px] font-mono font-bold tracking-widest text-slate-400 pointer-events-none drop-shadow-md whitespace-nowrap">
                {isHome && 'GATEWAY'}
                {isCleared && 'HACKED'}
                {isLocked && 'ENCRYPTED'}
                {isActive && server.type}
                {isReachable && <span className="text-amber-400">REACHABLE</span>}
            </div>
        </motion.div>
    );
};

const TopologyToggleButton = ({ isOpen, onClick }: { isOpen: boolean, onClick: () => void }) => {
    return (
        <div className="w-full flex justify-center z-[110] pointer-events-none">
            <motion.button
                onClick={onClick}
                className={clsx(
                    "pointer-events-auto bg-zinc-950 rounded-xl flex items-center justify-center gap-3 transition-colors text-white group",
                    isOpen
                        ? "border border-green-500/50 px-8 py-2 hover:bg-phosphor/5 shadow-[0_0_15px_rgba(57,255,122,0.2)]"
                        : "border border-zinc-800/80 px-8 py-2 hover:bg-zinc-900 shadow-lg shadow-black/50"
                )}
            >
                <Globe className={clsx(
                    "w-5 h-5 transition-all duration-500",
                    isOpen ? "text-phosphor drop-shadow-[0_0_8px_rgba(57,255,122,0.8)]" : "text-white/40 group-hover:text-phosphor/70"
                )} />
                <span className={clsx(
                    "text-sm font-mono font-bold tracking-[0.2em] transition-colors uppercase",
                    isOpen ? "text-white group-hover:text-emerald-200" : "text-white/80 group-hover:text-white"
                )}>
                    {isOpen ? 'Close Topology' : 'View Topology'}
                </span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-white/80" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
            </motion.button>
        </div>
    );
};

export const NetworkMap = () => {
    // Consume normalized node state from the ViewModel for temporal decoupling.
    const { nodes, activeServerIds } = useViewModel();
    const isOpen = useUIStore(state => state.isTopologyOpen);
    const setIsOpen = useUIStore(state => state.setIsTopologyOpen);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [showHiddenEdges, setShowHiddenEdges] = useState(false);

    // Derived: all nodes as an array (for topology rendering)
    const networkGraph = useMemo(() => Object.values(nodes), [nodes]);

    // Derived: active server objects (for the server card list)
    const activeServers = useMemo(() => {
        return activeServerIds.map(id => nodes[id]).filter(Boolean) as NetworkNode[];
    }, [nodes, activeServerIds]);

    // Derived: revealed nodes that are not yet active and not the HOME node
    const reachableServers = useMemo(() => {
        return Object.values(nodes).filter(
            node => node.visibility === 'REVEALED' && !activeServerIds.includes(node.id) && node.type !== 'HOME'
        ) as NetworkNode[];
    }, [nodes, activeServerIds]);

    const nodeCoords = useMemo(() => {
        if (!networkGraph || networkGraph.length === 0) return {};

        const coords: Record<string, { x: number, y: number }> = {};
        const maxY = Math.max(0, ...networkGraph.map(n => n.gridY || 0));

        networkGraph.forEach((node) => {
            let x = 50;
            if (node.gridX === 0) x = 20;
            else if (node.gridX === 1) x = 50;
            else if (node.gridX === 2) x = 80;

            const y = maxY > 0 ? 85 - ((node.gridY || 0) / maxY) * 65 : 85;
            coords[node.id] = { x, y };
        });

        return coords;
    }, [networkGraph]);


    if (!networkGraph || networkGraph.length === 0) return null;

    // Derive node visual state purely from the SSOT — no cross-referencing two arrays.
    const getNodeState = (node: NetworkNode): 'HOME' | 'CLEARED' | 'ACTIVE' | 'REACHABLE' | 'LOCKED' => {
        if (node.type === 'HOME') return 'HOME';
        if (node.status === 'HACKED') return 'CLEARED';
        // A node is ACTIVE if it appears in the activeServerIds index
        if (activeServerIds.includes(node.id)) return 'ACTIVE';
        // A node is REACHABLE if it has been revealed but not yet accessed
        if (node.visibility === 'REVEALED') return 'REACHABLE';
        return 'LOCKED';
    };

    const handleAccessNode = () => {
        if (!selectedNodeId) return;
        Dispatch({ type: 'ACCESS_NODE', payload: { nodeId: selectedNodeId } });
        setSelectedNodeId(null);
    };

    return (
        <LayoutGroup>
            <CountermeasureToastLayer />
            <div className="w-full flex flex-col items-center pt-[clamp(0.5rem,2vh,1.5rem)] gap-[clamp(0.25rem,1vh,0.75rem)] pointer-events-none">
                <TopologyToggleButton isOpen={isOpen} onClick={() => { setIsOpen(!isOpen); setSelectedNodeId(null); }} />

                {!isOpen && (
                    <div className="w-full flex justify-center z-40">
                        <div className="w-full flex gap-4 px-4 items-start justify-start md:justify-center overflow-x-auto overflow-y-visible max-w-full pointer-events-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <AnimatePresence>
                                {[...activeServers]
                                    .filter(s => s.type !== 'HOME')
                                    .sort((a, b) => a.gridX - b.gridX)
                                    .map((server) => (
                                        <ServerCard key={server.id} server={server} />
                                    ))}
                                {[...reachableServers]
                                    .sort((a, b) => a.gridX - b.gridX)
                                    .map((server) => (
                                        <ReachableServerCard key={server.id} server={server} />
                                    ))}
                            </AnimatePresence>
                            {activeServers.filter(s => s.type !== 'HOME').length === 0 && reachableServers.length === 0 && (
                                <div className="text-white/30 text-sm font-mono animate-pulse">
                                    SCANNING FOR TARGETS...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 w-screen h-screen z-[100] bg-black pointer-events-auto overflow-hidden flex flex-col"
                    >
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

                                    // Hide diagonal edges until the parent node is hacked (unless debug mode is on).
                                    const childNode = nodes[childId];
                                    const isHorizontalEdge = childNode && childNode.gridX !== node.gridX;
                                    const isHiddenEdge = isHorizontalEdge && node.type !== 'HOME' && node.status !== 'HACKED';
                                    if (isHiddenEdge && !showHiddenEdges) {
                                        return null;
                                    }

                                    const isParentCleared = node.status === 'HACKED' || node.type === 'HOME';
                                    const isChildActive = activeServerIds.includes(childId);
                                    const isChildActiveOrHacked = isChildActive || (childNode && childNode.status === 'HACKED');
                                    const isActiveConnection = isParentCleared && isChildActiveOrHacked && !isHiddenEdge;

                                    const STEP_TIME = 0.5;
                                    const CYCLE_TIME = 4;
                                    const pulseDelay = (node.gridY || 0) * STEP_TIME;

                                    const edgeStroke = isHiddenEdge
                                        ? "rgba(251, 191, 36, 0.25)"
                                        : isActiveConnection ? "rgba(57, 255, 122, 0.5)" : "rgba(57, 255, 122, 0.12)";
                                    const edgeWidth = isActiveConnection ? "3" : "1.5";
                                    const edgeDash = isHiddenEdge ? "3 6" : !isActiveConnection ? "5 5" : "none";

                                    return (
                                        <g key={`${node.id}-${childId}`}>
                                            <line
                                                x1={`${p1.x}%`} y1={`${p1.y}%`}
                                                x2={`${p2.x}%`} y2={`${p2.y}%`}
                                                stroke={edgeStroke}
                                                strokeWidth={edgeWidth}
                                                strokeDasharray={edgeDash}
                                            />
                                            {isActiveConnection && (
                                                <motion.circle
                                                    r="4"
                                                    fill="#39ff7a"
                                                    style={{ filter: 'drop-shadow(0 0 6px #39ff7a)' }}
                                                    initial={{ cx: `${p1.x}%`, cy: `${p1.y}%`, opacity: 0 }}
                                                    animate={{ cx: `${p2.x}%`, cy: `${p2.y}%`, opacity: [0, 1, 1, 0] }}
                                                    transition={{
                                                        duration: STEP_TIME,
                                                        repeat: Infinity,
                                                        repeatDelay: CYCLE_TIME - STEP_TIME,
                                                        delay: pulseDelay,
                                                        ease: "linear",
                                                        times: [0, 0.1, 0.9, 1]
                                                    }}
                                                />
                                            )}
                                        </g>
                                    );
                                });
                            })}
                        </svg>

                        {/* Z-20: Absolute Positioned Node Circles Layer */}
                        {networkGraph.map(node => {
                            const coord = nodeCoords[node.id];
                            if (!coord) return null;
                            const nodeState = getNodeState(node);
                            const isReachable = nodeState === 'REACHABLE';
                            const isSelected = selectedNodeId === node.id;
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
                                    <CircularNodeIcon
                                        server={node}
                                        state={nodeState}
                                        isSelected={isSelected}
                                        onClick={isReachable ? () => setSelectedNodeId(prev => prev === node.id ? null : node.id) : undefined}
                                    />
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.button
                                                initial={{ opacity: 0, y: -4, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                                                transition={{ duration: 0.15 }}
                                                onClick={handleAccessNode}
                                                className="absolute top-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-bold text-[10px] tracking-widest uppercase rounded whitespace-nowrap hover:bg-amber-500/30 hover:text-amber-200 hover:border-amber-300 transition-colors shadow-[0_0_12px_rgba(251,191,36,0.25)] active:scale-95 pointer-events-auto"
                                            >
                                                ACCESS NODE
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {/* Z-30: Debug toggle */}
                        <button
                            onClick={() => setShowHiddenEdges(v => !v)}
                            className={clsx(
                                "absolute bottom-4 right-4 z-30 px-3 py-1.5 font-mono font-bold text-[10px] tracking-widest uppercase rounded border transition-colors",
                                showHiddenEdges
                                    ? "bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30"
                                    : "bg-zinc-900/80 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-400"
                            )}
                        >
                            {showHiddenEdges ? 'DBG: ON' : 'DBG: OFF'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </LayoutGroup>
    );
};
