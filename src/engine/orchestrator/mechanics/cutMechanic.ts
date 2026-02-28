import { checkPatternFit, getAffectedCells, rotatePattern } from '../../grid-logic';
import type { Grid } from '../../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const cutMechanic: IEffectMechanic = {
    type: 'DEFERRED',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>, payload: { x: number; y: number; pattern: any[] }): StateDeltas => {
        const { x, y, pattern: rawPattern } = payload;

        const events: Array<{ type: string; payload?: any; durationMs?: number }> = [];

        const pattern = [...rawPattern].map((p: any) => ({ ...p }));
        const rotatedPattern = rotatePattern(pattern, snapshot.rotation);

        // checkPatternFit expects Grid, but snapshot.grid is ReadonlyDeep<Grid>.
        // Casting is required when dropping deep immutability at boundaries.
        const activeGrid = snapshot.grid as unknown as Grid;

        if (!checkPatternFit(activeGrid, rotatedPattern, x, y)) {
            return {
                events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error', durationMs: 600 }],
                effectQueue: snapshot.effectQueue as import('../../types').ActiveEffect[]
            };
        }

        events.push({ type: 'AUDIO_PLAY_SFX', payload: 'cut', durationMs: 800 });

        // 1. Harvest Cells & Update Grid
        const affected = getAffectedCells(activeGrid, rotatedPattern, x, y);
        const newGrid = activeGrid.map(row => row.map(cell => ({ ...cell })));
        affected.forEach(cell => {
            if (cell.y < newGrid.length && cell.x < newGrid[0].length) {
                newGrid[cell.y][cell.x].state = 'BROKEN';
            }
        });

        return {
            grid: newGrid,
            harvestedCells: affected,
            selectedCardId: null,
            rotation: 0,
            events: events.length > 0 ? events : undefined,
            durationMs: 400
        };
    }
};
