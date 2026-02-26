import { create } from 'zustand';
import type { ServerNode } from '../engine/types';

interface ServerState {
    activeServers: ServerNode[];
    deepMap: ServerNode[];
    setActiveServers: (servers: ServerNode[]) => void;
    setDeepMap: (map: ServerNode[]) => void;
}

export const useServerStore = create<ServerState>((set) => ({
    activeServers: [],
    deepMap: [],
    setActiveServers: (activeServers) => set({ activeServers }),
    setDeepMap: (deepMap) => set({ deepMap }),
}));
