import { createGrid } from '../grid-logic';
import { createStartingDeck } from '../game-logic';
import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';
import type { Card, NetworkNode } from '../types';
import { nodeRegistry } from '../registry/NodeRegistry';

export const handleInitializeGame = (_snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
    const grid = createGrid(6, 6);
    const deck = createStartingDeck();

    const hand: Card[] = [...deck];
    const currentDeck: Card[] = [];

    // Generate Servers
    const activeServers: NetworkNode[] = [
        nodeRegistry.selectNode(nodeRegistry.getRandomPoolId(), 1),
        nodeRegistry.selectNode(nodeRegistry.getRandomPoolId(), 2),
        nodeRegistry.selectNode(nodeRegistry.getRandomPoolId(), 1)
    ];

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
