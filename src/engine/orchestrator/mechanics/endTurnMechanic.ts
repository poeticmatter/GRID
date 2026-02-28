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

        const newGrid = refillGrid(snapshot.grid as unknown as Grid, snapshot.refillRate);
        let currentDeck = [...snapshot.deck] as Card[];
        let currentDiscard = [...snapshot.discardPile] as Card[];
        let finalHand = [...snapshot.hand] as Card[];

        while (finalHand.length < snapshot.maxHandSize) {
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
