import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import { refillGrid } from '../../grid-logic';
import type { Card, Grid } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const systemResetMechanic: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        const newHand = [...snapshot.hand, ...snapshot.discardPile] as Card[];
        const newDiscard: Card[] = [];

        const activeGrid = snapshot.grid as unknown as Grid;
        const refilled = refillGrid(activeGrid, snapshot.refillRate);

        return {
            hand: newHand,
            discardPile: newDiscard,
            grid: refilled,
            turn: snapshot.turn + 1,
            events: [{ type: 'AUDIO_PLAY_SFX', payload: 'hack', durationMs: 600 }] // Can add sound
        };
    }
};
