import { create } from 'zustand';
import type { NetworkNode } from '../engine/types';

interface NodeState {
    activeServers: NetworkNode[];
    deepMap: NetworkNode[];
    setActiveServers: (servers: NetworkNode[]) => void;
    setDeepMap: (map: NetworkNode[]) => void;
}

export const useServerStore = create<NodeState>((set) => ({
    activeServers: [],
    deepMap: [],
    setActiveServers: (activeServers) => set({ activeServers }),
    setDeepMap: (deepMap) => set({ deepMap }),
}));
