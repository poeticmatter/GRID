import { useGameStore } from '../../store/useGameStore';
import { useTargetingStore } from '../../store/useTargetingStore';
import { useUIStore } from '../../store/useUIStore';
import { useGridStore } from '../../store/useGridStore';
import { Dispatch } from '../../engine/orchestrator';
import { RotateCw } from 'lucide-react';
import { useMobile } from '../../hooks/useMobile';
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
    'RUN': {
        onClick: (ctx) => {
            if (ctx.effect.type !== 'RUN') return;
            Dispatch({ type: 'RESOLVE_RUN', payload: { x: ctx.x, y: ctx.y, pattern: ctx.effect.pattern } });
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
    const isMobile = useMobile();

    if (gameState !== 'EFFECT_RESOLUTION') return null;

    const activeEffect = effectQueue[0]?.effect;
    if (!activeEffect) return null;

    const handleMouseEnter = (x: number, y: number) => {
        if (isMobile) return;
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
        <div className="absolute inset-0 z-40 pointer-events-none">
            {activeEffect.type === 'RUN' && !isMobile && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-auto">
                    <button
                        onClick={() => Dispatch({ type: 'ROTATE_CARD' })}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold transition-all border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 shadow-xl hover:scale-105"
                    >
                        <RotateCw className="w-5 h-5" />
                        ROTATE
                    </button>
                </div>
            )}
            
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
        </div>
    );
};

