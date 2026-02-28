import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { Coordinate } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const reprogramMechanic: IEffectMechanic = {
    type: 'DEFERRED',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>, payload: { source: Coordinate, dest: Coordinate }): StateDeltas => {
        const { source, dest } = payload;
        const grid = [...snapshot.grid.map((row: any) => [...row])];
        const rows = grid.length;
        const cols = grid[0].length;

        // Validation check
        if (!(dest.x >= 0 && dest.x < cols && dest.y >= 0 && dest.y < rows &&
            source.x >= 0 && source.x < cols && source.y >= 0 && source.y < rows)) {
            return {
                effectQueue: snapshot.effectQueue as import('../../types').ActiveEffect[],
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error', durationMs: 600 }] // Optional error sound
            };
        }

        const sCell = grid[source.y][source.x];
        const dCell = grid[dest.y][dest.x];

        // Ensure we actually do a reprogram, otherwise might be invalid
        let validAction = false;

        if (sCell.state !== 'BROKEN' && dCell.state !== 'BROKEN') {
            const tempColor = sCell.color;
            const tempSymbol = sCell.symbol;
            sCell.color = dCell.color;
            sCell.symbol = dCell.symbol;
            dCell.color = tempColor;
            dCell.symbol = tempSymbol;
            validAction = true;
        } else if (sCell.state !== 'BROKEN' && dCell.state === 'BROKEN') {
            dCell.color = sCell.color;
            dCell.symbol = sCell.symbol;
            dCell.state = 'LOCKED';
            sCell.state = 'BROKEN';
            sCell.symbol = 'NONE';
            validAction = true;
        }

        if (!validAction) {
            return {
                effectQueue: snapshot.effectQueue as import('../../types').ActiveEffect[],
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error', durationMs: 600 }]
            };
        }

        const activeEffect = snapshot.effectQueue[0];
        let nextQueue: import('../../types').ActiveEffect[] | undefined = undefined;

        if (activeEffect && activeEffect.effect.type === 'REPROGRAM') {
            const nextAmount = (activeEffect.effect.amount || 1) - 1;
            if (nextAmount > 0) {
                nextQueue = [
                    { ...activeEffect, effect: { type: 'REPROGRAM', amount: nextAmount } },
                    ...(snapshot.effectQueue.slice(1) as import('../../types').ActiveEffect[])
                ];
            }
        }

        const deltas: StateDeltas = {
            grid,
            reprogramTargetSource: null,
            events: [{ type: 'AUDIO_PLAY_SFX', payload: 'reprogram', durationMs: 500 }]
        };

        if (nextQueue !== undefined) {
            deltas.effectQueue = nextQueue;
        }

        return deltas;
    }
};
