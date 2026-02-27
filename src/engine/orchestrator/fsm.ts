import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';
import { patchSnapshot, mergeDeltas } from './deltaHelpers';
import { systemResetMechanic } from './mechanics/systemResetMechanic';
import { finishCardResolution } from './mechanics/finishCardResolution';

export function evaluateQueue(snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas {
    let currentSnapshot = snapshot;
    let accumulatedDeltas: StateDeltas = {};

    while (true) {
        const queue = accumulatedDeltas.effectQueue !== undefined
            ? accumulatedDeltas.effectQueue
            : currentSnapshot.effectQueue;

        if (queue.length === 0) {
            const finalDeltas = finishCardResolution(currentSnapshot);
            return mergeDeltas(accumulatedDeltas, finalDeltas);
        }

        const activeEffect = queue[0];
        const effectType = activeEffect.effect.type;

        if (effectType === 'SYSTEM_RESET') {
            const resultDeltas = systemResetMechanic(currentSnapshot);

            const newQueue = [...queue.slice(1)] as import('../../../src/store/useGameStore').ActiveEffect[];
            const stepDeltas = mergeDeltas(resultDeltas, { effectQueue: newQueue });

            accumulatedDeltas = mergeDeltas(accumulatedDeltas, stepDeltas);
            currentSnapshot = patchSnapshot(currentSnapshot, stepDeltas);
        } else {
            // effectType === 'CUT' || effectType === 'REPROGRAM'
            // Deferred effect requiring user input. Stop FSM.
            return accumulatedDeltas;
        }
    }
}
