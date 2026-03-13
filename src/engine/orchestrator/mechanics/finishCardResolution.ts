import { produce } from 'immer';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { Card } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const finishCardResolution: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        const cardId = snapshot.activeCardId;
        if (!cardId) {
            return {
                gameState: 'PLAYING',
                pendingEffects: [],
                effectQueue: [],
                activeCardId: null,
                reprogramTargetSource: null
            };
        }

        const card = snapshot.hand.find((c: any) => c.id === cardId) as Card | undefined;
        const hasReset = card?.effects.some((e: any) => e.type === 'SYSTEM_RESET') ?? false;

        // Use immer to derive the new hand and discard without unsafe casts
        const newHand = produce(snapshot.hand as Card[], draft => {
            if (card && !hasReset) {
                const idx = draft.findIndex(c => c.id === cardId);
                if (idx !== -1) draft.splice(idx, 1);
            }
        });

        const newDiscard = produce(snapshot.discardPile as Card[], draft => {
            if (card && !hasReset) {
                draft.push(card);
            }
        });

        return {
            hand: newHand,
            discardPile: newDiscard,
            gameState: 'PLAYING',
            pendingEffects: [],
            effectQueue: [],
            activeCardId: null,
            reprogramTargetSource: null
        };
    }
};
