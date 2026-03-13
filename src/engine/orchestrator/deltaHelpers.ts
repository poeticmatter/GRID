import { produce } from 'immer';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export function mergeDeltas(base: StateDeltas, next: StateDeltas): StateDeltas {
    const events = (base.events || []).concat(next.events || []);
    return {
        ...base,
        ...next,
        events: events.length > 0 ? events : undefined
    };
}

/**
 * Returns a new snapshot that is the result of overlaying `deltas` onto `snap`.
 * Uses immer `produce` so structural sharing is maintained and no unsafe casts are required.
 */
export function patchSnapshot(
    snap: ReadonlyDeep<GameSnapshot>,
    deltas: StateDeltas
): ReadonlyDeep<GameSnapshot> {
    return produce(snap as GameSnapshot, (draft) => {
        if (deltas.grid !== undefined) draft.grid = deltas.grid;
        if (deltas.refillRate !== undefined) draft.refillRate = deltas.refillRate;
        if (deltas.nodes !== undefined) draft.nodes = deltas.nodes;
        if (deltas.activeServerIds !== undefined) draft.activeServerIds = deltas.activeServerIds;
        if (deltas.hand !== undefined) draft.hand = deltas.hand;
        if (deltas.deck !== undefined) draft.deck = deltas.deck;
        if (deltas.discardPile !== undefined) draft.discardPile = deltas.discardPile;
        if (deltas.trashPile !== undefined) draft.trashPile = deltas.trashPile;
        if (deltas.maxHandSize !== undefined) draft.maxHandSize = deltas.maxHandSize;
        if (deltas.playerStats !== undefined) draft.playerStats = deltas.playerStats;
        if (deltas.selectedCardId !== undefined) draft.selectedCardId = deltas.selectedCardId;
        if (deltas.rotation !== undefined) draft.rotation = deltas.rotation;
        if (deltas.gameState !== undefined) draft.gameState = deltas.gameState;
        if (deltas.turn !== undefined) draft.turn = deltas.turn;
        if (deltas.pendingEffects !== undefined) draft.pendingEffects = deltas.pendingEffects;
        if (deltas.effectQueue !== undefined) draft.effectQueue = deltas.effectQueue;
        if (deltas.activeCardId !== undefined) draft.activeCardId = deltas.activeCardId;
        if (deltas.reprogramTargetSource !== undefined) draft.reprogramTargetSource = deltas.reprogramTargetSource;
    }) as ReadonlyDeep<GameSnapshot>;
}
