import { create } from 'zustand';
import type { Grid, Card, ServerNode, PlayerStats, Coordinate, Cell } from '../engine/types';
import { createGrid, checkPatternFit, getAffectedCells, refillGrid, rotatePattern } from '../engine/grid-logic';
import { generateServerNode, calculateServerProgress, createStartingDeck } from '../engine/game-logic';
import { playSfx } from '../engine/audio';
import { SERVER_GRAPH, STARTING_NODES } from '../engine/graph-logic';

interface GameState {
    grid: Grid;
    activeServers: ServerNode[];
    deepMap: ServerNode[];
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    trashPile: Card[];
    playerStats: PlayerStats;
    gameState: 'MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';
    turn: number;
    maxHandSize: number;
    refillRate: number;

    // Interaction State
    selectedCardId: string | null;
    rotation: number;

    // Actions
    initializeGame: () => void;
    selectCard: (cardId: string | null) => void;
    rotateCard: () => void;
    playCard: (cardId: string, x: number, y: number) => void;
    endTurn: () => void;
}

function computeEndTurn(state: GameState, tracePenalty: number, handOverride?: Card[], discardOverride?: Card[]): Partial<GameState> {
    const newGrid = refillGrid(state.grid, state.refillRate);
    let currentDeck = [...state.deck];
    let currentDiscard = discardOverride ? [...discardOverride] : [...state.discardPile];
    let finalHand = handOverride ? [...handOverride] : [...state.hand];

    while (finalHand.length < state.maxHandSize) {
        if (currentDeck.length === 0) {
            if (currentDiscard.length === 0) break;
            currentDeck = [...currentDiscard];
            for (let j = currentDeck.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [currentDeck[j], currentDeck[k]] = [currentDeck[k], currentDeck[j]];
            }
            currentDiscard = [];
        }
        const card = currentDeck.pop();
        if (card) finalHand.push(card);
    }

    const newTrace = Math.min(100, state.playerStats.trace + tracePenalty);

    let newGameState = state.gameState;
    if (newTrace >= 100 || (finalHand.length === 0 && currentDeck.length === 0)) {
        newGameState = 'GAME_OVER';
    }

    return {
        grid: newGrid,
        hand: finalHand,
        deck: currentDeck,
        discardPile: currentDiscard,
        playerStats: { ...state.playerStats, trace: newTrace },
        gameState: newGameState,
        turn: state.turn + 1,
        selectedCardId: null,
        rotation: 0
    };
}

