import { useGameStore } from '../../store/useGameStore';
import { useTargetingStore } from '../../store/useTargetingStore';
import { useUIStore } from '../../store/useUIStore';
import { useGridStore } from '../../store/useGridStore';
import { Dispatch } from '../../engine/orchestrator';
import type { Effect, Coordinate, Cell } from '../../engine/types';

export interface TargetingContext {
    x: number;
    y: number;
    effect: Effect;
    rotation: number;
    grid: Cell[][];
    reprogramTargetSource: Coordinate | null;
    setHoveredCoordinate: (coord: Coordinate | null) => void;
}

export interface TargetingStrategy {
    onClick: (context: TargetingContext) => void;
    onHover?: (context: TargetingContext) => void;
}

export const TargetingRegistry: Record<string, TargetingStrategy> = {
    'CUT': {
        onClick: (ctx) => {
            if (ctx.effect.type !== 'CUT') return;
            Dispatch({ type: 'RESOLVE_CUT', payload: { x: ctx.x, y: ctx.y, pattern: ctx.effect.pattern } });
            ctx.setHoveredCoordinate(null);
        }
    },
    'REPROGRAM': {
        onClick: (ctx) => {
            if (!ctx.reprogramTargetSource) {
                const cell = ctx.grid[ctx.y]?.[ctx.x];
                if (cell && cell.state !== 'BROKEN') {
                    Dispatch({ type: 'SET_REPROGRAM_SOURCE', payload: { source: { x: ctx.x, y: ctx.y } } });
                }
            } else {
                Dispatch({ type: 'RESOLVE_REPROGRAM', payload: { source: ctx.reprogramTargetSource, dest: { x: ctx.x, y: ctx.y } } });
                ctx.setHoveredCoordinate(null);
            }
        }
    }
};

export const TargetingInteractionLayer = () => {
    const { gameState, effectQueue, reprogramTargetSource } = useGameStore();
    const { rotation } = useUIStore();
    const setHoveredCoordinate = useTargetingStore(state => state.setHoveredCoordinate);
    const { grid } = useGridStore();

    if (gameState !== 'EFFECT_RESOLUTION') return null;

    const activeEffect = effectQueue[0]?.effect;
    if (!activeEffect) return null;

    const handleMouseEnter = (x: number, y: number) => {
        const strategy = TargetingRegistry[activeEffect.type];
        if (strategy?.onHover) {
            strategy.onHover({ x, y, effect: activeEffect, rotation, grid, reprogramTargetSource, setHoveredCoordinate });
        } else {
            setHoveredCoordinate({ x, y });
        }
    };

    const handleClick = (x: number, y: number) => {
        const strategy = TargetingRegistry[activeEffect.type];
        if (!strategy) return;

        const context: TargetingContext = {
            x,
            y,
            effect: activeEffect,
            rotation,
            grid,
            reprogramTargetSource,
            setHoveredCoordinate
        };

        strategy.onClick(context);
    };

    return (
        <div
            className="absolute inset-2 w-full h-full grid grid-cols-6 grid-rows-6 gap-1 z-40 pointer-events-auto"
            onMouseLeave={() => setHoveredCoordinate(null)}
        >
            {grid.map((row, y) => (
                row.map((_, x) => (
                    <div
                        key={`interact-${x}-${y}`}
                        className="w-full h-full relative cursor-pointer"
                        onMouseEnter={() => handleMouseEnter(x, y)}
                        onClick={() => handleClick(x, y)}
                    />
                ))
            ))}
        </div>
    );
};

