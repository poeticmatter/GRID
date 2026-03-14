import { useGridStore } from '../store/useGridStore';
import { useServerStore } from '../store/useServerStore';
import { useDeckStore } from '../store/useDeckStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUIStore } from '../store/useUIStore';
import { useGameStore } from '../store/useGameStore';
import { gameEventBus } from './eventBus';
import { useVisualQueueStore } from '../store/useVisualQueueStore';
import { useViewModelStore } from '../hooks/useViewModel';

import type { GameAction, GameSnapshot, StateDeltas, PlaybackEvent } from './orchestrator/types';
import { handleInitializeGame } from './orchestrator/initializeGameHandler';
import { handleSelectCard } from './orchestrator/selectCardHandler';
import { handleRotateCard } from './orchestrator/rotateCardHandler';
import { createGrid } from './grid-logic';
import type { Card, NetworkNode, PlayerStats } from './types';
import { initializeMechanics } from './orchestrator/mechanicsInit';
import { patchSnapshot, mergeDeltas } from './orchestrator/deltaHelpers';
import { evaluateQueue } from './orchestrator/fsm';

initializeMechanics();

export type { GameAction } from './orchestrator/types';

// ---------------------------------------------------------------------------
// buildSnapshot — reads current store state into a unified GameSnapshot.
// ---------------------------------------------------------------------------
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
        nodes: serverStore.nodes,
        activeServerIds: serverStore.activeServerIds,
        hand: deckStore.hand,
        deck: deckStore.deck,
        discardPile: deckStore.discardPile,
        trashPile: deckStore.trashPile,
        maxHandSize: deckStore.maxHandSize,
        playerStats: playerStore.playerStats,
        selectedCardId: uiStore.selectedCardId,
        rotation: uiStore.rotation,
        gameState: gameStore.gameState,
        turn: gameStore.turn,
        pendingEffects: gameStore.pendingEffects,
        effectQueue: gameStore.effectQueue,
        activeCardId: gameStore.activeCardId,
        reprogramTargetSource: gameStore.reprogramTargetSource,
        pendingNetDamage: gameStore.pendingNetDamage
    };
}

// ---------------------------------------------------------------------------
// commitLogicalState — synchronously applies the fully-resolved final state
// to all Zustand stores. Events are fired immediately (audio, etc.).
// This is called ONCE per Dispatch, not per animation frame.
// ---------------------------------------------------------------------------
export function commitLogicalState(deltas: StateDeltas) {
    const gridStore = useGridStore.getState();
    const serverStore = useServerStore.getState();
    const deckStore = useDeckStore.getState();
    const playerStore = usePlayerStore.getState();
    const uiStore = useUIStore.getState();
    const gameStore = useGameStore.getState();

    if (deltas.grid !== undefined) gridStore.setGrid(deltas.grid);
    if (deltas.refillRate !== undefined) gridStore.setRefillRate(deltas.refillRate);

    if (deltas.nodes !== undefined) serverStore.setNodes(deltas.nodes);
    if (deltas.activeServerIds !== undefined) serverStore.setActiveServerIds(deltas.activeServerIds);

    if (deltas.hand !== undefined) deckStore.setHand(deltas.hand);
    if (deltas.deck !== undefined) deckStore.setDeck(deltas.deck);
    if (deltas.discardPile !== undefined) deckStore.setDiscardPile(deltas.discardPile);
    if (deltas.trashPile !== undefined) deckStore.setTrashPile(deltas.trashPile);
    if (deltas.maxHandSize !== undefined) deckStore.setMaxHandSize(deltas.maxHandSize);

    if (deltas.playerStats !== undefined) playerStore.setPlayerStats(deltas.playerStats);

    if (deltas.selectedCardId !== undefined) uiStore.setSelectedCardId(deltas.selectedCardId);
    if (deltas.rotation !== undefined) uiStore.setRotation(deltas.rotation);

    if (deltas.gameState !== undefined) gameStore.setGameState(deltas.gameState);
    if (deltas.turn !== undefined) gameStore.setTurn(deltas.turn);

    if (deltas.pendingEffects !== undefined) gameStore.setPendingEffects(deltas.pendingEffects);
    if (deltas.effectQueue !== undefined) gameStore.setEffectQueue(deltas.effectQueue);
    if (deltas.activeCardId !== undefined) gameStore.setActiveCardId(deltas.activeCardId);
    if (deltas.reprogramTargetSource !== undefined) gameStore.setReprogramSource(deltas.reprogramTargetSource);
    if (deltas.pendingNetDamage !== undefined) gameStore.setPendingNetDamage(deltas.pendingNetDamage);

    // Fire events immediately (audio, analytics) — these are one-shot side effects.
    if (deltas.events) {
        deltas.events.forEach(event => {
            gameEventBus.emit(event.type, event.payload);
        });
    }
}

