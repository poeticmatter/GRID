import { produce } from 'immer';
import { refillGrid } from '../../grid-logic';
import type { GameSnapshot, StateDeltas, ReadonlyDeep } from '../types';
import type { Card, Grid, EffectEndTurn } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const endTurnMechanic: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        const queue = snapshot.effectQueue;
        const effect = (queue && queue[0]?.effect.type === 'END_TURN'
            ? queue[0].effect as unknown as EffectEndTurn
            : null);

        const tracePenalty = effect?.tracePenalty ?? 2;

        // refillGrid returns a fresh grid; no need to draft-mutate.
        const newGrid = refillGrid(snapshot.grid as Grid, snapshot.refillRate);

        let currentDeck = [...snapshot.deck] as Card[];
        let currentDiscard = [...snapshot.discardPile] as Card[];
        let finalHand = [...snapshot.hand] as Card[];

        while (finalHand.length < snapshot.maxHandSize) {
            if (currentDeck.length === 0) {
                if (currentDiscard.length === 0) break;
                // Shuffle discard → deck
                currentDeck = produce(currentDiscard, draft => {
                    for (let j = draft.length - 1; j > 0; j--) {
                        const k = Math.floor(Math.random() * (j + 1));
                        [draft[j], draft[k]] = [draft[k], draft[j]];
                    }
                });
                currentDiscard = [];
            }
            const card = currentDeck.pop();
            if (card) finalHand.push(card as Card);
        }

        const newTrace = snapshot.playerStats.trace + tracePenalty;

        return {
            grid: newGrid,
            hand: finalHand,
            deck: currentDeck,
            discardPile: currentDiscard,
            playerStats: { ...snapshot.playerStats, trace: newTrace },
            turn: snapshot.turn + 1,
            selectedCardId: null,
            rotation: 0,
            durationMs: 600
        };
    }
};
