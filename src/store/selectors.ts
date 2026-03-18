import { useMemo } from 'react';
import { useServerStore } from './useServerStore';
import type { Countermeasure } from '../engine/types';

/**
 * Imperative read — safe to call outside React (e.g. inside the orchestrator pipeline).
 * Returns the flattened globalCountermeasures from all active SERVER/MAINFRAME nodes.
 */
export function getActiveGlobalCountermeasures(): Countermeasure[] {
    const { nodes } = useServerStore.getState();
    const result: Countermeasure[] = [];
    for (const node of Object.values(nodes)) {
        if (node && (node.type === 'SERVER' || node.type === 'MAINFRAME') && node.status !== 'HACKED' && node.globalCountermeasures?.length) {
            result.push(...node.globalCountermeasures);
        }
    }
    return result;
}

/**
 * React hook — memoized on nodes/activeServerIds so the returned array is stable
 * between renders unless the relevant server state actually changes.
 */
export function useActiveGlobalCountermeasures(): Countermeasure[] {
    const nodes = useServerStore(s => s.nodes);

    return useMemo(() => {
        const result: Countermeasure[] = [];
        for (const node of Object.values(nodes)) {
            if (node && (node.type === 'SERVER' || node.type === 'MAINFRAME') && node.status !== 'HACKED' && node.globalCountermeasures?.length) {
                result.push(...node.globalCountermeasures);
            }
        }
        return result;
    }, [nodes]);
}
