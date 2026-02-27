import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export function mergeDeltas(base: StateDeltas, next: StateDeltas): StateDeltas {
    const events = (base.events || []).concat(next.events || []);
    return {
        ...base,
        ...next,
        events: events.length > 0 ? events : undefined
    };
}

export function patchSnapshot(snap: ReadonlyDeep<GameSnapshot>, deltas: StateDeltas): ReadonlyDeep<GameSnapshot> {
    return {
        ...snap,
        ...deltas
    } as unknown as ReadonlyDeep<GameSnapshot>;
}
