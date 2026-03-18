import { produce } from 'immer';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { Coordinate, ActiveEffect, Grid } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const reprogramMechanic: IEffectMechanic = {
    type: 'DEFERRED',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>, payload: { source: Coordinate; dest: Coordinate }): StateDeltas => {
        const { source, dest } = payload;
        const grid = snapshot.grid;
        const rows = grid.length;
        const cols = grid[0]?.length ?? 0;

        const dx = Math.abs(dest.x - source.x);
        const dy = Math.abs(dest.y - source.y);
        const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

        // Boundary validation
        if (
            !(dest.x >= 0 && dest.x < cols && dest.y >= 0 && dest.y < rows &&
              source.x >= 0 && source.x < cols && source.y >= 0 && source.y < rows) ||
            !isAdjacent
        ) {
            return {
                effectQueue: snapshot.effectQueue as ActiveEffect[],
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error' }]
            };
        }

        let validAction = false;

        const newGrid = produce(grid as Grid, draft => {
            const sCell = draft[source.y][source.x];
            const dCell = draft[dest.y][dest.x];

            if (sCell.state !== 'BROKEN' && dCell.state !== 'BROKEN') {
                // Swap properties of existing grid cells
                const tempColor = sCell.color;
                const tempSymbol = sCell.symbol;
                sCell.color = dCell.color;
                sCell.symbol = dCell.symbol;
                dCell.color = tempColor;
                dCell.symbol = tempSymbol;
                validAction = true;
            } else if (sCell.state !== 'BROKEN' && dCell.state === 'BROKEN') {
                // Move source properties onto broken destination
                dCell.color = sCell.color;
                dCell.symbol = sCell.symbol;
                dCell.state = 'PRIMED';
                sCell.state = 'BROKEN';
                sCell.symbol = 'NONE';
                validAction = true;
            }
        });

        if (!validAction) {
            return {
                effectQueue: snapshot.effectQueue as ActiveEffect[],
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error' }]
            };
        }

        // Decrement remaining reprogram count
        const activeEffect = snapshot.effectQueue[0];
        let nextQueue: ActiveEffect[] | undefined;

        if (activeEffect && activeEffect.effect.type === 'REPROGRAM') {
            const nextAmount = ((activeEffect.effect as any).amount || 1) - 1;
            if (nextAmount > 0) {
                nextQueue = [
                    { ...activeEffect, effect: { type: 'REPROGRAM', amount: nextAmount } } as ActiveEffect,
                    ...(snapshot.effectQueue.slice(1) as ActiveEffect[])
                ];
            }
        }

        const sourceState = snapshot.grid[source.y][source.x];
        const destState = snapshot.grid[dest.y][dest.x];

        const deltas: StateDeltas = {
            grid: newGrid,
            reprogramTargetSource: null,
            isCardCommitted: true,
            events: [
                { type: 'AUDIO_PLAY_SFX', payload: 'reprogram' },
                { 
                    type: 'VFX_REPROGRAM_SWAP', 
                    payload: { 
                        source, 
                        dest, 
                        sourceCell: { ...sourceState }, 
                        destCell: { ...destState } 
                    } 
                }
            ]
        };

        if (nextQueue !== undefined) {
            deltas.effectQueue = nextQueue;
        }

        return deltas;
    }
};
