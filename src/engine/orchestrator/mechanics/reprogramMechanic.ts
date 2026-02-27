import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import type { Coordinate } from '../../types';

export function reprogramMechanic(
    snapshot: ReadonlyDeep<GameSnapshot>,
    payload: { source: Coordinate, dest: Coordinate }
): StateDeltas {
    const { source, dest } = payload;
    const grid = [...snapshot.grid.map((row: any) => [...row])];
    const rows = grid.length;
    const cols = grid[0].length;

    if (dest.x >= 0 && dest.x < cols && dest.y >= 0 && dest.y < rows &&
        source.x >= 0 && source.x < cols && source.y >= 0 && source.y < rows) {

        const sCell = grid[source.y][source.x];
        const dCell = grid[dest.y][dest.x];

        if (sCell.state !== 'BROKEN' && dCell.state !== 'BROKEN') {
            const tempColor = sCell.color;
            const tempSymbol = sCell.symbol;
            sCell.color = dCell.color;
            sCell.symbol = dCell.symbol;
            dCell.color = tempColor;
            dCell.symbol = tempSymbol;
        } else if (sCell.state !== 'BROKEN' && dCell.state === 'BROKEN') {
            dCell.color = sCell.color;
            dCell.symbol = sCell.symbol;
            dCell.state = 'LOCKED';
            sCell.state = 'BROKEN';
            sCell.symbol = 'NONE';
        }
    }

    const queue = [...snapshot.effectQueue];
    const activeEffect = queue[0];
    let newReprogramTargetSource: Coordinate | null = null;

    if (activeEffect && activeEffect.effect.type === 'REPROGRAM') {
        const nextAmount = activeEffect.effect.amount - 1;
        if (nextAmount <= 0) {
            queue.shift();
        } else {
            queue[0] = { ...activeEffect, effect: { type: 'REPROGRAM', amount: nextAmount } };
        }
    } else {
        queue.shift();
    }

    return {
        grid,
        effectQueue: queue as import('../../../src/store/useGameStore').ActiveEffect[],
        reprogramTargetSource: newReprogramTargetSource
    };
}
