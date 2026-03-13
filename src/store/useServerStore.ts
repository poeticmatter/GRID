import { create } from 'zustand';
import type { NetworkNode, NodeRecord } from '../engine/types';
import { produce } from 'immer';

interface NodeState {
    // SSOT: all network nodes keyed by id.
    nodes: NodeRecord;
    // Index: ids of nodes that are currently "active" (visible targets for the player).
    activeServerIds: string[];



    // Mutators
    setNodes: (nodes: NodeRecord) => void;
    setActiveServerIds: (ids: string[]) => void;
    patchNode: (id: string, patch: Partial<NetworkNode>) => void;
    patchNodes: (patches: Record<string, Partial<NetworkNode>>) => void;
}

export const useServerStore = create<NodeState>((set, get) => ({
    nodes: {},
    activeServerIds: [],

    setNodes: (nodes) => set({ nodes }),
    setActiveServerIds: (activeServerIds) => set({ activeServerIds }),

    patchNode: (id, patch) => set(state => ({
        nodes: produce(state.nodes, draft => {
            if (draft[id]) {
                Object.assign(draft[id], patch);
            }
        })
    })),

    patchNodes: (patches) => set(state => ({
        nodes: produce(state.nodes, draft => {
            for (const [id, patch] of Object.entries(patches)) {
                if (draft[id]) {
                    Object.assign(draft[id], patch);
                }
            }
        })
    })),
}));