// Legacy alias for use in tests / adapters that haven't migrated yet.
export const applyDeltas = commitLogicalState;

// ---------------------------------------------------------------------------
// buildPlaybackEvents — converts the engine's internal StateDeltas[] history
// (which describes WHAT changed) into PlaybackEvent[] (which describes HOW
// to animate those changes for the player).
// ---------------------------------------------------------------------------
function buildPlaybackEvents(deltaHistory: StateDeltas[]): PlaybackEvent[] {
    const events: PlaybackEvent[] = [];

    for (const deltas of deltaHistory) {
        // Gather all audio/event SFX from this step
        if (deltas.events && deltas.events.length > 0) {
            for (const e of deltas.events) {
                if (e.type === 'AUDIO_PLAY_SFX') {
                    events.push({
                        type: 'PLAY_SFX',
                        durationMs: e.durationMs ?? 0,
                        payload: e.payload
                    });
                }
            }
        }

        // If cells were harvested, emit a ANIMATE_CELLS event
        if (deltas.harvestedCells && deltas.harvestedCells.length > 0) {
            events.push({
                type: 'ANIMATE_CELLS',
                durationMs: deltas.durationMs ?? 400,
                payload: deltas.harvestedCells
            });
        }

        // If node progress changed, emit an ANIMATE_NODES event
        if (deltas.nodes) {
            events.push({
                type: 'ANIMATE_NODES',
                durationMs: deltas.durationMs ?? 300,
                payload: null
            });
        }

        // General timing delay (for multi-step sequences)
        if (deltas.durationMs && deltas.durationMs > 0 && !deltas.harvestedCells && !deltas.nodes) {
            events.push({
                type: 'WAIT',
                durationMs: deltas.durationMs
            });
        }
    }

    return events;
}

// ---------------------------------------------------------------------------
// mergeDeltaHistory — folds the entire delta array into a single final delta.
// This is the "final logical state" that gets committed to the stores.
// ---------------------------------------------------------------------------
function mergeDeltaHistory(deltas: StateDeltas[]): StateDeltas {
    return deltas.reduce((acc, d) => mergeDeltas(acc, d), {} as StateDeltas);
}

