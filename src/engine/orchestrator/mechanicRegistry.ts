import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export type CardMechanicFn = (snapshot: ReadonlyDeep<GameSnapshot>, payload: { cardId: string; x: number; y: number }) => StateDeltas;

interface MechanicRegistry {
    [action: string]: CardMechanicFn;
}

export const cardMechanicRegistry: MechanicRegistry = {};

export function registerMechanic(action: string, mechanic: CardMechanicFn) {
    cardMechanicRegistry[action] = mechanic;
}
