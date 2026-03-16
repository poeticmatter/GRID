import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const systemResetMechanic: IEffectMechanic = {
    type: 'DEFERRED',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute: (_snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        // Signal the FSM to yield — resolution requires player confirmation
        // via the RESOLVE_SYSTEM_RESET action.
        return { yielded: true };
    }
};
