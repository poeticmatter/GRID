import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export interface IEffectMechanic {
    type: 'IMMEDIATE' | 'DEFERRED';
    execute: (snapshot: ReadonlyDeep<GameSnapshot>, payload?: any) => StateDeltas;
}

interface MechanicRegistry {
    [action: string]: IEffectMechanic;
}

export const cardMechanicRegistry: MechanicRegistry = {};

export function registerMechanic(action: string, mechanic: IEffectMechanic) {
    cardMechanicRegistry[action] = mechanic;
}

export function getMechanic(action: string): IEffectMechanic | undefined {
    return cardMechanicRegistry[action];
}
