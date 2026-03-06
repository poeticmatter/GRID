import { NodePools } from '../../data/nodes';
import type { NodeDefinition, NetworkNode } from '../types';

export class NodeRegistry {
    private static instance: NodeRegistry;
    private idCounter = 0;

    private constructor() { }

    public static getInstance(): NodeRegistry {
        if (!NodeRegistry.instance) {
            NodeRegistry.instance = new NodeRegistry();
        }
        return NodeRegistry.instance;
    }

    public getRandomPoolId(): string {
        const poolKeys = Object.keys(NodePools);
        if (poolKeys.length === 0) {
            console.warn('NodePools is empty, returning fallback name');
            return 'FallbackPool';
        }
        const index = Math.floor(Math.random() * poolKeys.length);
        return poolKeys[index];
    }

    public selectNode(poolId: string, targetDifficulty?: number): NetworkNode {
        const pool = NodePools[poolId];
        if (!pool || pool.length === 0) {
            // Fallback for missing pool
            console.warn(`Pool ${String(poolId)} is missing or empty. Using default node.`);
            return this.createNetworkNode({
                type: 'SERVER',
                name: 'Fallback Node',
                baseDifficulty: 1,
                weight: 1,
                layers: { RED: [{ symbol: 'NONE' }] },
                countermeasures: { EYE: { type: 'TRACE', value: 5 } },
                resetTrace: 1
            });
        }

        let candidates = pool;

        if (targetDifficulty !== undefined) {
            // Filter exactly
            let filtered = pool.filter(n => n.baseDifficulty === targetDifficulty);

            // Fallback behavior: pool exhaustion/filtering
            if (filtered.length === 0) {
                // Find closest match below, then above
                let closestDiff = -1;
                let minDiffDiff = Infinity;
                pool.forEach(n => {
                    const diff = Math.abs(n.baseDifficulty - targetDifficulty);
                    if (diff < minDiffDiff) {
                        minDiffDiff = diff;
                        closestDiff = n.baseDifficulty;
                    } else if (diff === minDiffDiff && n.baseDifficulty < closestDiff) {
                        closestDiff = n.baseDifficulty;
                    }
                });
                filtered = pool.filter(n => n.baseDifficulty === closestDiff);
            }
            candidates = filtered;
        }

        // Cumulative weight array (prefix sums)
        let totalWeight = 0;
        const cumulativeWeights: number[] = [];

        for (const candidate of candidates) {
            totalWeight += candidate.weight;
            cumulativeWeights.push(totalWeight);
        }

        const roll = Math.random() * totalWeight;
        let selectedDef = candidates[candidates.length - 1]; // fallback

        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (roll <= cumulativeWeights[i]) {
                selectedDef = candidates[i];
                break;
            }
        }

        return this.createNetworkNode(selectedDef);
    }

    private createNetworkNode(def: NodeDefinition): NetworkNode {
        this.idCounter++;
        const newLayers: Partial<Record<CellColor, any>> = {};
        const newProgress: Partial<Record<CellColor, boolean[]>> = {};

        for (const [colorStr, lanes] of Object.entries(def.layers)) {
            const color = colorStr as CellColor;
            if (lanes && lanes.length > 0) {
                newLayers[color] = [...lanes];
                newProgress[color] = Array(lanes.length).fill(false);
            }
        }

        return {
            id: `node-${this.idCounter}-${Date.now()}`,
            type: def.type,
            name: def.name,
            difficulty: def.baseDifficulty,
            layers: newLayers,
            progress: newProgress,
            countermeasures: { ...def.countermeasures },
            resetTrace: def.resetTrace,
            status: 'ACTIVE',
            visibility: 'HIDDEN',
            children: []
        };
    }
}

export const nodeRegistry = NodeRegistry.getInstance();