export const useGameStore = create<GameState>((set, get) => ({
    grid: [],
    activeServers: [],
    deepMap: [],
    hand: [],
    deck: [],
    discardPile: [],
    trashPile: [],
    playerStats: {
        hardwareHealth: 3,
        maxHardwareHealth: 3,
        trace: 0,
        credits: 0,
    },
    gameState: 'MENU',
    turn: 1,
    maxHandSize: 4,
    refillRate: 5,

    selectedCardId: null,
    rotation: 0,

    initializeGame: () => {
        const grid = createGrid(6, 6);
        const deck = createStartingDeck();

        // Draw initial hand
        const hand: Card[] = [];
        const currentDeck = [...deck];
        for (let i = 0; i < 4; i++) {
            if (currentDeck.length > 0) {
                const card = currentDeck.pop();
                if (card) hand.push(card);
            }
        }

        // Generate Servers
        const activeServers: ServerNode[] = STARTING_NODES.map(id => ({ ...SERVER_GRAPH[id] }));
        const deepMap: ServerNode[] = [];

        set({
            grid,
            deck: currentDeck,
            hand,
            activeServers,
            deepMap,
            discardPile: [],
            trashPile: [],
            playerStats: {
                hardwareHealth: 3,
                maxHardwareHealth: 3,
                trace: 0,
                credits: 0,
            },
            gameState: 'PLAYING',
            turn: 1,
            selectedCardId: null,
            rotation: 0
        });
    },

    selectCard: (cardId) => {
        if (cardId) playSfx('select');
        set({ selectedCardId: cardId, rotation: 0 });
    },

    rotateCard: () => {
        set((state) => ({ rotation: (state.rotation + 90) % 360 }));
    },

    playCard: (cardId, x, y) => {
        const state = get();
        const { grid, hand, discardPile, trashPile, activeServers, playerStats, deepMap, rotation, deck } = state;
        const card = hand.find(c => c.id === cardId);
        if (!card) return;

        if (card.action === 'RESET') {
            playSfx('select'); // different sfx in the future

            const newHand = [...hand.filter(c => c.id !== cardId), ...discardPile];
            const newDiscard = [card];

            // Apply turn advancement logic within a single, predictable state update cycle
            const updates = computeEndTurn(state, 10, newHand, newDiscard);

            set({ ...updates });
            return;
        }

        // Default CUT behavior
        const rotatedPattern = rotatePattern(card.pattern, rotation);

        if (!checkPatternFit(grid, rotatedPattern, x, y)) {
            playSfx('error');
            return; // Invalid move
        }

        playSfx('cut');

        // 1. Harvest Cells & Update Grid
        const affected = getAffectedCells(grid, rotatedPattern, x, y);
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        affected.forEach(cell => {
            if (cell.y < newGrid.length && cell.x < newGrid[0].length) {
                newGrid[cell.y][cell.x].state = 'BROKEN';
            }
        });

        // 2. Broadcast to Servers & Update Stats
        const newPlayerStats = { ...playerStats };
        const newActiveServers: ServerNode[] = [];

        let newHand = hand.filter(c => c.id !== cardId);
        let newDeck = [...deck];
        let newTrashPile = [...trashPile];
        let newDiscard = [...discardPile, card];

        activeServers.forEach(server => {
            const result = calculateServerProgress(server, affected);

            if (result.penaltyTriggered) {
                playSfx('error');
                if (server.penaltyType === 'TRACE') {
                    newPlayerStats.trace = Math.min(100, newPlayerStats.trace + server.penaltyValue);
                } else if (server.penaltyType === 'HARDWARE_DAMAGE') {
                    newPlayerStats.hardwareHealth = Math.max(0, newPlayerStats.hardwareHealth - 1);
                } else if (server.penaltyType === 'NET_DAMAGE') {
                    // Physically remove a card from Hand or Deck and move it to trashPile array
                    if (newHand.length > 0) {
                        const idx = Math.floor(Math.random() * newHand.length);
                        const trashed = newHand.splice(idx, 1)[0];
                        newTrashPile.push(trashed);
                    } else if (newDeck.length > 0) {
                        const trashed = newDeck.pop()!;
                        newTrashPile.push(trashed);
                    }
                }
            }

            newActiveServers.push(result.updatedServer);
        });

        // 3. Handle Hacked Servers (Progression)
        const remainingServers: ServerNode[] = [];
        const newDeepMap = [...deepMap];

        newActiveServers.forEach(s => {
            if (s.status !== 'HACKED') {
                remainingServers.push(s);
            } else {
                newPlayerStats.credits += s.difficulty * 10;
                playSfx('hack');
            }
        });

        // Refill active row
        while (remainingServers.length < 3 && newDeepMap.length > 0) {
            remainingServers.push(newDeepMap.shift()!);
        }

        // Check Win/Loss
        let newGameState = state.gameState;
        if (newPlayerStats.hardwareHealth <= 0 || newPlayerStats.trace >= 100 || (newHand.length === 0 && newDeck.length === 0)) {
            newGameState = 'GAME_OVER';
        } else if (remainingServers.length === 0 && newDeepMap.length === 0) {
            newGameState = 'VICTORY';
        }

        set({
            grid: newGrid,
            activeServers: remainingServers,
            deepMap: newDeepMap,
            hand: newHand,
            deck: newDeck,
            discardPile: newDiscard,
            trashPile: newTrashPile,
            playerStats: newPlayerStats,
            gameState: newGameState,
            selectedCardId: null,
            rotation: 0
        });
    },

    endTurn: () => {
        const state = get();
        const updates = computeEndTurn(state, 2);
        set(updates);
    }
}));
