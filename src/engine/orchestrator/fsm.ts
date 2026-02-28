import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';
import type { ActiveEffect } from '../types';
import { patchSnapshot, mergeDeltas } from './deltaHelpers';
import { getMechanic } from './mechanicRegistry';
import { applySystemsPipeline } from './systemsPipeline';

export function evaluateQueue(snapshot: ReadonlyDeep<GameSnapshot>, payload?: any): StateDeltas[] {
    let currentSnapshot = snapshot;
    let accumulatedDeltas: StateDeltas = {};
    const history: StateDeltas[] = [];
    let currentPayload = payload;

    while (true) {
        const queue = accumulatedDeltas.effectQueue !== undefined
            ? accumulatedDeltas.effectQueue
            : currentSnapshot.effectQueue;

        if (queue.length === 0) {
            const finalMechanic = getMechanic('FINISH_CARD_RESOLUTION');
            const finalDeltas = finalMechanic ? finalMechanic.execute(currentSnapshot) : {};
            history.push(finalDeltas);
            return history;
        }

        const activeEffect = queue[0];
        const effectType = activeEffect.effect.type;

        const mechanic = getMechanic(effectType);

        if (!mechanic) {
            // Mechanic not found, safely pop to prevent infinite loop
            const poppedQueue = [...queue.slice(1)] as ActiveEffect[];
            const stepDeltas = { effectQueue: poppedQueue };
            accumulatedDeltas = mergeDeltas(accumulatedDeltas, stepDeltas);
            currentSnapshot = patchSnapshot(currentSnapshot, stepDeltas);
            history.push(stepDeltas);
            continue;
        }

        if (mechanic.type === 'DEFERRED') {
            if (currentPayload !== undefined) {
                const resultDeltasRaw = mechanic.execute(currentSnapshot, currentPayload);
                const resultDeltas = applySystemsPipeline(currentSnapshot, resultDeltasRaw);

                let nextQueue = resultDeltas.effectQueue;

                if (!nextQueue) {
                    nextQueue = [...queue.slice(1)] as ActiveEffect[];
                }

                const stepDeltas = mergeDeltas(resultDeltas, { effectQueue: nextQueue });
                accumulatedDeltas = mergeDeltas(accumulatedDeltas, stepDeltas);
                currentSnapshot = patchSnapshot(currentSnapshot, stepDeltas);

                currentPayload = undefined;
                history.push(stepDeltas);

                // If the mechanic deliberately kept the same effect queue by value
                if (nextQueue === queue || (nextQueue.length > 0 && nextQueue[0] === queue[0])) {
                    return history;
                }
            } else {
                return history;
            }
        } else {
            const resultDeltasRaw = mechanic.execute(currentSnapshot);
            const resultDeltas = applySystemsPipeline(currentSnapshot, resultDeltasRaw);

            let nextQueue = resultDeltas.effectQueue;
            if (!nextQueue) {
                nextQueue = [...queue.slice(1)] as ActiveEffect[];
            }

            const stepDeltas = mergeDeltas(resultDeltas, { effectQueue: nextQueue });
            accumulatedDeltas = mergeDeltas(accumulatedDeltas, stepDeltas);
            currentSnapshot = patchSnapshot(currentSnapshot, stepDeltas);
            history.push(stepDeltas);
        }
    }
}
