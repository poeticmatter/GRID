import { useGridStore } from '../../store/useGridStore';
import { useGameStore } from '../../store/useGameStore';
import { useUIStore } from '../../store/useUIStore';
import type { SpatialMetrics } from '../../store/useUIStore';
import { useTargetingStore } from '../../store/useTargetingStore';
import { checkPatternFit, getAffectedCells, rotatePattern } from '../../engine/grid-logic';
import type { EffectCut } from '../../engine/types';
import { motion, AnimatePresence } from 'framer-motion';

const getPerimeterPath = (cells: { x: number, y: number }[], metrics: SpatialMetrics) => {
    if (cells.length === 0) return '';
    const edges = new Map<string, string[]>();

    const addEdge = (x1: number, y1: number, x2: number, y2: number) => {
        const key1 = `${x1},${y1}`;
        const key2 = `${x2},${y2}`;
        const revArr = edges.get(key2);
        if (revArr && revArr.includes(key1)) {
            const idx = revArr.indexOf(key1);
            revArr.splice(idx, 1);
            if (revArr.length === 0) edges.delete(key2);
        } else {
            const arr = edges.get(key1) || [];
            arr.push(key2);
            edges.set(key1, arr);
        }
    };

    cells.forEach(({ x, y }) => {
        addEdge(x, y, x + 1, y);
        addEdge(x + 1, y, x + 1, y + 1);
        addEdge(x + 1, y + 1, x, y + 1);
        addEdge(x, y + 1, x, y);
    });

    let pathString = '';

    while (edges.size > 0) {
        const startKey = Array.from(edges.keys())[0];
        let currNode = startKey;
        const [startX, startY] = startKey.split(',').map(Number);

        const { cellSize, gapSize } = metrics;
        const stepOffset = cellSize + gapSize;
        const padding = gapSize / 2;

        pathString += `M ${startX * stepOffset - padding} ${startY * stepOffset - padding} `;

        while (true) {
            const outArr = edges.get(currNode);
            if (!outArr || outArr.length === 0) break;

            const nextNode = outArr.pop()!;
            if (outArr.length === 0) edges.delete(currNode);

            const [nx, ny] = nextNode.split(',').map(Number);
            pathString += `L ${nx * stepOffset - padding} ${ny * stepOffset - padding} `;
            currNode = nextNode;
        }
        pathString += 'Z ';
    }

    return pathString.trim();
};

const getInternalConnectionsPath = (cells: { x: number, y: number }[], metrics: SpatialMetrics) => {
    const cellSet = new Set(cells.map(c => `${c.x},${c.y}`));
    let d = '';
    const { cellSize, gapSize } = metrics;
    const stepOffset = cellSize + gapSize;
    const centerOffset = cellSize / 2;

    cells.forEach(({ x, y }) => {
        const cx = x * stepOffset + centerOffset;
        const cy = y * stepOffset + centerOffset;

        if (cellSet.has(`${x + 1},${y}`)) {
            d += `M ${cx} ${cy} L ${cx + stepOffset} ${cy} `;
        }
        if (cellSet.has(`${x},${y + 1}`)) {
            d += `M ${cx} ${cy} L ${cx} ${cy + stepOffset} `;
        }
    });
    return d.trim();
};

export const GhostOverlay = () => {
    const { grid } = useGridStore();
    const { gameState, effectQueue } = useGameStore();
    const { rotation, spatialMetrics } = useUIStore();
    const hoveredCell = useTargetingStore(state => state.hoveredCoordinate);

    const activeEffect = effectQueue[0]?.effect;

    if (gameState !== 'EFFECT_RESOLUTION' || !activeEffect || activeEffect.type !== 'CUT') return null;

    const cutEffect = activeEffect as EffectCut;
    const rotatedPattern = rotatePattern(cutEffect.pattern, rotation);
    let affected: { x: number, y: number }[] = [];
    let valid = false;

    if (hoveredCell) {
        valid = checkPatternFit(grid, rotatedPattern, hoveredCell.x, hoveredCell.y);
        affected = getAffectedCells(grid, rotatedPattern, hoveredCell.x, hoveredCell.y);
    }

    const perimeterPath = getPerimeterPath(affected, spatialMetrics);
    const internalPath = getInternalConnectionsPath(affected, spatialMetrics);

    return (
        <div className="absolute inset-2 z-20 pointer-events-none">
            <AnimatePresence>
                {hoveredCell && affected.length > 0 && (
                    <motion.svg
                        className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <g className={valid ? "text-emerald-400" : "text-rose-500"}>
                            <defs>
                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                            </defs>

                            <motion.path
                                d={perimeterPath}
                                fill="currentColor"
                                fillOpacity={valid ? 0.15 : 0.25}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            />

                            {internalPath && (
                                <motion.path
                                    d={internalPath}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeOpacity="0.8"
                                    animate={{
                                        strokeOpacity: [0.3, 0.8, 0.3]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}

                            {affected.map((c, i) => (
                                <motion.circle
                                    key={`node-${c.x}-${c.y}`}
                                    cx={c.x * (spatialMetrics.cellSize + spatialMetrics.gapSize) + (spatialMetrics.cellSize / 2)}
                                    cy={c.y * (spatialMetrics.cellSize + spatialMetrics.gapSize) + (spatialMetrics.cellSize / 2)}
                                    r={spatialMetrics.nodeRadius}
                                    fill="currentColor"
                                    filter="url(#glow)"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                                />
                            ))}

                            <motion.path
                                d={perimeterPath}
                                stroke="currentColor"
                                strokeWidth="3"
                                fill="none"
                                filter="url(#glow)"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            />
                        </g>
                    </motion.svg>
                )}
            </AnimatePresence>
        </div>
    );
};

