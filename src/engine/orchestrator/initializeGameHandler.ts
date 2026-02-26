import { createGrid } from '../grid-logic';
import { createStartingDeck } from '../game-logic';
import { SERVER_GRAPH, STARTING_NODES } from '../graph-logic';
import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';
import type { Card, ServerNode } from '../types';

export const handleInitializeGame = (_snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
    const grid = createGrid(6, 6);
    const deck = createStartingDeck();

    const hand: Card[] = [...deck];
    const currentDeck: Card[] = [];

    // Generate Servers
    const activeServers: ServerNode[] = STARTING_NODES.map(id => {
        const node = SERVER_GRAPH[id];
        return {
            ...node,
            requirements: {
                colors: { ...node.requirements.colors },
                symbols: { ...(node.requirements.symbols || {}) }
            },
            progress: {
                colors: { ...node.progress.colors },
                symbols: { ...(node.progress.symbols || {}) }
            }
        };
    });

    return {
        grid,
        deck: currentDeck,
        hand,
        discardPile: [],
        trashPile: [],
        activeServers,
        deepMap: [],
        playerStats: {
            hardwareHealth: 3,
            maxHardwareHealth: 3,
            trace: 0,
            credits: 0,
        },
        gameState: 'PLAYING',
        turn: 1,
        selectedCardId: null,
        rotation: 0,
    };
};
