import { nodeRegistry } from './registry/NodeRegistry';
import type { NetworkNode } from './types';

export const generateGraph = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];
    const MAX_DEPTH = 5; // depth levels 0 to 4
    let nodeIdCounter = 0;

    const generateNode = (typeOverride?: 'HOME' | 'MAINFRAME', gridX: number = 1, gridY: number = 0): NetworkNode => {
        let node: NetworkNode;
        if (typeOverride === 'HOME') {
            node = {
                id: `node-${nodeIdCounter++}-HOME`,
                type: 'HOME',
                name: 'Home Gateway',
                difficulty: 0,
                layers: {},
                progress: {},
                countermeasures: {},
                resetTrace: 0,
                status: 'ACTIVE',
                visibility: 'REVEALED',
                children: [],
                gridX,
                gridY
            } as NetworkNode;
        } else if (typeOverride === 'MAINFRAME') {
            const mfPool = nodeRegistry.getRandomPoolId();
            node = nodeRegistry.selectNode(mfPool, 5);
            node.id = `node-${nodeIdCounter++}-MAINFRAME-${Date.now()}`;
            node.gridX = gridX;
            node.gridY = gridY;
            node.status = 'ACTIVE';
            node.visibility = 'HIDDEN';
            node.children = [];
        } else {
            const poolId = nodeRegistry.getRandomPoolId();
            const diff = Math.floor((gridY - 1) / 3) + 1;
            node = nodeRegistry.selectNode(poolId, diff);
            node.id = `node-${nodeIdCounter++}-${node.name.replace(/\s/g, '')}-${Date.now()}`;
            node.gridX = gridX;
            node.gridY = gridY;
            node.status = 'ACTIVE';
            node.visibility = 'HIDDEN';
            node.children = [];
        }

        // Initialize progress arrays
        if (!node.progress) {
            node.progress = {};
        }
        for (const color of Object.keys(node.layers || {})) {
            const c = color as import('./types').CellColor;
            if (!node.progress[c]) {
                node.progress[c] = Array(node.layers[c]?.length || 0).fill(false);
            }
        }

        nodes.push(node);
        return node;
    };

    let currentRow = [generateNode('HOME', 1, 0)];

    for (let y = 0; y < MAX_DEPTH - 1; y++) {
        const nextY = y + 1;
        const isLastRow = nextY === MAX_DEPTH - 1;

        const requestedConnections: { parent: NetworkNode, targetX: number }[] = [];

        for (const parent of currentRow) {
            // Evaluate connection count (1-3) based on its node data
            let connCount = 1;
            if (parent.type === 'HOME') {
                connCount = 3;
            } else {
                // Heuristic mapping difficulty to num connections for variety
                const diffBase = parent.difficulty || 1;
                // E.g., slightly random connection count leaning towards 1-2, rarely 3 to not overclutter
                const rand = Math.random();
                if (diffBase >= 3) {
                    connCount = rand > 0.5 ? 2 : 1;
                } else {
                    connCount = rand > 0.8 ? 3 : (rand > 0.3 ? 2 : 1);
                }
            }
            if (isLastRow) {
                connCount = 1; // only need 1 connection to Mainframe
            }

            const candidates = [parent.gridX - 1, parent.gridX, parent.gridX + 1].filter(x => x >= 0 && x <= 2);
            // Shuffle and slice
            candidates.sort(() => Math.random() - 0.5);
            const targets = candidates.slice(0, connCount);

            for (let tX of targets) {
                if (isLastRow) {
                    tX = 1; // Force Mainframe to center column
                }
                requestedConnections.push({ parent, targetX: tX });
            }
        }

        // Handle Crossings: drop connections that cross diagonally
        let crossingsExist = true;
        while (crossingsExist) {
            crossingsExist = false;
            for (let i = 0; i < requestedConnections.length; i++) {
                for (let j = i + 1; j < requestedConnections.length; j++) {
                    const c1 = requestedConnections[i];
                    const c2 = requestedConnections[j];

                    const x1Start = c1.parent.gridX;
                    const x1End = c1.targetX;
                    const x2Start = c2.parent.gridX;
                    const x2End = c2.targetX;

                    if (x1Start === x2Start) continue; // Same origin, branching
                    if (x1End === x2End) continue;     // Merging into same node

                    // Crossing condition: lines swap relative x-positions
                    if ((x1Start < x2Start && x1End > x2End) || (x1Start > x2Start && x1End < x2End)) {
                        // Silently drop one offending connection
                        requestedConnections.splice(j, 1);
                        crossingsExist = true;
                        break;
                    }
                }
                if (crossingsExist) break;
            }
        }

        // Anti-Termination Safeguard
        for (const parent of currentRow) {
            const hasConnection = requestedConnections.some(conn => conn.parent.id === parent.id);
            if (!hasConnection) {
                const safeTx = isLastRow ? 1 : parent.gridX;
                requestedConnections.push({ parent, targetX: safeTx });
            }
        }

        // Instantiate nodes in the new row
        const nextRowNodesByX: Record<number, NetworkNode> = {};

        for (const conn of requestedConnections) {
            if (!nextRowNodesByX[conn.targetX]) {
                nextRowNodesByX[conn.targetX] = generateNode(isLastRow ? 'MAINFRAME' : undefined, conn.targetX, nextY);
            }
            const childNode = nextRowNodesByX[conn.targetX];

            if (!conn.parent.children.includes(childNode.id)) {
                conn.parent.children.push(childNode.id);
            }
        }

        // Move to next row
        currentRow = Object.values(nextRowNodesByX);
    }

    // Initial revealed nodes are children of Home.
    const homeNode = nodes.find(n => n.type === 'HOME');
    if (homeNode) {
        homeNode.children.forEach(childId => {
            const child = nodes.find(n => n.id === childId);
            if (child) {
                child.visibility = 'REVEALED';
            }
        });
    }

    return nodes;
};
