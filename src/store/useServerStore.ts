import { create } from 'zustand';
import type { NetworkNode } from '../engine/types';

interface NodeState {
    activeServers: NetworkNode[];
    networkGraph: NetworkNode[];
    setActiveServers: (servers: NetworkNode[]) => void;
    setNetworkGraph: (graph: NetworkNode[]) => void;
}

export const useServerStore = create<NodeState>((set) => ({
    activeServers: [],
    networkGraph: [],
    setActiveServers: (activeServers) => set({ activeServers }),
    setNetworkGraph: (networkGraph) => set({ networkGraph }),
}));
