import { create } from 'zustand';

export interface LogEntry {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'danger';
    timestamp: number;
}

interface LogState {
    entries: LogEntry[];
    addLog: (message: string, type: LogEntry['type']) => void;
    clear: () => void;
}

let _counter = 0;

export const useLogStore = create<LogState>((set) => ({
    entries: [],
    addLog: (message, type) => set((state) => {
        const entry: LogEntry = {
            id: `log-${++_counter}`,
            message,
            type,
            timestamp: Date.now()
        };
        // Keep only the last 40 entries
        const entries = [...state.entries, entry].slice(-40);
        return { entries };
    }),
    clear: () => set({ entries: [] }),
}));
