import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';

export const handleSelectCard = (_snapshot: ReadonlyDeep<GameSnapshot>, cardId: string | null): StateDeltas => {
    const deltas: StateDeltas = {
        selectedCardId: cardId,
        rotation: 0
    };

    if (cardId) {
        deltas.events = [{ type: 'AUDIO_PLAY_SFX', payload: 'select' }];
    }

    return deltas;
};
