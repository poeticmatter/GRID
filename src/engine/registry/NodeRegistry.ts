import type { NodeDefinition, NetworkNode, NodeType, CellColor } from '../types';

export class NodeRegistry {
    private static instance: NodeRegistry;
    private idCounter = 0;
    private pool: Record<string, NodeDefinition[]> = {};

    private constructor() { }

    public static getInstance(): NodeRegistry {
        if (!NodeRegistry.instance) {
            NodeRegistry.instance = new NodeRegistry();
        }
        return NodeRegistry.instance;
    }

    public initialize(pool: Record<string, NodeDefinition[]>) {
        this.pool = pool;
    }

    public getRandomPoolId(): string {
        const poolKeys = Object.keys(this.pool);
        if (poolKeys.length === 0) {
            return 'FallbackPool';
        }
        const index = Math.floor(Math.random() * poolKeys.length);
        return poolKeys[index];
    }

    public selectNode(poolId: string, targetDifficulty?: number): NetworkNode {
        const pool = this.pool[poolId];
        if (!pool || pool.length === 0) {
            return this.createNetworkNode({
                type: 'SERVER',
                name: 'Fallback Node',
                baseDifficulty: 1,
                weight: 1,
                layers: { ORANGE: [1] },
                countermeasures: [{ requiredSymbols: [], type: 'TRACE', value: 5 }]
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

    /**
     * Select a node filtered by NodeType across ALL pools.
     * Uses weighted random selection among matching definitions.
     */
    public selectNodeByType(nodeType: NodeType, targetDifficulty?: number): NetworkNode {
        // Aggregate all definitions from every pool
        const allDefs: NodeDefinition[] = Object.values(this.pool).flat();

        // Filter by requested type
        let candidates = allDefs.filter(d => d.type === nodeType);

        if (candidates.length === 0) {
            const poolId = this.getRandomPoolId();
            return this.selectNode(poolId, targetDifficulty);
        }

        if (targetDifficulty !== undefined) {
            let filtered = candidates.filter(n => n.baseDifficulty === targetDifficulty);

            if (filtered.length === 0) {
                // Closest difficulty fallback
                let closestDiff = -1;
                let minDiffDiff = Infinity;
                candidates.forEach(n => {
                    const diff = Math.abs(n.baseDifficulty - targetDifficulty);
                    if (diff < minDiffDiff) {
                        minDiffDiff = diff;
                        closestDiff = n.baseDifficulty;
                    } else if (diff === minDiffDiff && n.baseDifficulty < closestDiff) {
                        closestDiff = n.baseDifficulty;
                    }
                });
                filtered = candidates.filter(n => n.baseDifficulty === closestDiff);
            }
            candidates = filtered;
        }

        // Weighted random selection
        let totalWeight = 0;
        const cumulativeWeights: number[] = [];

        for (const candidate of candidates) {
            totalWeight += candidate.weight;
            cumulativeWeights.push(totalWeight);
        }

        const roll = Math.random() * totalWeight;
        let selectedDef = candidates[candidates.length - 1];

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
            countermeasures: [...def.countermeasures],
            globalCountermeasures: def.globalCountermeasures ? [...def.globalCountermeasures] : [],
            status: 'ACTIVE',
            visibility: 'HIDDEN',
            children: [],
            gridX: 0,
            gridY: 0,
            hasHorizontalConnection: def.hasHorizontalConnection ?? false
        };
    }
}

export const nodeRegistry = NodeRegistry.getInstance();
