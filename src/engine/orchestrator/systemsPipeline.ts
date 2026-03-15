import { produce } from 'immer';
import { calculateServerProgress } from '../game-logic';
import type { NetworkNode, NodeRecord, Card, Grid, CellColor } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';
import { mergeDeltas } from './deltaHelpers';

type SystemFunction = (snapshot: ReadonlyDeep<GameSnapshot>, deltas: StateDeltas) => StateDeltas;

// ---------------------------------------------------------------------------
// serverProgressionSystem
// Applies harvested cells to all active servers, computing countermeasure
// penalties. Mutates `nodes` via immer draft; never duplicates node objects.
// ---------------------------------------------------------------------------
export const serverProgressionSystem: SystemFunction = (snapshot, deltas) => {
    if (!deltas.harvestedCells || deltas.harvestedCells.length === 0) {
        return deltas;
    }

    const newEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];
    const newPlayerStats = { ...(deltas.playerStats || snapshot.playerStats) };
    const newHand = deltas.hand ? [...deltas.hand] : [...snapshot.hand];
    const newDeck = deltas.deck ? [...deltas.deck] : [...snapshot.deck];
    const newTrashPile = deltas.trashPile ? [...deltas.trashPile] : [...snapshot.trashPile];

    const baseGrid = (deltas.grid ?? snapshot.grid) as Grid;
    let gridModified = false;

    // We draft the grid first so we can modify it during countermeasure resolution
    const newGrid = produce(baseGrid, (gridDraft: any) => {
        const baseNodes: NodeRecord = deltas.nodes ?? (snapshot.nodes as NodeRecord);
        const activeServerIds: string[] = deltas.activeServerIds ?? (snapshot.activeServerIds as string[]);

        const newNodes = produce(baseNodes, (nodeDraft: any) => {
            for (const id of activeServerIds) {
                const node = nodeDraft[id];
                if (!node) continue;

                const result = calculateServerProgress(node as NetworkNode, deltas.harvestedCells!);

                // Apply countermeasure penalties
                if (result.pushedCountermeasures.length > 0) {
                    newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'error' });
                    for (const cm of result.pushedCountermeasures) {
                        if (cm.type === 'TRACE') {
                            newPlayerStats.trace = Math.min(newPlayerStats.maxTrace ?? 15, newPlayerStats.trace + cm.value);
                        } else if (cm.type === 'HARDWARE_DAMAGE') {
                            newPlayerStats.hardwareHealth = Math.max(0, newPlayerStats.hardwareHealth - cm.value);
                        } else if (cm.type === 'NET_DAMAGE') {
                            const tally = (deltas.pendingNetDamage || snapshot.pendingNetDamage || 0) + cm.value;
                            deltas.pendingNetDamage = tally;
                        } else if (cm.type === 'SCRAMBLE') {
                            gridModified = true;
                            const defaultCells: Array<{x: number, y: number}> = [];
                            gridDraft.forEach((row: any, y: number) => row.forEach((cell: any, x: number) => {
                                if (cell.state === 'DEFAULT') defaultCells.push({ x, y });
                            }));
                            for (let i = 0; i < cm.value && defaultCells.length > 0; i++) {
                                const idx = Math.floor(Math.random() * defaultCells.length);
                                const { x, y } = defaultCells.splice(idx, 1)[0];
                                const cell = gridDraft[y][x];
                                cell.state = 'CORRUPTED';
                                cell.symbol = 'NONE';
                                cell.hasVirus = false;
                                // color is left as is, but hidden by the CORRUPTED state visual.
                            }
                        } else if (cm.type === 'NOISE') {
                            const otherActiveIds = activeServerIds.filter(sid => sid !== id);
                            const targetId = otherActiveIds.length > 0 
                                ? otherActiveIds[Math.floor(Math.random() * otherActiveIds.length)]
                                : id;
                            
                            const targetNode = nodeDraft[targetId];
                            if (targetNode) {
                                const colors = Object.keys(targetNode.layers) as CellColor[];
                                if (colors.length > 0) {
                                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                                    const reqs = targetNode.layers[randomColor];
                                    if (reqs) {
                                        reqs.push(cm.value);
                                        if (targetNode.progress[randomColor]) {
                                            targetNode.progress[randomColor]!.push(false);
                                        }
                                    }
                                }
                            }
                        } else if (cm.type === 'VIRUS') {
                            gridModified = true;
                            const candidates: Array<{x: number, y: number}> = [];
                            gridDraft.forEach((row: any, y: number) => row.forEach((cell: any, x: number) => {
                                if (cell.state === 'DEFAULT' && !cell.hasVirus) candidates.push({ x, y });
                            }));
                            for (let i = 0; i < cm.value && candidates.length > 0; i++) {
                                const idx = Math.floor(Math.random() * candidates.length);
                                const { x, y } = candidates.splice(idx, 1)[0];
                                gridDraft[y][x].hasVirus = true;
                            }
                        }
                    }
                }

                // Commit the updated server back into the SSOT
                Object.assign(node, result.updatedServer);
            }
        });

        // Store the intermediate nodes result back to deltas so we can use it in mergeDeltas later
        (deltas as any)._intermediateNodes = newNodes;
    });

    const isResolvingNetDamage = (deltas.pendingNetDamage || 0) > 0;

    return mergeDeltas(deltas, {
        nodes: (deltas as any)._intermediateNodes,
        grid: gridModified ? newGrid : undefined,
        playerStats: newPlayerStats,
        hand: newHand as Card[],
        deck: newDeck as Card[],
        trashPile: newTrashPile as Card[],
        gameState: isResolvingNetDamage ? 'RESOLVING_NET_DAMAGE' : undefined,
        effectQueue: isResolvingNetDamage ? [] : undefined,
        activeCardId: isResolvingNetDamage ? null : undefined,
        events: newEvents.length > 0 ? newEvents : undefined
    });
};

