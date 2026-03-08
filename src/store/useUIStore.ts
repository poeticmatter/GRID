import { create } from 'zustand';

export interface SpatialMetrics {
    cellSize: number;
    gapSize: number;
    nodeRadius: number;
}

interface UIState {
    selectedCardId: string | null;
    rotation: number;
    spatialMetrics: SpatialMetrics;
    setSelectedCardId: (id: string | null) => void;
    setRotation: (rot: number) => void;
    setSpatialMetrics: (metrics: SpatialMetrics) => void;
}

export const useUIStore = create<UIState>((set) => ({
    selectedCardId: null,
    rotation: 0,
    spatialMetrics: {
        cellSize: 48,
        gapSize: 4,
        nodeRadius: 4,
    },
    setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
    setRotation: (rotation) => set({ rotation }),
    setSpatialMetrics: (spatialMetrics) => set({ spatialMetrics }),
}));
