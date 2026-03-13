import { produce } from 'immer';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import { refillGrid } from '../../grid-logic';
import type { Card, Grid } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const systemResetMechanic: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        // Merge hand + discard without unsafe casts
        const newHand = produce(snapshot.hand as Card[], draft => {
            for (const card of snapshot.discardPile as Card[]) {
                draft.push(card);
            }
        });

        const newDiscard: Card[] = [];
        const refilled = refillGrid(snapshot.grid as Grid, snapshot.refillRate);

        return {
            hand: newHand,
            discardPile: newDiscard,
            grid: refilled,
            turn: snapshot.turn + 1,
            events: [{ type: 'AUDIO_PLAY_SFX', payload: 'hack' }],
            durationMs: 400
        };
    }
};