// ---------------------------------------------------------------------------
// Dispatch — the single entry point for all game actions.
//
// Contract:
//   1. Computes the full sequence of state changes deterministically (FSM).
//   2. Merges the sequence into a single final logical state.
//   3. Commits the final logical state to stores SYNCHRONOUSLY.
//   4. Enqueues PlaybackEvent[] for the UI to consume asynchronously.
//
// The UI components read from the logical stores immediately; the
// PlaybackController drives visual animations against the already-committed state.
// ---------------------------------------------------------------------------
export const Dispatch = (action: GameAction) => {
    // Block dispatches while visual playback is draining
    if (useVisualQueueStore.getState().isPlaying) return;

    const snapshot = buildSnapshot();
    let deltaHistory: StateDeltas[] = [];

    switch (action.type) {
        case 'INITIALIZE_GAME':
            deltaHistory = [handleInitializeGame(snapshot)];
            break;

        case 'SELECT_CARD':
            deltaHistory = [handleSelectCard(snapshot, action.payload.cardId)];
            break;

        case 'ROTATE_CARD':
            deltaHistory = [handleRotateCard(snapshot)];
            break;

        case 'SYSTEM_RESET': {
            const initDeltas: StateDeltas = {
                gameState: 'EFFECT_RESOLUTION',
                activeCardId: 'SYSTEM', // Placeholder for non-card reset
                effectQueue: [{ cardId: 'SYSTEM', effect: { type: 'SYSTEM_RESET' } }] as any
            };
            deltaHistory = [initDeltas, ...evaluateQueue(patchSnapshot(snapshot, initDeltas))];
            break;
        }

        case 'PLAY_CARD': {
            const { cardId, effects } = action.payload;
            if (effects.length > 1) {
                deltaHistory = [{
                    gameState: 'EFFECT_ORDERING',
                    activeCardId: cardId,
                    selectedCardId: cardId,
                    pendingEffects: [...effects],
                    effectQueue: [],
                    reprogramTargetSource: null,
                }];
            } else if (effects.length === 1) {
                const initDeltas: StateDeltas = {
                    gameState: 'EFFECT_RESOLUTION',
                    activeCardId: cardId,
                    selectedCardId: cardId,
                    pendingEffects: [],
                    effectQueue: [{ cardId, effect: effects[0] }],
                    reprogramTargetSource: null,
                };
                deltaHistory = [initDeltas, ...evaluateQueue(patchSnapshot(snapshot, initDeltas))];
            }
            break;
        }

        case 'QUEUE_EFFECT': {
            const pendingEffects = snapshot.pendingEffects.filter(e => e !== action.payload.effect);
            const effectQueue = [{ cardId: snapshot.activeCardId!, effect: action.payload.effect }];
            const initDeltas: StateDeltas = {
                gameState: 'EFFECT_RESOLUTION',
                pendingEffects,
                effectQueue
            };
            deltaHistory = [initDeltas, ...evaluateQueue(patchSnapshot(snapshot, initDeltas))];
            break;
        }

        case 'CANCEL_CARD': {
            deltaHistory = [{
                gameState: 'PLAYING',
                activeCardId: null,
                selectedCardId: null,
                pendingEffects: [],
                effectQueue: [],
                reprogramTargetSource: null,
                rotation: 0
            }];
            break;
        }

        case 'CONFIRM_EFFECT_ORDER': {
            const initDeltas: StateDeltas = { gameState: 'EFFECT_RESOLUTION' };
            deltaHistory = [initDeltas, ...evaluateQueue(patchSnapshot(snapshot, initDeltas))];
            break;
        }

        case 'SET_REPROGRAM_SOURCE': {
            deltaHistory = [{ reprogramTargetSource: action.payload.source }];
            break;
        }

        case 'RESOLVE_RUN': {
            deltaHistory = evaluateQueue(snapshot, action.payload);
            break;
        }

        case 'RESOLVE_REPROGRAM': {
            deltaHistory = evaluateQueue(snapshot, action.payload);
            break;
        }


        case 'RESOLVE_SYSTEM_RESET': {
            // 1. Move active card and all discard pile cards back to hand
            const activeCardId = snapshot.activeCardId;
            let currentHand = [...snapshot.hand];
            
            // Return discard pile to hand
            snapshot.discardPile.forEach(card => {
                if (!currentHand.find(c => c.id === card.id)) {
                    currentHand.push(card);
                }
            });

            // Return active card to hand
            if (activeCardId) {
                const activeCard = [...snapshot.deck, ...snapshot.hand, ...snapshot.discardPile].find(c => c.id === activeCardId);
                if (activeCard && !currentHand.find(c => c.id === activeCard.id)) {
                    currentHand.push(activeCard);
                }
            }

            // 2. Empty discard pile and filter deck (prevent duplicate references)
            let currentDiscard: Card[] = [];
            let currentDeck = snapshot.deck.filter(c => c.id !== activeCardId && !currentHand.find(h => h.id === c.id));

            const shuffle = (array: Card[]) => {
                const shuffled = [...array];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                return shuffled;
            };

            while (currentHand.length < snapshot.maxHandSize) {
                if (currentDeck.length === 0) {
                    if (currentDiscard.length === 0) break;
                    currentDeck = shuffle(currentDiscard);
                    currentDiscard = [];
                }
                const card = currentDeck.pop();
                if (card) currentHand.push(card);
                else break;
            }

            // 3. Grid Wipe
            const newGrid = createGrid(snapshot.grid.length, snapshot.grid[0].length);

            // 4. Countermeasures
            let playerStats = { ...snapshot.playerStats };
            let netDamageTally = 0;

            for (const nodeId of snapshot.activeServerIds) {
                const node = snapshot.nodes[nodeId] as NetworkNode;
                if (!node) continue;
                for (const cm of node.countermeasures) {
                    if (cm.type === 'TRACE') {
                        playerStats.trace = Math.min(playerStats.maxTrace ?? 15, playerStats.trace + cm.value);
                    }
                    if (cm.type === 'HARDWARE_DAMAGE') {
                        playerStats.hardwareHealth = Math.max(0, playerStats.hardwareHealth - cm.value);
                    }
                    if (cm.type === 'NET_DAMAGE') {
                        netDamageTally += cm.value;
                    }
                }
            }

            // Cap net damage to prevent soft-locks
            netDamageTally = Math.min(netDamageTally, currentHand.length);
            const isResolvingNetDamage = netDamageTally > 0;

            deltaHistory = [{
                grid: newGrid,
                hand: currentHand,
                deck: currentDeck,
                discardPile: currentDiscard,
                playerStats,
                turn: snapshot.turn + 1,
                pendingNetDamage: netDamageTally,
                gameState: isResolvingNetDamage ? 'RESOLVING_NET_DAMAGE' : 'PLAYING',
                effectQueue: [],
                activeCardId: null,
                selectedCardId: null,
                events: [{ type: 'AUDIO_PLAY_SFX', payload: isResolvingNetDamage ? 'error' : 'hack' }],
                durationMs: 800
            }];
            break;
        }

        case 'DISCARD_FOR_NET_DAMAGE': {
            const { cardId } = action.payload;
            const cardIndex = snapshot.hand.findIndex(c => c.id === cardId);
            if (cardIndex === -1) break;

            const card = snapshot.hand[cardIndex];
            const newHand = [...snapshot.hand];
            newHand.splice(cardIndex, 1);

            const newDiscard = [...snapshot.discardPile, card];
            const isGameOver = card.effects.some(e => e.type === 'SYSTEM_RESET');
            const newPendingNetDamage = snapshot.pendingNetDamage - 1;

            deltaHistory = [{
                hand: newHand,
                discardPile: newDiscard,
                gameState: isGameOver ? 'GAME_OVER' : (newPendingNetDamage <= 0 ? 'PLAYING' : 'RESOLVING_NET_DAMAGE'),
                pendingNetDamage: newPendingNetDamage,
                events: [{ type: 'AUDIO_PLAY_SFX', payload: isGameOver ? 'game_over' : 'select' }]
            }];
            break;
        }

        case 'FINISH_CARD_RESOLUTION': {
            deltaHistory = evaluateQueue(snapshot);
            break;
        }
    }

    if (deltaHistory.length === 0) return;

    // --- MANDATE 2 CORE: Pre-commit VM Capture ---
    // Save the CURRENT state as the visual starting point before we overwrite logical stores.
    useViewModelStore.getState().syncWithStores();

    // --- MANDATE 2 CORE: Synchronous logical commit ---
    // Merge the entire history into the final resolved state and apply it now.
    const finalState = mergeDeltaHistory(deltaHistory);
    commitLogicalState(finalState);

    // --- MANDATE 2 CORE: Async visual commands ---
    // Convert the delta history to presentation-only PlaybackEvents for animation.
    const playbackEvents = buildPlaybackEvents(deltaHistory);
    if (playbackEvents.length > 0) {
        useVisualQueueStore.getState().enqueue(playbackEvents);
    }
};
