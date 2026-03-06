import { calculateServerProgress } from '../game-logic';
import { nodeRegistry } from '../registry/NodeRegistry';
import type { NetworkNode, Card } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';
import { mergeDeltas } from './deltaHelpers';

type SystemFunction = (snapshot: ReadonlyDeep<GameSnapshot>, deltas: StateDeltas) => StateDeltas;

export const serverProgressionSystem: SystemFunction = (snapshot, deltas) => {
    if (!deltas.harvestedCells || deltas.harvestedCells.length === 0) {
        return deltas;
    }

    const newEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];
    const newPlayerStats = { ...(deltas.playerStats || snapshot.playerStats) };
    const newHand = deltas.hand ? [...deltas.hand] : [...snapshot.hand];
    const newDeck = deltas.deck ? [...deltas.deck] : [...snapshot.deck];
    const newTrashPile = deltas.trashPile ? [...deltas.trashPile] : [...snapshot.trashPile];

    const activeServers = deltas.activeServers || snapshot.activeServers;
    const newActiveServers: NetworkNode[] = [];

    activeServers.forEach((readonlyServer: any) => {
        const server = { ...readonlyServer } as NetworkNode;
        const result = calculateServerProgress(server, deltas.harvestedCells!);

        if (result.pushedCountermeasures.length > 0) {
            newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'error', durationMs: 600 });
            for (const cm of result.pushedCountermeasures) {
                if (cm.type === 'TRACE') {
                    newPlayerStats.trace = Math.min(100, newPlayerStats.trace + cm.value);
                } else if (cm.type === 'HARDWARE_DAMAGE') {
                    newPlayerStats.hardwareHealth = Math.max(0, newPlayerStats.hardwareHealth - cm.value);
                } else if (cm.type === 'NET_DAMAGE') {
                    for (let p = 0; p < cm.value; p++) {
                        if (newHand.length > 0) {
                            const idx = Math.floor(Math.random() * newHand.length);
                            const trashed = newHand.splice(idx, 1)[0] as Card;
                            newTrashPile.push(trashed);
                        } else if (newDeck.length > 0) {
                            const trashed = newDeck.pop() as Card;
                            newTrashPile.push(trashed);
                        }
                    }
                }
            }
        }

        newActiveServers.push(result.updatedServer);
    });

    return mergeDeltas(deltas, {
        activeServers: newActiveServers,
        playerStats: newPlayerStats,
        hand: newHand as Card[],
        deck: newDeck as Card[],
        trashPile: newTrashPile as Card[],
        events: newEvents.length > 0 ? newEvents : undefined
    });
};

export const networkGraphSystem: SystemFunction = (snapshot, deltas) => {
    if (!deltas.activeServers) {
        return deltas;
    }

    const newEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];
    const newPlayerStats = { ...(deltas.playerStats || snapshot.playerStats) };
    const remainingServers: NetworkNode[] = [];
    const newDeepMap = deltas.deepMap ? [...deltas.deepMap] : [...snapshot.deepMap];
    let hasTargetHacked = false;

    deltas.activeServers.forEach((s) => {
        if (s.status !== 'HACKED') {
            remainingServers.push(s);
        } else {
            const oldServer = snapshot.activeServers.find((oldS: any) => oldS.id === s.id);
            if (oldServer && oldServer.status !== 'HACKED') {
                newPlayerStats.credits += s.difficulty * 10;
                newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'hack', durationMs: 500 });

                if (s.type === 'MAINFRAME') {
                    hasTargetHacked = true;
                } else {
                    const numChildren = Math.random() < 0.5 ? 1 : 2;
                    for (let i = 0; i < numChildren; i++) {
                        const nextDifficulty = s.difficulty + 1;
                        const poolId = nodeRegistry.getRandomPoolId();
                        const newNode = nodeRegistry.selectNode(poolId, nextDifficulty);
                        newDeepMap.push(newNode);
                    }
                }
            }
        }
    });

    while (remainingServers.length < 3 && newDeepMap.length > 0) {
        remainingServers.push(newDeepMap.shift() as NetworkNode);
    }

    return mergeDeltas(deltas, {
        activeServers: remainingServers,
        deepMap: newDeepMap as NetworkNode[],
        playerStats: newPlayerStats,
        events: newEvents.length > 0 ? newEvents : undefined,
        ...(hasTargetHacked ? { targetHacked: true } : {})
    });
};

export const gameStateSystem: SystemFunction = (snapshot, deltas) => {
    const stats = deltas.playerStats || snapshot.playerStats;
    const hand = deltas.hand || snapshot.hand;
    const deck = deltas.deck || snapshot.deck;
    const targetHacked = deltas.targetHacked;

    let newGameState = deltas.gameState || snapshot.gameState;
    const newEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];

    if (stats.hardwareHealth <= 0 || stats.trace >= 100 || (hand.length === 0 && deck.length === 0)) {
        newGameState = 'GAME_OVER';
    } else if (targetHacked) {
        newGameState = 'VICTORY';
    }

    if (newGameState === 'GAME_OVER' && snapshot.gameState !== 'GAME_OVER' && deltas.gameState !== 'GAME_OVER') {
        newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'game_over', durationMs: 1500 });
    } else if (newGameState === 'VICTORY' && snapshot.gameState !== 'VICTORY' && deltas.gameState !== 'VICTORY') {
        newEvents.push({ type: 'AUDIO_PLAY_SFX', payload: 'victory', durationMs: 2000 });
    }

    return mergeDeltas(deltas, {
        gameState: newGameState,
        events: newEvents.length > 0 ? newEvents : undefined
    });
};

export const applySystemsPipeline = (snapshot: ReadonlyDeep<GameSnapshot>, deltas: StateDeltas): StateDeltas => {
    let currentDeltas = deltas;
    currentDeltas = serverProgressionSystem(snapshot, currentDeltas);
    currentDeltas = networkGraphSystem(snapshot, currentDeltas);
    currentDeltas = gameStateSystem(snapshot, currentDeltas);

    const { harvestedCells, targetHacked, ...finalDeltas } = currentDeltas;
    return finalDeltas;
};
