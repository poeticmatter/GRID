import { produce } from 'immer';
import { checkPatternFit, getAffectedCells, rotatePattern } from '../../grid-logic';
import type { Grid, ActiveEffect } from '../../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const runMechanic: IEffectMechanic = {
    type: 'DEFERRED',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>, payload: { x: number; y: number; pattern: any[] }): StateDeltas => {
        const { x, y, pattern: rawPattern } = payload;

        const events: Array<{ type: string; payload?: any; durationMs?: number }> = [];
        const pattern = rawPattern.map((p: any) => ({ ...p }));
        const rotatedPattern = rotatePattern(pattern, snapshot.rotation);
        const activeGrid = snapshot.grid as Grid;

        if (!checkPatternFit(activeGrid, rotatedPattern, x, y)) {
            return {
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error' }],
                effectQueue: snapshot.effectQueue as ActiveEffect[]
            };
        }

        events.push({ type: 'AUDIO_PLAY_SFX', payload: 'run' });

        const affected = getAffectedCells(activeGrid, rotatedPattern, x, y);
        const virusDetected = affected.some(c => c.hasVirus);

        // Use immer to mutate grid cells — no unsafe casts needed.
        const newGrid = produce(activeGrid, draft => {
            for (const cell of affected) {
                if (cell.y < draft.length && cell.x < draft[0].length) {
                    draft[cell.y][cell.x].state = 'BROKEN';
                    // Virus is consumed/cleared when the cell is broken? 
                    // The system reset clears them all, but if a virus is cleared by a run, it should probably be set to false.
                    draft[cell.y][cell.x].hasVirus = false;
                }
            }
        });

        if (virusDetected) {
            return {
                grid: newGrid,
                selectedCardId: null,
                rotation: 0,
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error' }],
                durationMs: 150
            };
        }

        return {
            grid: newGrid,
            harvestedCells: affected,
            selectedCardId: null,
            rotation: 0,
            events: events.length > 0 ? events : undefined,
            durationMs: 150
        };
    }
};
