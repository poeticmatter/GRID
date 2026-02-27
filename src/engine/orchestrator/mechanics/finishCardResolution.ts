import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { Card } from '../../types';

export function finishCardResolution(snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas {
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

    const card = snapshot.hand.find((c: any) => c.id === cardId);
    let newHand = [...snapshot.hand] as Card[];
    let newDiscard = [...snapshot.discardPile] as Card[];

    if (card) {
        const hasReset = card.effects.some((e: any) => e.type === 'SYSTEM_RESET');
        if (!hasReset) {
            newHand = newHand.filter((c: any) => c.id !== cardId);
            newDiscard.push(card as Card);
        }
    }

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
