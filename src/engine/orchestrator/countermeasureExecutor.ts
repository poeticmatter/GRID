import { produce } from 'immer';
import type { Grid, PlayerStats, NodeRecord, CellColor, CountermeasurePayload } from '../types';

export interface CountermeasureContext {
    grid: Grid;
    playerStats: PlayerStats;
    nodes: NodeRecord;
    activeServerIds: string[];
    pendingNetDamage: number;
}

/**
 * Centrally executes a countermeasure effect, mutating the provided context.
 * Accepts any CountermeasurePayload — requiredSymbols is a trigger concern,
 * not an execution concern, so it is intentionally excluded from this signature.
 */
export function applyCountermeasure(
    cm: CountermeasurePayload,
    context: CountermeasureContext,
    sourceNodeId: string
) {
    const { grid, playerStats, nodes, activeServerIds } = context;

    switch (cm.type) {
        case 'TRACE':
            playerStats.trace = Math.min(playerStats.maxTrace ?? 15, playerStats.trace + cm.value);
            break;

        case 'HARDWARE_DAMAGE':
            playerStats.hardwareHealth = Math.max(0, playerStats.hardwareHealth - cm.value);
            break;

        case 'NET_DAMAGE':
            context.pendingNetDamage += cm.value;
            break;

        case 'VIRUS': {
            // VIRUS: Apply viral infection flag to random available cells.
            // BUG FIX: Untouched cells are 'LOCKED'.
            const candidates: { x: number, y: number }[] = [];
            grid.forEach((row, y) => row.forEach((cell, x) => {
                if (cell.state === 'LOCKED' && !cell.hasVirus) candidates.push({ x, y });
            }));
            
            const count = Math.min(cm.value, candidates.length);
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * candidates.length);
                const { x, y } = candidates.splice(idx, 1)[0];
                grid[y][x].hasVirus = true;
            }
            break;
        }

        case 'CORRUPT': {
            // CORRUPT: Corrupt random cells — removes color, makes them visually noisy,
            // and blocks them from being targeted by RUN (same as CORRUPTED state).
            const candidates: { x: number, y: number }[] = [];
            grid.forEach((row, y) => row.forEach((cell, x) => {
                if (cell.state === 'LOCKED') candidates.push({ x, y });
            }));

            const count = Math.min(cm.value, candidates.length);
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * candidates.length);
                const { x, y } = candidates.splice(idx, 1)[0];
                const cell = grid[y][x];
                cell.state = 'CORRUPTED';
                cell.hasVirus = false;
            }
            break;
        }

        case 'NOISE': {
            // NOISE: Inject additional requirements into target nodes.
            const otherActiveIds = activeServerIds.filter(sid => sid !== sourceNodeId);
            const targetId = otherActiveIds.length > 0 
                ? otherActiveIds[Math.floor(Math.random() * otherActiveIds.length)]
                : sourceNodeId;
            
            const targetNode = nodes[targetId];
            if (targetNode) {
                nodes[targetId] = produce(targetNode, (draft: any) => {
                    const layers = Object.keys(draft.layers) as CellColor[];
                    if (layers.length > 0) {
                        const color = layers[Math.floor(Math.random() * layers.length)];
                        draft.layers[color].push(cm.value);
                        if (draft.progress[color]) {
                            draft.progress[color].push(false);
                        }
                    }
                });
            }
            break;
        }

        default:
            console.warn(`Unknown countermeasure type: ${cm.type}`);
            break;
    }
}
