import { produce } from 'immer';
import { calculateServerProgress } from '../game-logic';
import type { NetworkNode, NodeRecord, Card, Grid, CellColor } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';
import { mergeDeltas } from './deltaHelpers';
import { applyCountermeasure } from './countermeasureExecutor';
import type { CountermeasureContext } from './countermeasureExecutor';

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

    // State Staging: Clone the grid to allow in-place mutation by countermeasures
    const currentGrid = (deltas.grid ?? snapshot.grid) as Grid;
    const mutableGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    let gridModified = false;

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
                    const context: CountermeasureContext = {
                        grid: mutableGrid,
                        playerStats: newPlayerStats,
                        nodes: nodeDraft, // Immer draft of nodes SSOT
                        activeServerIds,
                        pendingNetDamage: deltas.pendingNetDamage || snapshot.pendingNetDamage || 0
                    };

                    applyCountermeasure(cm, context, id);

                    // Sync mutable values back to deltas
                    deltas.pendingNetDamage = context.pendingNetDamage;
                    gridModified = true;
                }
            }

            // Commit the updated server progress back into the SSOT
            Object.assign(node, result.updatedServer);
        }
    });

    const isResolvingNetDamage = (deltas.pendingNetDamage || 0) > 0;

    return mergeDeltas(deltas, {
        nodes: newNodes,
        grid: gridModified ? mutableGrid : undefined,
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
