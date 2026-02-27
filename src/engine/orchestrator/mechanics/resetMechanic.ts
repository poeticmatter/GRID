import { handleEndTurn } from '../endTurnHandler';
import { mergeDeltas } from '../deltaUtils';
import type { IEffectMechanic } from '../mechanicRegistry';
import type { Card } from '../../types';

export const resetMechanic: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot, payload: any = {}) => {
        const { cardId } = payload;
        const card = snapshot.hand.find((c: any) => c.id === cardId);
        if (!card) return {};

        const baseEvents = [{ type: 'AUDIO_PLAY_SFX', payload: 'select' }]; // will use special reset later

        const newHand = [...snapshot.hand.filter((c: any) => c.id !== cardId)] as Card[];
        newHand.push(...snapshot.discardPile as Card[]);

        const newDiscard = [card as Card];

        const endTurnDeltas = handleEndTurn(snapshot, 10, newHand, newDiscard);

        // Explicitly merge the starting base event with whatever handleEndTurn outputs
        return mergeDeltas(endTurnDeltas, { events: baseEvents });
    }
};