// ---------------------------------------------------------------------------
// networkGraphSystem
// After server progression, determines: which nodes became hacked, which
// children to promote, and which branches to mark BYPASSED.
// Operates exclusively on the `nodes` dict — no separate activeServers array.
// ---------------------------------------------------------------------------
export const networkGraphSystem: SystemFunction = (snapshot, deltas) => {
    // Only runs if nodes were mutated this tick
    if (!deltas.nodes) {
        return deltas;
    }

    const newEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];
    const newPlayerStats = { ...(deltas.playerStats || snapshot.playerStats) };
    let hasTargetHacked = false;
    const newlyHackedNodeIds: string[] = [];

    // Determine which active servers transitioned to HACKED this tick
    const baseNodes = deltas.nodes;
    const activeServerIds: string[] = deltas.activeServerIds ?? (snapshot.activeServerIds as string[]);

    for (const id of activeServerIds) {
        const updated = baseNodes[id];
        const previous = snapshot.nodes[id];
        if (
            updated &&
            previous &&
            updated.status === 'HACKED' &&
            previous.status !== 'HACKED' &&
            previous.status !== 'BYPASSED'
        ) {
            newlyHackedNodeIds.push(id);
            newPlayerStats.credits += updated.difficulty * 10;
            newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'hack' });
            if (updated.type === 'MAINFRAME') {
                hasTargetHacked = true;
            }
        }
    }

    if (newlyHackedNodeIds.length === 0) {
        return mergeDeltas(deltas, {
            playerStats: newPlayerStats,
            events: newEvents.length > 0 ? newEvents : undefined,
            ...(hasTargetHacked ? { targetHacked: true } : {})
        });
    }

    // Process tree progression: remove hacked nodes, promote children
    let nextActiveIds = [...activeServerIds];

    const newNodes = produce(baseNodes, (draft) => {
        for (const hackedId of newlyHackedNodeIds) {
            const hackedNode = draft[hackedId];
            if (!hackedNode) continue;

            // Remove from active set
            nextActiveIds = nextActiveIds.filter(id => id !== hackedId);

            // Promote immediate unhacked, non-bypassed children
            for (const childId of hackedNode.children) {
                const child = draft[childId];
                if (
                    child &&
                    child.status !== 'HACKED' &&
                    child.status !== 'BYPASSED' &&
                    !nextActiveIds.includes(childId)
                ) {
                    child.visibility = 'REVEALED';
                    nextActiveIds.push(childId);
                }
            }
        }

        // Bypass redundant branches
        const memo = new Map<string, boolean>();
        const isRedundant = (nodeId: string, visited: Set<string>): boolean => {
            if (memo.has(nodeId)) return memo.get(nodeId)!;
            if (visited.has(nodeId)) return false;

            const node = draft[nodeId];
            if (!node) return false;

            if (node.type === 'MAINFRAME' || node.type === 'HOME' || node.status === 'HACKED') {
                memo.set(nodeId, false);
                return false;
            }
            if (node.status === 'BYPASSED') {
                memo.set(nodeId, true);
                return true;
            }

            visited.add(nodeId);

            let redundant: boolean;
            if (node.children.length === 0) {
                redundant = false; // terminal destination is always integral
            } else {
                redundant = node.children.every(childId => {
                    const child = draft[childId];
                    if (!child) return true;
                    if (child.status === 'HACKED') return true;
                    if (nextActiveIds.includes(childId)) return true;
                    return isRedundant(childId, visited);
                });
            }

            visited.delete(nodeId);
            memo.set(nodeId, redundant);
            return redundant;
        };

        for (const nodeId of Object.keys(draft)) {
            const node = draft[nodeId];
            if (node && node.type !== 'HOME' && node.status !== 'HACKED') {
                if (isRedundant(nodeId, new Set<string>())) {
                    node.status = 'BYPASSED';
                    nextActiveIds = nextActiveIds.filter(id => id !== nodeId);
                }
            }
        }
    });

    return mergeDeltas(deltas, {
        nodes: newNodes,
        activeServerIds: nextActiveIds,
        playerStats: newPlayerStats,
        events: newEvents.length > 0 ? newEvents : undefined,
        ...(hasTargetHacked ? { targetHacked: true } : {})
    });
};

