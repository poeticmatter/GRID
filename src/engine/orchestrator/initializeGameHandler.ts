import { createGrid } from '../grid-logic';
import { createStartingDeck } from '../game-logic';
import { generateGraph } from '../graph-logic';
import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';
import type { Card, NetworkNode, NodeRecord } from '../types';

export const handleInitializeGame = (_snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
    const grid = createGrid(6, 6);
    const deck = createStartingDeck();

    const hand: Card[] = [...deck];
    const currentDeck: Card[] = [];

    // Generate the full graph and normalize it into a flat NodeRecord dictionary.
    const graphArray: NetworkNode[] = generateGraph();
    const nodes: NodeRecord = {};
    for (const node of graphArray) {
        nodes[node.id] = node;
    }

    // Active servers are the immediate children of the HOME node.
    const homeNode = graphArray.find(n => n.type === 'HOME');
    const activeServerIds: string[] = homeNode ? homeNode.children : [];

    return {
        grid,
        deck: currentDeck,
        hand,
        discardPile: [],
        trashPile: [],
        nodes,
        activeServerIds,
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
