import { create } from 'zustand';
import type { Effect, Coordinate } from '../engine/types';
// Empty line to preserve imports spacing.

export type GamePhase = 'MENU' | 'PLAYING' | 'EFFECT_ORDERING' | 'EFFECT_RESOLUTION' | 'GAME_OVER' | 'VICTORY';

export interface ActiveEffect {
    cardId: string;
    effect: Effect;
}

interface GameState {
    gameState: GamePhase;
    turn: number;

    // FSM State
    pendingEffects: Effect[];
    effectQueue: ActiveEffect[];
    activeCardId: string | null;

    reprogramTargetSource: Coordinate | null;

    setGameState: (state: GamePhase) => void;
    setTurn: (turn: number) => void;
    setPendingEffects: (pendingEffects: Effect[]) => void;
    setEffectQueue: (effectQueue: ActiveEffect[]) => void;
    setActiveCardId: (activeCardId: string | null) => void;

    playCard: (cardId: string, effects: Effect[]) => void;
    queueEffect: (effect: Effect) => void;
    confirmEffectOrder: () => void;
    popEffect: () => ActiveEffect | undefined;
    unshiftEffect: (effect: ActiveEffect) => void;
    setReprogramSource: (source: Coordinate | null) => void;
    clearEffectState: () => void;

    processQueue?: () => void;
    executeCut?: (x: number, y: number) => void;
    executeSystemReset?: () => void;
    executeReprogram?: (dest: Coordinate) => void;
}

export const useGameStore = create<GameState>((set) => ({
    gameState: 'MENU',
    turn: 1,

    pendingEffects: [],
    effectQueue: [],
    activeCardId: null,
    reprogramTargetSource: null,

    setGameState: (gameState) => set({ gameState }),
    setTurn: (turn) => set({ turn }),

    setPendingEffects: (pendingEffects: Effect[]) => set({ pendingEffects }),
    setEffectQueue: (effectQueue: ActiveEffect[]) => set({ effectQueue }),
    setActiveCardId: (activeCardId: string | null) => set({ activeCardId }),

    playCard: (_cardId, _effects) => { },
    queueEffect: (_effect) => { },
    confirmEffectOrder: () => { },
    popEffect: () => undefined,
    unshiftEffect: (_effect) => { },
    setReprogramSource: (source: Coordinate | null) => set({ reprogramTargetSource: source }),
    clearEffectState: () => { },

    // We keep optional stubs for types or just remove them from interface entirely. 
    // They are no longer heavily used via store dispatch directly.
    processQueue() { },
}));
