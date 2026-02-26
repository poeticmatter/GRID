import { create } from 'zustand';
import type { Effect, Coordinate } from '../engine/types';
import { useDeckStore } from './useDeckStore';
import { useGridStore } from './useGridStore';
import { Dispatch } from '../engine/orchestrator';
import { refillGrid } from '../engine/grid-logic';

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

    playCard: (cardId: string, effects: Effect[]) => void;
    queueEffect: (effect: Effect) => void;
    confirmEffectOrder: () => void;
    popEffect: () => ActiveEffect | undefined;
    unshiftEffect: (effect: ActiveEffect) => void;
    setReprogramSource: (source: Coordinate | null) => void;
    clearEffectState: () => void;

    processQueue: () => void;
    executeCut: (x: number, y: number) => void;
    executeSystemReset: () => void;
    executeReprogram: (dest: Coordinate) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    gameState: 'MENU',
    turn: 1,

    pendingEffects: [],
    effectQueue: [],
    activeCardId: null,
    reprogramTargetSource: null,

    setGameState: (gameState) => set({ gameState }),
    setTurn: (turn) => set({ turn }),

    playCard: (cardId, effects) => {
        if (effects.length > 1) {
            set({
                gameState: 'EFFECT_ORDERING',
                activeCardId: cardId,
                pendingEffects: [...effects],
                effectQueue: [],
                reprogramTargetSource: null,
            });
        } else if (effects.length === 1) {
            set({
                gameState: 'EFFECT_RESOLUTION',
                activeCardId: cardId,
                pendingEffects: [],
                effectQueue: [{ cardId, effect: effects[0] }],
                reprogramTargetSource: null,
            });
            setTimeout(() => get().processQueue(), 0);
        }
    },

    queueEffect: (effect) => {
        set((state) => ({
            pendingEffects: state.pendingEffects.filter(e => e !== effect),
            effectQueue: [...state.effectQueue, { cardId: state.activeCardId!, effect }]
        }));
    },

    confirmEffectOrder: () => {
        set({ gameState: 'EFFECT_RESOLUTION' });
        setTimeout(() => get().processQueue(), 0);
    },

    popEffect: () => {
        let popped: ActiveEffect | undefined;
        set(state => {
            const queue = [...state.effectQueue];
            popped = queue.shift();
            return { effectQueue: queue };
        });
        return popped;
    },

    unshiftEffect: (effect) => {
        set(state => ({
            effectQueue: [effect, ...state.effectQueue]
        }));
    },

    setReprogramSource: (source) => set({ reprogramTargetSource: source }),

    clearEffectState: () => set({
        gameState: 'PLAYING',
        pendingEffects: [],
        effectQueue: [],
        activeCardId: null,
        reprogramTargetSource: null
    }),

    processQueue: () => {
        const state = get();
        if (state.effectQueue.length === 0) {
            const cardId = state.activeCardId;
            if (cardId) {
                const deckStore = useDeckStore.getState();
                const card = deckStore.hand.find((c: any) => c.id === cardId);
                if (card) {
                    const hasReset = card.effects.some((e: any) => e.type === 'SYSTEM_RESET');
                    if (!hasReset) {
                        deckStore.setHand(deckStore.hand.filter((c: any) => c.id !== cardId));
                        deckStore.setDiscardPile([...deckStore.discardPile, card]);
                    }
                }
            }
            get().clearEffectState();
            return;
        }

        const active = state.effectQueue[0];
        if (active.effect.type === 'SYSTEM_RESET') {
            get().executeSystemReset();
        }
    },

    executeCut: (x, y) => {
        const state = get();
        const active = state.effectQueue[0];
        if (active && active.effect.type === 'CUT') {
            Dispatch({
                type: 'RESOLVE_CUT',
                payload: { x, y, pattern: active.effect.pattern }
            });
            get().popEffect();
            get().processQueue();
        }
    },

    executeSystemReset: () => {
        const deckStore = useDeckStore.getState();
        const gridStore = useGridStore.getState();

        // Return discard to hand cleanly
        const newHand = [...deckStore.hand, ...deckStore.discardPile];
        deckStore.setHand(newHand);
        deckStore.setDiscardPile([]);

        const refilled = refillGrid(gridStore.grid, gridStore.refillRate);
        gridStore.setGrid(refilled);

        set(state => ({ turn: state.turn + 1 }));

        get().popEffect();
        get().processQueue();
    },

    executeReprogram: (dest) => {
        const state = get();
        const gridStore = useGridStore.getState();
        const source = state.reprogramTargetSource;
        if (!source) return;

        const grid = [...gridStore.grid.map(row => [...row])];
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
            gridStore.setGrid(grid);
        }

        const activeEffect = state.effectQueue[0];
        if (activeEffect && activeEffect.effect.type === 'REPROGRAM') {
            const nextAmount = activeEffect.effect.amount - 1;
            if (nextAmount <= 0) {
                get().popEffect();
                get().setReprogramSource(null);
                get().processQueue();
            } else {
                const newQueue = [...state.effectQueue];
                newQueue[0] = { ...activeEffect, effect: { type: 'REPROGRAM', amount: nextAmount } };
                set({ effectQueue: newQueue, reprogramTargetSource: null });
            }
        }
    }
}));
