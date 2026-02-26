import { create } from 'zustand';
import type { Card } from '../engine/types';

interface DeckState {
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    trashPile: Card[];
    maxHandSize: number;

    setHand: (hand: Card[]) => void;
    setDeck: (deck: Card[]) => void;
    setDiscardPile: (discardPile: Card[]) => void;
    setTrashPile: (trashPile: Card[]) => void;
    setMaxHandSize: (maxHandSize: number) => void;
}

export const useDeckStore = create<DeckState>((set) => ({
    hand: [],
    deck: [],
    discardPile: [],
    trashPile: [],
    maxHandSize: 4,
    setHand: (hand) => set({ hand }),
    setDeck: (deck) => set({ deck }),
    setDiscardPile: (discardPile) => set({ discardPile }),
    setTrashPile: (trashPile) => set({ trashPile }),
    setMaxHandSize: (maxHandSize) => set({ maxHandSize }),
}));
