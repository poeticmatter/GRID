import { create } from 'zustand';
import type { PlaybackEvent } from '../engine/orchestrator/types';

export type { PlaybackEvent };

interface VisualQueueState {
    queue: PlaybackEvent[];
    isPlaying: boolean;
    enqueue: (events: PlaybackEvent[]) => void;
    dequeue: () => PlaybackEvent | undefined;
    setPlaying: (playing: boolean) => void;
}

export const useVisualQueueStore = create<VisualQueueState>((set, get) => ({
    queue: [],
    isPlaying: false,

    enqueue: (events: PlaybackEvent[]) => {
        // Only enqueue events that carry meaningful duration or payload
        const filtered = events.filter(e => e.durationMs > 0 || e.payload !== undefined);
        if (filtered.length === 0) return;

        set(state => ({
            queue: [...state.queue, ...filtered],
            isPlaying: true
        }));
    },

    dequeue: () => {
        const state = get();
        if (state.queue.length === 0) {
            if (state.isPlaying) set({ isPlaying: false });
            return undefined;
        }
        const next = state.queue[0];
        set({ queue: state.queue.slice(1) });
        return next;
    },

    setPlaying: (isPlaying) => set({ isPlaying })
}));
