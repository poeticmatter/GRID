import { create } from 'zustand';
import { useGridStore } from '../store/useGridStore';
import { useServerStore } from '../store/useServerStore';
import { useVisualQueueStore } from '../store/useVisualQueueStore';
import type { Grid, NodeRecord } from '../engine/types';
import { useEffect } from 'react';
import { gameEventBus } from '../engine/eventBus';
import { produce } from 'immer';

interface ViewModelStore {
    visualGrid: Grid | null;
    visualNodes: NodeRecord | null;
    visualActiveServerIds: string[] | null;

    syncWithStores: () => void;
    updateVisualGrid: (patch: Grid) => void;
    updateVisualNodes: (nodes: NodeRecord, activeIds: string[]) => void;
}

export const useViewModelStore = create<ViewModelStore>((set, get) => ({
    visualGrid: null,
    visualNodes: null,
    visualActiveServerIds: null,

    syncWithStores: () => {
        const grid = useGridStore.getState().grid;
        const nodes = useServerStore.getState().nodes;
        const activeIds = useServerStore.getState().activeServerIds;
        set({
            visualGrid: grid,
            visualNodes: nodes,
            visualActiveServerIds: activeIds
        });
    },

    updateVisualGrid: (grid) => set({ visualGrid: grid }),
    updateVisualNodes: (nodes, activeIds) => set({ visualNodes: nodes, visualActiveServerIds: activeIds }),
}));

/**
 * useViewModel Hook
 * The primary interface for UI components to read "interpolated" game state.
 * If playback is active, it returns the visual buffer.
 * If playback is idle, it returns the logical SSOT.
 */
export const useViewModel = () => {
    const isPlaying = useVisualQueueStore(state => state.isPlaying);

    // Logical State
    const logicalGrid = useGridStore(state => state.grid);
    const logicalNodes = useServerStore(state => state.nodes);
    const logicalActiveIds = useServerStore(state => state.activeServerIds);

    // Visual State
    const visualGrid = useViewModelStore(state => state.visualGrid);
    const visualNodes = useViewModelStore(state => state.visualNodes);
    const visualActiveIds = useViewModelStore(state => state.visualActiveServerIds);

    // If we're not playing, always return logical truth.
    // If we are playing, return the visual buffer (or logical if buffer is empty/uninitialized).
    const grid = isPlaying && visualGrid ? visualGrid : logicalGrid;
    const nodes = isPlaying && visualNodes ? visualNodes : logicalNodes;
    const activeServerIds = isPlaying && visualActiveIds ? visualActiveIds : logicalActiveIds;

    return {
        grid,
        nodes,
        activeServerIds,
    };
};

/**
 * useViewModelManager Hook
 * Used by the root layout to initialize the VM listeners.
 */
export const useViewModelManager = () => {
    useEffect(() => {
        const handleAnimateCells = () => {
            useViewModelStore.getState().updateVisualGrid(useGridStore.getState().grid);
        };

        const handleAnimateNodes = () => {
            const nodes = useServerStore.getState().nodes;
            const ids = useServerStore.getState().activeServerIds;
            useViewModelStore.getState().updateVisualNodes(nodes, ids);
        };

        gameEventBus.on('VISUAL_ANIMATE_CELLS', handleAnimateCells);
        gameEventBus.on('VISUAL_ANIMATE_NODES', handleAnimateNodes);

        return () => {
            gameEventBus.off('VISUAL_ANIMATE_CELLS', handleAnimateCells);
            gameEventBus.off('VISUAL_ANIMATE_NODES', handleAnimateNodes);
        };
    }, []);
};
