import { produce } from 'immer';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import { createGrid } from '../../grid-logic';
import type { Card, NetworkNode } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const systemResetMechanic: IEffectMechanic = {
    type: 'DEFERRED',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        // Pausing for manual confirmation via Console.
        // Return current queue to indicate continuation is pending user action.
        return {
            effectQueue: [...snapshot.effectQueue]
        };
    }
};
