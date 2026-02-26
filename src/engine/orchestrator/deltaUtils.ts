import type { StateDeltas } from './types';

export function mergeDeltas(base: StateDeltas, additions: StateDeltas): StateDeltas {
    const events = [...(base.events || []), ...(additions.events || [])];
    return {
        ...base,
        ...additions,
        events: events.length > 0 ? events : undefined
    };
}
