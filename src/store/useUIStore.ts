import { create } from 'zustand';

interface UIState {
    selectedCardId: string | null;
    rotation: number;
    setSelectedCardId: (id: string | null) => void;
    setRotation: (rot: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    selectedCardId: null,
    rotation: 0,
    setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
    setRotation: (rotation) => set({ rotation }),
}));
