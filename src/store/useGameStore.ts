import { create } from 'zustand';
import type { Grid, Card, ServerNode, PlayerStats, Coordinate, Cell } from '../engine/types';
import { createGrid, checkPatternFit, getAffectedCells, refillGrid, rotatePattern } from '../engine/grid-logic';
import { generateServerNode, calculateServerProgress, createStartingDeck } from '../engine/game-logic';
import { playSfx } from '../engine/audio';

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
        softwareHealth: 10,
        maxSoftwareHealth: 10,
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
        const activeServers: ServerNode[] = [];
        for (let i = 0; i < 3; i++) {
            activeServers.push(generateServerNode(1, i));
        }

        const deepMap: ServerNode[] = [];
        for (let i = 3; i < 13; i++) {
            deepMap.push(generateServerNode(Math.floor(i / 2) + 1, i));
        }

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
                softwareHealth: 10,
                maxSoftwareHealth: 10,
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
        const { grid, hand, discardPile, activeServers, playerStats, deepMap, rotation } = get();
        const card = hand.find(c => c.id === cardId);
        if (!card) return;

        if (card.action === 'RESET') {
            const { endTurn } = get();
            playSfx('select'); // different sfx in the future

            const newHand = [...hand.filter(c => c.id !== cardId), ...discardPile];
            const newPlayerStats = { ...playerStats, trace: Math.min(100, playerStats.trace + 10) };
            const newDiscard = [card]; // Wait, actually standard to put played reset card in discard or let it vanish. Let's trace back to discard limit.

            let newGameState = get().gameState;
            if (newPlayerStats.trace >= 100) {
                newGameState = 'GAME_OVER';
            }

            set({
                hand: newHand,
                discardPile: newDiscard,
                playerStats: newPlayerStats,
                gameState: newGameState,
                selectedCardId: null,
                rotation: 0
            });

            setTimeout(() => get().endTurn(), 0); // Need to call correctly
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

        activeServers.forEach(server => {
            const result = calculateServerProgress(server, affected);

            if (result.penaltyTriggered) {
                playSfx('error');
                if (server.penaltyType === 'TRACE') {
                    newPlayerStats.trace = Math.min(100, newPlayerStats.trace + server.penaltyValue);
                } else if (server.penaltyType === 'HARDWARE_DAMAGE') {
                    newPlayerStats.hardwareHealth = Math.max(0, newPlayerStats.hardwareHealth - 1);
                } else if (server.penaltyType === 'NET_DAMAGE') {
                    newPlayerStats.softwareHealth = Math.max(0, newPlayerStats.softwareHealth - 1);
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

        // 4. Update Hand/Discard
        const newHand = hand.filter(c => c.id !== cardId);
        const newDiscard = [...discardPile, card];

        // Check Win/Loss
        let newGameState = get().gameState;
        if (newPlayerStats.hardwareHealth <= 0 || newPlayerStats.trace >= 100 || newPlayerStats.softwareHealth <= 0) {
            newGameState = 'GAME_OVER';
        } else if (remainingServers.length === 0 && newDeepMap.length === 0) {
            newGameState = 'VICTORY';
        }

        set({
            grid: newGrid,
            activeServers: remainingServers,
            deepMap: newDeepMap,
            hand: newHand,
            discardPile: newDiscard,
            playerStats: newPlayerStats,
            gameState: newGameState,
            selectedCardId: null,
            rotation: 0
        });
    },

    endTurn: () => {
        const { grid, refillRate, deck, discardPile, hand, maxHandSize, playerStats } = get();

        // 1. Refill Grid
        const newGrid = refillGrid(grid, refillRate);

        // 2. Draw Cards
        let currentDeck = [...deck];
        let currentDiscard = [...discardPile];
        const newHand = [...hand];

        while (newHand.length < maxHandSize) {
            if (currentDeck.length === 0) {
                if (currentDiscard.length === 0) break; // No cards left
                // Shuffle discard into deck
                currentDeck = [...currentDiscard];
                // Shuffle logic
                for (let j = currentDeck.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [currentDeck[j], currentDeck[k]] = [currentDeck[k], currentDeck[j]];
                }
                currentDiscard = [];
            }
            const card = currentDeck.pop();
            if (card) newHand.push(card);
        }

        // 3. Passive Trace Increase
        const newTrace = Math.min(100, playerStats.trace + 2);

        let newGameState = get().gameState;
        if (newTrace >= 100) {
            newGameState = 'GAME_OVER';
        }

        set({
            grid: newGrid,
            hand: newHand,
            deck: currentDeck,
            discardPile: currentDiscard,
            playerStats: { ...playerStats, trace: newTrace },
            gameState: newGameState,
            turn: get().turn + 1
        });
    }
}));
