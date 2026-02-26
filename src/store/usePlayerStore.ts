import { create } from 'zustand';
import type { PlayerStats } from '../engine/types';

interface PlayerState {
    playerStats: PlayerStats;
    setPlayerStats: (stats: PlayerStats) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    playerStats: {
        hardwareHealth: 3,
        maxHardwareHealth: 3,
        trace: 0,
        credits: 0,
    },
    setPlayerStats: (playerStats) => set({ playerStats }),
}));
