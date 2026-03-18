import { nodeRegistry } from './registry/NodeRegistry';
import type { NetworkNode, NodeType, CellColor } from './types';

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_DEPTH = 5;   // rows 0 (HOME) … 4 (terminal)
const COLUMNS   = 3;   // gridX ∈ {0, 1, 2}
const ALL_XS: readonly number[] = [0, 1, 2];

// ─── Crossing predicate ────────────────────────────────────────────────────
// Two edges (p1→c1) and (p2→c2) cross iff parent order and child order
// are strictly reversed.  Shared endpoints never cross.
function edgesCross(p1: number, c1: number, p2: number, c2: number): boolean {
    return (p1 < p2 && c1 > c2) || (p1 > p2 && c1 < c2);
}

// ─── Node factory ───────────────────────────────────────────────────────────
let nodeIdCounter = 0;

function createNode(
    nodes: NetworkNode[],
    type: NodeType,
    gridX: number,
    gridY: number
): NetworkNode {
    let node: NetworkNode;

    if (type === 'HOME') {
        node = {
            id: `node-${nodeIdCounter++}-HOME`,
            type: 'HOME',
            name: 'Home Gateway',
            difficulty: 0,
            layers: {},
            progress: {},
            countermeasures: [],
            status: 'ACTIVE',
            visibility: 'REVEALED',
            children: [],
            gridX,
            gridY
        } as NetworkNode;
    } else {
        const diff = type === 'MAINFRAME'
            ? 5
            : Math.floor((gridY - 1) / 3) + 1;
        node = nodeRegistry.selectNodeByType(type, diff);
        node.id = `node-${nodeIdCounter++}-${node.name.replace(/\s/g, '')}-${Date.now()}`;
        node.type = type;
        node.gridX = gridX;
        node.gridY = gridY;
        node.status = 'ACTIVE';
        node.visibility = 'HIDDEN';
        node.children = [];
    }

    // Ensure progress arrays are initialized for every layer color.
    if (!node.progress) node.progress = {};
    for (const color of Object.keys(node.layers || {})) {
        const c = color as CellColor;
        if (!node.progress[c]) {
            node.progress[c] = Array(node.layers[c]?.length || 0).fill(false);
        }
    }

    nodes.push(node);
    return node;
}

// ─── Wire edges from parents to children ────────────────────────────────────
// Phase 1: Every parent connects straight-up to the same-X child (vertical).
// Phase 2: If a parent has hasHorizontalConnection, also connect to X±1
//          children, provided the diagonal edge does not cross any existing edge.
function wireEdges(parents: NetworkNode[], children: NetworkNode[], allowDiagonals = true): void {
    const childByX = new Map<number, NetworkNode>(children.map(c => [c.gridX, c]));
    const addedEdges: [number, number][] = [];

    // Phase 1 — vertical (always)
    for (const parent of parents) {
        const child = childByX.get(parent.gridX);
        if (child && !parent.children.includes(child.id)) {
            parent.children.push(child.id);
            addedEdges.push([parent.gridX, child.gridX]);
        }
    }

    // Phase 2 — diagonal (only for flagged nodes, only if non-crossing, only if allowed)
    if (!allowDiagonals) return;
    for (const parent of parents) {
        if (!parent.hasHorizontalConnection) continue;
        for (const dx of [-1, 1]) {
            const targetX = parent.gridX + dx;
            if (targetX < 0 || targetX >= COLUMNS) continue;
            const child = childByX.get(targetX);
            if (!child) continue;
            if (parent.children.includes(child.id)) continue;
            const wouldCross = addedEdges.some(([ep, ec]) => edgesCross(parent.gridX, targetX, ep, ec));
            if (!wouldCross) {
                parent.children.push(child.id);
                addedEdges.push([parent.gridX, targetX]);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  generateGraph — deterministic DAG with optional horizontal branches.
//
//  Layout (5 rows, 3 columns — all rows fully populated):
//    Row 0  HOME   (1 node at x=1)
//    Row 1  ICE    (3 nodes at x=0,1,2 — fan-out from HOME)
//    Row 2  ICE    (3 nodes at x=0,1,2)
//    Row 3  ICE    (3 nodes at x=0,1,2)
//    Row 4  Terminal (1 MAINFRAME + 2 SERVERs at x=0,1,2)
//
//  Edge rules:
//    • Every node always connects vertically to (X, Y+1).
//    • If node.hasHorizontalConnection, may ALSO connect to (X±1, Y+1),
//      provided no existing edge would cross (monotone invariant).
//
//  Guarantees:
//    • Valid DAG — no orphans, no disconnected clusters.
//    • No visually crossing edges.
//    • Bounded O(n) — no while-loops, no randomness in layout.
// ═══════════════════════════════════════════════════════════════════════════
export const generateGraph = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];
    nodeIdCounter = 0;

    // ─── Row 0: HOME ────────────────────────────────────────────────────
    const home = createNode(nodes, 'HOME', 1, 0);

    // ─── Row 1: Full-width ICE fan-out from HOME ─────────────────────────
    const row1: NetworkNode[] = [];
    for (const x of ALL_XS) {
        const child = createNode(nodes, 'ICE', x, 1);
        row1.push(child);
        home.children.push(child.id);
    }

    // ─── Row 2: Full ICE layer ───────────────────────────────────────────
    const row2: NetworkNode[] = [];
    for (const x of ALL_XS) {
        row2.push(createNode(nodes, 'ICE', x, 2));
    }
    wireEdges(row1, row2);

    // ─── Row 3: Full ICE layer ───────────────────────────────────────────
    const row3: NetworkNode[] = [];
    for (const x of ALL_XS) {
        row3.push(createNode(nodes, 'ICE', x, 3));
    }
    wireEdges(row2, row3);

    // ─── Row 4: Terminal — 1 MAINFRAME + 2 SERVERs ──────────────────────
    const mainframeX = Math.floor(Math.random() * COLUMNS);
    const row4: NetworkNode[] = [];
    for (const x of ALL_XS) {
        const terminalType: NodeType = x === mainframeX ? 'MAINFRAME' : 'SERVER';
        row4.push(createNode(nodes, terminalType, x, MAX_DEPTH - 1));
    }
    wireEdges(row3, row4, false);

    // ─── Reveal HOME's direct children ──────────────────────────────────
    for (const childId of home.children) {
        const child = nodes.find(n => n.id === childId);
        if (child) child.visibility = 'REVEALED';
    }

    return nodes;
};
