import { create } from 'zustand';
import type { Effect, Coordinate } from '../engine/types';
// Empty line to preserve imports spacing.

export type GamePhase = 'MENU' | 'PLAYING' | 'EFFECT_ORDERING' | 'EFFECT_RESOLUTION' | 'RESOLVING_NET_DAMAGE' | 'GAME_OVER' | 'VICTORY';

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
    pendingNetDamage: number;
    isCardCommitted: boolean;

    setGameState: (state: GamePhase) => void;
    setTurn: (turn: number) => void;
    setPendingEffects: (pendingEffects: Effect[]) => void;
    setEffectQueue: (effectQueue: ActiveEffect[]) => void;
    setActiveCardId: (activeCardId: string | null) => void;

    setReprogramSource: (source: Coordinate | null) => void;
    setPendingNetDamage: (pendingNetDamage: number) => void;
    setIsCardCommitted: (isCardCommitted: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
    gameState: 'MENU',
    turn: 1,

    pendingEffects: [],
    effectQueue: [],
    activeCardId: null,
    reprogramTargetSource: null,
    pendingNetDamage: 0,
    isCardCommitted: false,

    setGameState: (gameState) => set({ gameState }),
    setTurn: (turn) => set({ turn }),

    setPendingEffects: (pendingEffects: Effect[]) => set({ pendingEffects }),
    setEffectQueue: (effectQueue: ActiveEffect[]) => set({ effectQueue }),
    setActiveCardId: (activeCardId: string | null) => set({ activeCardId }),

    setReprogramSource: (source: Coordinate | null) => set({ reprogramTargetSource: source }),
    setPendingNetDamage: (pendingNetDamage: number) => set({ pendingNetDamage }),
    setIsCardCommitted: (isCardCommitted: boolean) => set({ isCardCommitted }),
}));
