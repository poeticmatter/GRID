import type { Card } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export function handleDiscardForNetDamage(snapshot: ReadonlyDeep<GameSnapshot>, cardId: string): StateDeltas {
    const cardIndex = snapshot.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return {};

    const card = snapshot.hand[cardIndex];
    const newHand = [...snapshot.hand];
    newHand.splice(cardIndex, 1);

    const newDiscard = [...snapshot.discardPile, card];
    const isGameOver = card.effects.some(e => e.type === 'SYSTEM_RESET');
    const newPendingNetDamage = snapshot.pendingNetDamage - 1;

    return {
        hand: newHand,
        discardPile: newDiscard,
        gameState: isGameOver ? 'GAME_OVER' : (newPendingNetDamage <= 0 ? 'PLAYING' : 'RESOLVING_NET_DAMAGE'),
        pendingNetDamage: newPendingNetDamage,
        events: [{ type: 'AUDIO_PLAY_SFX', payload: isGameOver ? 'game_over' : 'select' }]
    };
}
