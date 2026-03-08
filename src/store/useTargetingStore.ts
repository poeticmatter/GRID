import { create } from 'zustand';
import type { Coordinate } from '../engine/types';

interface TargetingState {
    hoveredCoordinate: Coordinate | null;
    setHoveredCoordinate: (coord: Coordinate | null) => void;
}

export const useTargetingStore = create<TargetingState>((set) => ({
    hoveredCoordinate: null,
    setHoveredCoordinate: (coord) => set({ hoveredCoordinate: coord }),
}));
