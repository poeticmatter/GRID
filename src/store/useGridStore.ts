import { create } from 'zustand';
import type { Grid } from '../engine/types';

interface GridState {
    grid: Grid;
    refillRate: number;
    setGrid: (grid: Grid) => void;
    setRefillRate: (rate: number) => void;
}

export const useGridStore = create<GridState>((set) => ({
    grid: [],
    refillRate: 5,
    setGrid: (grid) => set({ grid }),
    setRefillRate: (refillRate) => set({ refillRate }),
}));
