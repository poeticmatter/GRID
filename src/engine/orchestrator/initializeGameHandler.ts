import { createGrid } from '../grid-logic';
import { createStartingDeck } from '../game-logic';
import { generateGraph } from '../graph-logic';
import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';
import type { Card, NetworkNode } from '../types';
import { nodeRegistry } from '../registry/NodeRegistry';

export const handleInitializeGame = (_snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
    const grid = createGrid(6, 6);
    const deck = createStartingDeck();

    const hand: Card[] = [...deck];
    const currentDeck: Card[] = [];

    // Generate Graph
    const networkGraph: NetworkNode[] = generateGraph();

    // Initial active servers are the children of the HOME node
    const homeNode = networkGraph.find(n => n.type === 'HOME');
    const activeServerIds = homeNode ? homeNode.children : [];
    const activeServers = networkGraph.filter(n => activeServerIds.includes(n.id));

    return {
        grid,
        deck: currentDeck,
        hand,
        discardPile: [],
        trashPile: [],
        activeServers,
        networkGraph,
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
