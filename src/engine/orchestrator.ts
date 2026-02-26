import { useGridStore } from '../store/useGridStore';
import { useServerStore } from '../store/useServerStore';
import { useDeckStore } from '../store/useDeckStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUIStore } from '../store/useUIStore';
import { useGameStore } from '../store/useGameStore';
import { gameEventBus } from './eventBus';

import type { GameAction, GameSnapshot, StateDeltas } from './orchestrator/types';
import { handleInitializeGame } from './orchestrator/initializeGameHandler';
import { handleSelectCard } from './orchestrator/selectCardHandler';
import { handleRotateCard } from './orchestrator/rotateCardHandler';
import { cutMechanic } from './orchestrator/mechanics/cutMechanic';
import { handleEndTurn } from './orchestrator/endTurnHandler';
import { initializeMechanics } from './orchestrator/mechanicsInit';

initializeMechanics();

export type { GameAction } from './orchestrator/types';

function buildSnapshot(): GameSnapshot {
    const gridStore = useGridStore.getState();
    const serverStore = useServerStore.getState();
    const deckStore = useDeckStore.getState();
    const playerStore = usePlayerStore.getState();
    const uiStore = useUIStore.getState();
    const gameStore = useGameStore.getState();

    return {
        grid: gridStore.grid,
        refillRate: gridStore.refillRate,
        activeServers: serverStore.activeServers,
        deepMap: serverStore.deepMap,
        hand: deckStore.hand,
        deck: deckStore.deck,
        discardPile: deckStore.discardPile,
        trashPile: deckStore.trashPile,
        maxHandSize: deckStore.maxHandSize,
        playerStats: playerStore.playerStats,
        selectedCardId: uiStore.selectedCardId,
        rotation: uiStore.rotation,
        gameState: gameStore.gameState,
        turn: gameStore.turn
    };
}

function applyDeltas(deltas: StateDeltas) {
    const gridStore = useGridStore.getState();
    const serverStore = useServerStore.getState();
    const deckStore = useDeckStore.getState();
    const playerStore = usePlayerStore.getState();
    const uiStore = useUIStore.getState();
    const gameStore = useGameStore.getState();

    if (deltas.grid !== undefined) gridStore.setGrid(deltas.grid);
    if (deltas.refillRate !== undefined) gridStore.setRefillRate(deltas.refillRate);

    if (deltas.activeServers !== undefined) serverStore.setActiveServers(deltas.activeServers);
    if (deltas.deepMap !== undefined) serverStore.setDeepMap(deltas.deepMap);

    if (deltas.hand !== undefined) deckStore.setHand(deltas.hand);
    if (deltas.deck !== undefined) deckStore.setDeck(deltas.deck);
    if (deltas.discardPile !== undefined) deckStore.setDiscardPile(deltas.discardPile);
    if (deltas.trashPile !== undefined) deckStore.setTrashPile(deltas.trashPile);
    if (deltas.maxHandSize !== undefined) deckStore.setMaxHandSize(deltas.maxHandSize);

    if (deltas.playerStats !== undefined) playerStore.setPlayerStats(deltas.playerStats);

    // SelectedCardId could explicitly be set to null, so check for undefined instead of truthiness
    if (deltas.selectedCardId !== undefined) uiStore.setSelectedCardId(deltas.selectedCardId);
    if (deltas.rotation !== undefined) uiStore.setRotation(deltas.rotation);

    if (deltas.gameState !== undefined) gameStore.setGameState(deltas.gameState);
    if (deltas.turn !== undefined) gameStore.setTurn(deltas.turn);

    if (deltas.events) {
        deltas.events.forEach(event => {
            gameEventBus.emit(event.type, event.payload);
        });
    }
}

export const Dispatch = (action: GameAction) => {
    const snapshot = buildSnapshot();
    let deltas: StateDeltas = {};

    switch (action.type) {
        case 'INITIALIZE_GAME':
            deltas = handleInitializeGame(snapshot);
            break;
        case 'SELECT_CARD':
            deltas = handleSelectCard(snapshot, action.payload.cardId);
            break;
        case 'ROTATE_CARD':
            deltas = handleRotateCard(snapshot);
            break;
        case 'RESOLVE_CUT':
            deltas = cutMechanic(snapshot, action.payload);
            break;
        case 'END_TURN':
            deltas = handleEndTurn(snapshot, 2);
            break;
    }

    applyDeltas(deltas);
};

