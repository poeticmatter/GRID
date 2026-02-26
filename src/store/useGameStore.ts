import { create } from 'zustand';

export type GamePhase = 'MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

interface GameState {
    gameState: GamePhase;
    turn: number;
    setGameState: (state: GamePhase) => void;
    setTurn: (turn: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
    gameState: 'MENU',
    turn: 1,
    setGameState: (gameState) => set({ gameState }),
    setTurn: (turn) => set({ turn }),
}));
