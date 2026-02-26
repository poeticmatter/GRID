import { useGridStore } from '../store/useGridStore';
import { useServerStore } from '../store/useServerStore';
import { useDeckStore } from '../store/useDeckStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUIStore } from '../store/useUIStore';
import { useGameStore } from '../store/useGameStore';
import { gameEventBus } from './eventBus';
import { createGrid, checkPatternFit, getAffectedCells, refillGrid, rotatePattern } from './grid-logic';
import { calculateServerProgress, createStartingDeck } from './game-logic';
import { SERVER_GRAPH, STARTING_NODES } from './graph-logic';
import type { Card, ServerNode } from './types';

export type GameAction =
    | { type: 'INITIALIZE_GAME' }
    | { type: 'SELECT_CARD', payload: { cardId: string | null } }
    | { type: 'ROTATE_CARD' }
    | { type: 'PLAY_CARD', payload: { cardId: string, x: number, y: number } }
    | { type: 'END_TURN' };

function computeEndTurn(tracePenalty: number, handOverride?: Card[], discardOverride?: Card[]) {
    const gridStore = useGridStore.getState();
    const deckStore = useDeckStore.getState();
    const playerStore = usePlayerStore.getState();
    const gameStore = useGameStore.getState();

    const newGrid = refillGrid(gridStore.grid, gridStore.refillRate);
    let currentDeck = [...deckStore.deck];
    let currentDiscard = discardOverride ? [...discardOverride] : [...deckStore.discardPile];
    let finalHand = handOverride ? [...handOverride] : [...deckStore.hand];

    while (finalHand.length < deckStore.maxHandSize) {
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

    const newTrace = Math.min(100, playerStore.playerStats.trace + tracePenalty);

    let newGameState = gameStore.gameState;
    if (newTrace >= 100 || (finalHand.length === 0 && currentDeck.length === 0)) {
        newGameState = 'GAME_OVER';
    }

    if (newGameState === 'GAME_OVER' && gameStore.gameState !== 'GAME_OVER') {
        gameEventBus.emit('AUDIO_PLAY_SFX', 'game_over');
    }

    // Apply updates
    gridStore.setGrid(newGrid);
    deckStore.setHand(finalHand);
    deckStore.setDeck(currentDeck);
    deckStore.setDiscardPile(currentDiscard);
    playerStore.setPlayerStats({ ...playerStore.playerStats, trace: newTrace });
    gameStore.setGameState(newGameState);
    gameStore.setTurn(gameStore.turn + 1);

    const uiStore = useUIStore.getState();
    uiStore.setSelectedCardId(null);
    uiStore.setRotation(0);
}

export const Dispatch = (action: GameAction) => {
    switch (action.type) {
        case 'INITIALIZE_GAME': {
            const gridStore = useGridStore.getState();
            const deckStore = useDeckStore.getState();
            const serverStore = useServerStore.getState();
            const playerStore = usePlayerStore.getState();
            const gameStore = useGameStore.getState();
            const uiStore = useUIStore.getState();

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

            gridStore.setGrid(grid);
            deckStore.setDeck(currentDeck);
            deckStore.setHand(hand);
            deckStore.setDiscardPile([]);
            deckStore.setTrashPile([]);
            serverStore.setActiveServers(activeServers);
            serverStore.setDeepMap([]);
            playerStore.setPlayerStats({
                hardwareHealth: 3,
                maxHardwareHealth: 3,
                trace: 0,
                credits: 0,
            });
            gameStore.setGameState('PLAYING');
            gameStore.setTurn(1);
            uiStore.setSelectedCardId(null);
            uiStore.setRotation(0);
            break;
        }

        case 'SELECT_CARD': {
            const uiStore = useUIStore.getState();
            if (action.payload.cardId) gameEventBus.emit('AUDIO_PLAY_SFX', 'select');
            uiStore.setSelectedCardId(action.payload.cardId);
            uiStore.setRotation(0);
            break;
        }

        case 'ROTATE_CARD': {
            const uiStore = useUIStore.getState();
            uiStore.setRotation((uiStore.rotation + 90) % 360);
            break;
        }

        case 'PLAY_CARD': {
            const { cardId, x, y } = action.payload;
            const uiStore = useUIStore.getState();
            const deckStore = useDeckStore.getState();
            const gridStore = useGridStore.getState();
            const serverStore = useServerStore.getState();
            const playerStore = usePlayerStore.getState();
            const gameStore = useGameStore.getState();

            const card = deckStore.hand.find(c => c.id === cardId);
            if (!card) return;

            if (card.action === 'RESET') {
                gameEventBus.emit('AUDIO_PLAY_SFX', 'select'); // different sfx in the future

                const newHand = [...deckStore.hand.filter(c => c.id !== cardId), ...deckStore.discardPile];
                const newDiscard = [card];

                // Apply turn advancement logic within a single, predictable state update cycle
                computeEndTurn(10, newHand, newDiscard);
                return;
            }

            // Default CUT behavior
            const rotatedPattern = rotatePattern(card.pattern, uiStore.rotation);

            if (!checkPatternFit(gridStore.grid, rotatedPattern, x, y)) {
                gameEventBus.emit('AUDIO_PLAY_SFX', 'error');
                return; // Invalid move
            }

            gameEventBus.emit('AUDIO_PLAY_SFX', 'cut');

            // 1. Harvest Cells & Update Grid
            const affected = getAffectedCells(gridStore.grid, rotatedPattern, x, y);
            const newGrid = gridStore.grid.map(row => row.map(cell => ({ ...cell })));
            affected.forEach(cell => {
                if (cell.y < newGrid.length && cell.x < newGrid[0].length) {
                    newGrid[cell.y][cell.x].state = 'BROKEN';
                }
            });

            // 2. Broadcast to Servers & Update Stats
            const newPlayerStats = { ...playerStore.playerStats };
            const newActiveServers: ServerNode[] = [];

            let newHand = deckStore.hand.filter(c => c.id !== cardId);
            let newDeck = [...deckStore.deck];
            let newTrashPile = [...deckStore.trashPile];
            let newDiscard = [...deckStore.discardPile, card];

            serverStore.activeServers.forEach(server => {
                const result = calculateServerProgress(server, affected);

                if (result.penaltyTriggered) {
                    gameEventBus.emit('AUDIO_PLAY_SFX', 'error');
                    if (server.penaltyType === 'TRACE') {
                        newPlayerStats.trace = Math.min(100, newPlayerStats.trace + server.penaltyValue);
                    } else if (server.penaltyType === 'HARDWARE_DAMAGE') {
                        newPlayerStats.hardwareHealth = Math.max(0, newPlayerStats.hardwareHealth - server.penaltyValue);
                    } else if (server.penaltyType === 'NET_DAMAGE') {
                        // Physically remove a card from Hand or Deck and move it to trashPile array
                        for (let p = 0; p < server.penaltyValue; p++) {
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
                }

                newActiveServers.push(result.updatedServer);
            });

            // 3. Handle Hacked Servers (Progression)
            const remainingServers: ServerNode[] = [];
            const newDeepMap = [...serverStore.deepMap];
            let hasTargetHacked = false;

            newActiveServers.forEach(s => {
                if (s.status !== 'HACKED') {
                    remainingServers.push(s);
                } else {
                    newPlayerStats.credits += s.difficulty * 10;
                    gameEventBus.emit('AUDIO_PLAY_SFX', 'hack');

                    const graphNode = SERVER_GRAPH[s.id];
                    if (graphNode) {
                        if (graphNode.isTarget) {
                            hasTargetHacked = true;
                        }

                        graphNode.edges.forEach(childId => {
                            const existsActive = serverStore.activeServers.some(activeS => activeS.id === childId);
                            const existsDeep = newDeepMap.some(deepS => deepS.id === childId);

                            if (!existsActive && !existsDeep) {
                                const childNodeTemplate = SERVER_GRAPH[childId];
                                if (childNodeTemplate) {
                                    // Deep copy node
                                    const newChild: ServerNode = {
                                        ...childNodeTemplate,
                                        requirements: {
                                            colors: { ...childNodeTemplate.requirements.colors },
                                            symbols: { ...(childNodeTemplate.requirements.symbols || {}) }
                                        },
                                        progress: {
                                            colors: { ...childNodeTemplate.progress.colors },
                                            symbols: { ...(childNodeTemplate.progress.symbols || {}) }
                                        }
                                    };
                                    newDeepMap.push(newChild);
                                }
                            }
                        });
                    }
                }
            });

            // Refill active row
            while (remainingServers.length < 3 && newDeepMap.length > 0) {
                remainingServers.push(newDeepMap.shift()!);
            }

            // Check Win/Loss
            let newGameState = gameStore.gameState;
            if (newPlayerStats.hardwareHealth <= 0 || newPlayerStats.trace >= 100 || (newHand.length === 0 && newDeck.length === 0)) {
                newGameState = 'GAME_OVER';
            } else if (hasTargetHacked) {
                newGameState = 'VICTORY';
            }

            if (newGameState === 'GAME_OVER' && gameStore.gameState !== 'GAME_OVER') {
                gameEventBus.emit('AUDIO_PLAY_SFX', 'game_over');
            } else if (newGameState === 'VICTORY' && gameStore.gameState !== 'VICTORY') {
                gameEventBus.emit('AUDIO_PLAY_SFX', 'victory');
            }

            gridStore.setGrid(newGrid);
            serverStore.setActiveServers(remainingServers);
            serverStore.setDeepMap(newDeepMap);
            deckStore.setHand(newHand);
            deckStore.setDeck(newDeck);
            deckStore.setDiscardPile(newDiscard);
            deckStore.setTrashPile(newTrashPile);
            playerStore.setPlayerStats(newPlayerStats);
            gameStore.setGameState(newGameState);
            uiStore.setSelectedCardId(null);
            uiStore.setRotation(0);
            break;
        }

        case 'END_TURN': {
            computeEndTurn(2);
            break;
        }
    }
};
