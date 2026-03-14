import { nodeRegistry } from './registry/NodeRegistry';
import type { NetworkNode, NodeType } from './types';

export const generateGraph = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];
    const MAX_DEPTH = 5; // depth levels 0 to 4
    let nodeIdCounter = 0;

    /**
     * Generates a single NetworkNode.
     * @param typeOverride — forces a specific NodeType. HOME is hand-built;
     *   MAINFRAME / ICE / SERVER delegate to nodeRegistry.selectNodeByType.
     *   undefined falls through to a random pool pick (legacy path).
     */
    const generateNode = (
        typeOverride?: NodeType,
        gridX: number = 1,
        gridY: number = 0
    ): NetworkNode => {
        let node: NetworkNode;

        if (typeOverride === 'HOME') {
            node = {
                id: `node-${nodeIdCounter++}-HOME`,
                type: 'HOME',
                name: 'Home Gateway',
                difficulty: 0,
                layers: {},
                progress: {},
                countermeasures: [],
                resetTrace: 0,
                status: 'ACTIVE',
                visibility: 'REVEALED',
                children: [],
                gridX,
                gridY
            } as NetworkNode;
        } else if (typeOverride) {
            // ICE, SERVER, or MAINFRAME — resolved via registry type filter
            const diff = typeOverride === 'MAINFRAME'
                ? 5
                : Math.floor((gridY - 1) / 3) + 1;
            node = nodeRegistry.selectNodeByType(typeOverride, diff);
            node.id = `node-${nodeIdCounter++}-${node.name.replace(/\s/g, '')}-${Date.now()}`;
            node.type = typeOverride;       // enforce override in case registry returned a different sub-type
            node.gridX = gridX;
            node.gridY = gridY;
            node.status = 'ACTIVE';
            node.visibility = 'HIDDEN';
            node.children = [];
        } else {
            // Legacy random path (no type constraint)
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

    // ─── Row 0: HOME ──────────────────────────────────────────────────
    let currentRow = [generateNode('HOME', 1, 0)];

    // ─── Pre-compute terminal row composition ─────────────────────────
    // Exactly 3 terminal nodes at gridX 0, 1, 2.
    // One MAINFRAME at a random position, two SERVERs elsewhere.
    const mainframeX = Math.floor(Math.random() * 3); // 0, 1, or 2
    const terminalTypes: Record<number, NodeType> = {
        0: mainframeX === 0 ? 'MAINFRAME' : 'SERVER',
        1: mainframeX === 1 ? 'MAINFRAME' : 'SERVER',
        2: mainframeX === 2 ? 'MAINFRAME' : 'SERVER',
    };

    // ─── Build rows 1 → MAX_DEPTH-1 ──────────────────────────────────
    for (let y = 0; y < MAX_DEPTH - 1; y++) {
        const nextY = y + 1;
        const isTerminalRow   = nextY === MAX_DEPTH - 1;        // y+1 == 4
        const isPenultimateRow = nextY === MAX_DEPTH - 2;       // y+1 == 3

        const requestedConnections: { parent: NetworkNode; targetX: number }[] = [];

        for (const parent of currentRow) {
            // ── Connection count ──────────────────────────────────────
            let connCount = 1;
            if (parent.type === 'HOME') {
                connCount = 3;
            } else if (isPenultimateRow) {
                // Penultimate parents → 1–2 children for coverage
                const rand = Math.random();
                connCount = rand > 0.5 ? 2 : 1;
            } else if (!isTerminalRow) {
                const diffBase = parent.difficulty || 1;
                const rand = Math.random();
                if (diffBase >= 3) {
                    connCount = rand > 0.5 ? 2 : 1;
                } else {
                    connCount = rand > 0.8 ? 3 : (rand > 0.3 ? 2 : 1);
                }
            }

            // ── Target X candidates ───────────────────────────────────
            if (isTerminalRow) {
                // Penultimate → terminal: default straight-up only
                connCount = 1;
                requestedConnections.push({ parent, targetX: parent.gridX });
            } else {
                const candidates = [parent.gridX - 1, parent.gridX, parent.gridX + 1]
                    .filter(x => x >= 0 && x <= 2);
                candidates.sort(() => Math.random() - 0.5);
                const targets = candidates.slice(0, connCount);
                for (const tX of targets) {
                    requestedConnections.push({ parent, targetX: tX });
                }
            }
        }


        // ── Handle Crossings: drop connections that cross diagonally ──
        {
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

                        if (x1Start === x2Start) continue;
                        if (x1End === x2End) continue;

                        if ((x1Start < x2Start && x1End > x2End) || (x1Start > x2Start && x1End < x2End)) {
                            requestedConnections.splice(j, 1);
                            crossingsExist = true;
                            break;
                        }
                    }
                    if (crossingsExist) break;
                }
            }
        }

        // ── Penultimate Orphan Resolution ─────────────────────────────
        // Placed AFTER crossing removal so forced connections cannot be
        // stripped.  Guarantees all 3 X-coordinates (0, 1, 2) are
        // present before the strictly-vertical terminal row ascent.
        if (isPenultimateRow) {
            const targetedXs = new Set(requestedConnections.map(c => c.targetX));
            for (let x = 0; x <= 2; x++) {
                if (!targetedXs.has(x)) {
                    // Pick the closest parent from currentRow to form a diagonal
                    const sorted = [...currentRow].sort(
                        (a, b) => Math.abs(a.gridX - x) - Math.abs(b.gridX - x)
                    );
                    requestedConnections.push({ parent: sorted[0], targetX: x });
                }
            }
        }

        // ── Post-Injection Crossing Pass ──────────────────────────────
        // Orphan-resolution connections (appended at the tail) may cross
        // existing natural diagonals.  When that happens we cull the
        // *natural* line (lower index) to preserve the structural
        // injection that guarantees 3-wide penultimate coverage.
        if (isPenultimateRow) {
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

                        if (x1Start === x2Start) continue;
                        if (x1End === x2End) continue;

                        if ((x1Start < x2Start && x1End > x2End) || (x1Start > x2Start && x1End < x2End)) {
                            // Cull the earlier (natural) connection,
                            // preserving the later (injected) one.
                            requestedConnections.splice(i, 1);
                            crossingsExist = true;
                            break;
                        }
                    }
                    if (crossingsExist) break;
                }
            }
        }

        // ── Anti-Termination Safeguard ────────────────────────────────
        for (const parent of currentRow) {
            const hasConnection = requestedConnections.some(conn => conn.parent.id === parent.id);
            if (!hasConnection) {
                const safeTx = parent.gridX;
                requestedConnections.push({ parent, targetX: safeTx });
            }
        }

        // ── Instantiate nodes in the new row ──────────────────────────
        const nextRowNodesByX: Record<number, NetworkNode> = {};

        for (const conn of requestedConnections) {
            if (!nextRowNodesByX[conn.targetX]) {
                let typeForNode: NodeType | undefined;
                if (isTerminalRow) {
                    typeForNode = terminalTypes[conn.targetX];
                } else {
                    // Middle tier: force ICE
                    typeForNode = 'ICE';
                }
                nextRowNodesByX[conn.targetX] = generateNode(typeForNode, conn.targetX, nextY);
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
