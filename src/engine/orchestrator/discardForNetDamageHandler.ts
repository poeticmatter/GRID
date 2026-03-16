import type { Card } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export function handleDiscardForNetDamage(snapshot: ReadonlyDeep<GameSnapshot>, cardId: string): StateDeltas {
    const cardIndex = snapshot.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return {};

    const card = snapshot.hand[cardIndex];
    const newHand = [...snapshot.hand];
    newHand.splice(cardIndex, 1);

    const newTrash = [...snapshot.trashPile, card];
    const newPendingNetDamage = snapshot.pendingNetDamage - 1;

    return {
        hand: newHand,
        trashPile: newTrash,
        pendingNetDamage: newPendingNetDamage,
        events: [{ type: 'AUDIO_PLAY_SFX', payload: 'select' }]
    };
}

