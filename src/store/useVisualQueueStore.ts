import { create } from 'zustand';
import type { StateDeltas } from '../engine/orchestrator/types';

export interface VisualAction {
    deltas: StateDeltas;
}

interface VisualQueueState {
    queue: VisualAction[];
    isPlaying: boolean;
    enqueue: (actions: StateDeltas[]) => void;
    dequeue: () => VisualAction | undefined;
    setPlaying: (playing: boolean) => void;
}

export const useVisualQueueStore = create<VisualQueueState>((set, get) => ({
    queue: [],
    isPlaying: false,

    enqueue: (deltasArray: StateDeltas[]) => {
        // Only enqueue steps that actually change something (or have events) to avoid empty zero-frames
        const actions = deltasArray
            .filter(deltas => Object.keys(deltas).length > 0)
            .map(deltas => ({ deltas }));

        set(state => ({
            queue: [...state.queue, ...actions],
            isPlaying: true // Start playing automatically
        }));
    },

    dequeue: () => {
        const state = get();
        if (state.queue.length === 0) {
            if (state.isPlaying) set({ isPlaying: false });
            return undefined;
        }

        const nextAction = state.queue[0];
        set({ queue: state.queue.slice(1) });
        return nextAction;
    },

    setPlaying: (isPlaying) => set({ isPlaying })
}));