// ---------------------------------------------------------------------------
// gameStateSystem
// Evaluates win/loss conditions and transitions gameState accordingly.
// ---------------------------------------------------------------------------
export const gameStateSystem: SystemFunction = (snapshot, deltas) => {
    const stats = deltas.playerStats || snapshot.playerStats;
    const hand = deltas.hand || snapshot.hand;
    const deck = deltas.deck || snapshot.deck;
    const targetHacked = deltas.targetHacked;

    let newGameState = deltas.gameState || snapshot.gameState;
    const newEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];

    if (stats.hardwareHealth <= 0 || stats.trace >= stats.maxTrace || (hand.length === 0 && deck.length === 0)) {
        newGameState = 'GAME_OVER';
    } else if (targetHacked) {
        newGameState = 'VICTORY';
    }

    if (newGameState === 'GAME_OVER' && snapshot.gameState !== 'GAME_OVER' && deltas.gameState !== 'GAME_OVER') {
        newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'game_over' });
    } else if (newGameState === 'VICTORY' && snapshot.gameState !== 'VICTORY' && deltas.gameState !== 'VICTORY') {
        newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'victory' });
    }

    return mergeDeltas(deltas, {
        gameState: newGameState,
        events: newEvents.length > 0 ? newEvents : undefined
    });
};

// ---------------------------------------------------------------------------
// applySystemsPipeline
// Runs all systems in order, strips transient fields before returning.
// ---------------------------------------------------------------------------
export const applySystemsPipeline = (snapshot: ReadonlyDeep<GameSnapshot>, deltas: StateDeltas): StateDeltas => {
    let currentDeltas = deltas;
    currentDeltas = serverProgressionSystem(snapshot, currentDeltas);
    currentDeltas = networkGraphSystem(snapshot, currentDeltas);
    currentDeltas = gameStateSystem(snapshot, currentDeltas);

    const { harvestedCells, targetHacked, ...finalDeltas } = currentDeltas;
    return finalDeltas;
};
