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

// ─── Non-crossing edge builder ──────────────────────────────────────────────
// Given sorted parent x-positions and sorted child x-positions, returns a
// set of (parentX, childX) pairs such that:
//   1. Every parent has ≥ 1 child          (no dead-end parents)
//   2. Every child  has ≥ 1 parent         (no orphan children)
//   3. No two edges cross                  (monotone mapping)
//   4. Optional extra diagonals add variety (still monotone)
//
// Bounded: O(P × C) with P,C ≤ 3 → at most 9 iterations per phase.
function buildNonCrossingEdges(
    parentXs: number[],
    childXs: number[]
): [parentX: number, childX: number][] {
    const edges: [number, number][] = [];

    const wouldCross = (px: number, cx: number) =>
        edges.some(([ep, ec]) => edgesCross(px, cx, ep, ec));

    // Phase 1 — Primary: every parent gets its nearest safe child.
    for (const px of parentXs) {
        const ranked = [...childXs].sort(
            (a, b) => Math.abs(a - px) - Math.abs(b - px)
        );
        for (const cx of ranked) {
            if (!wouldCross(px, cx)) {
                edges.push([px, cx]);
                break;
            }
        }
    }

    // Phase 2 — Coverage: every child gets a parent if not already connected.
    for (const cx of childXs) {
        if (edges.some(([, ec]) => ec === cx)) continue;
        const ranked = [...parentXs].sort(
            (a, b) => Math.abs(a - cx) - Math.abs(b - cx)
        );
        for (const px of ranked) {
            if (!wouldCross(px, cx)) {
                edges.push([px, cx]);
                break;
            }
        }
    }

    // Phase 3 — Enrichment: randomly add extra diagonal edges for variety.
    for (const px of parentXs) {
        for (const cx of childXs) {
            if (cx === px) continue;                                       // already handled
            if (edges.some(([ep, ec]) => ep === px && ec === cx)) continue; // duplicate
            if (Math.random() > 0.3) continue;                            // ~30% chance
            if (!wouldCross(px, cx)) {
                edges.push([px, cx]);
            }
        }
    }

    return edges;
}

// ─── Pick which x-positions the next row occupies ───────────────────────────
// Returns a sorted subset of {0, 1, 2} with 2–3 elements.
function pickChildXPositions(): number[] {
    const count = Math.random() > 0.4 ? COLUMNS : 2;       // 60% → 3, 40% → 2
    if (count === COLUMNS) return [...ALL_XS];
    // Pick 2 of 3 positions uniformly at random
    const drop = Math.floor(Math.random() * COLUMNS);
    return ALL_XS.filter(x => x !== drop);
}

// ─── Node factory ───────────────────────────────────────────────────────────
// Wraps nodeRegistry calls and bookkeeps the flat `nodes` collector array.
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
            resetTrace: 0,
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

// ─── Build a row of child nodes and wire non-crossing edges from parents ────
function buildRow(
    nodes: NetworkNode[],
    parents: NetworkNode[],
    childXs: number[],
    gridY: number,
    childType: NodeType
): NetworkNode[] {
    // Instantiate child nodes at each x-position.
    const childByX = new Map<number, NetworkNode>();
    for (const x of childXs) {
        childByX.set(x, createNode(nodes, childType, x, gridY));
    }

    // Compute non-crossing parent→child edges.
    const parentXs = parents.map(p => p.gridX);
    const edges = buildNonCrossingEdges(parentXs, childXs);

    // Wire edges into parent.children arrays.
    for (const [px, cx] of edges) {
        const parent = parents.find(p => p.gridX === px)!;
        const child = childByX.get(cx)!;
        if (!parent.children.includes(child.id)) {
            parent.children.push(child.id);
        }
    }

    // Return children sorted by gridX for the next iteration.
    return [...childByX.values()].sort((a, b) => a.gridX - b.gridX);
}

// ═══════════════════════════════════════════════════════════════════════════
//  generateGraph — single-pass, constraint-first DAG construction.
//
//  Layout (5 rows, 3 columns):
//    Row 0  HOME (1 node at x=1)
//    Row 1  ICE  (3 nodes at x=0,1,2 — fan-out from HOME)
//    Row 2  ICE  (2–3 nodes — subset of columns)
//    Row 3  ICE  (3 nodes at x=0,1,2 — penultimate, ensures full terminal coverage)
//    Row 4  Terminal (1 MAINFRAME + 2 SERVERs at x=0,1,2 — vertical from row 3)
//
//  Guarantees:
//    • Valid DAG with no orphans or disconnected clusters.
//    • No visually crossing edges (monotone edge invariant).
//    • Bounded O(n²) with n ≤ 15 total nodes — no while-loops.
// ═══════════════════════════════════════════════════════════════════════════
export const generateGraph = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];
    nodeIdCounter = 0;

    // ─── Row 0: HOME ────────────────────────────────────────────────────
    const home = createNode(nodes, 'HOME', 1, 0);

    // ─── Row 1: Full-width ICE fan-out from HOME ────────────────────────
    const row1: NetworkNode[] = [];
    for (const x of ALL_XS) {
        const child = createNode(nodes, 'ICE', x, 1);
        row1.push(child);
        home.children.push(child.id);
    }

    // ─── Row 2: Variable-width ICE layer ────────────────────────────────
    const row2Xs = pickChildXPositions();
    const row2 = buildRow(nodes, row1, row2Xs, 2, 'ICE');

    // ─── Row 3: Penultimate — must cover all 3 columns ─────────────────
    const row3 = buildRow(nodes, row2, [...ALL_XS], 3, 'ICE');

    // ─── Row 4: Terminal — straight vertical from row 3 ─────────────────
    const mainframeX = Math.floor(Math.random() * COLUMNS);
    for (const parent of row3) {
        const terminalType: NodeType = parent.gridX === mainframeX ? 'MAINFRAME' : 'SERVER';
        const child = createNode(nodes, terminalType, parent.gridX, MAX_DEPTH - 1);
        parent.children.push(child.id);
    }

    // ─── Reveal HOME's direct children ──────────────────────────────────
    for (const childId of home.children) {
        const child = nodes.find(n => n.id === childId);
        if (child) child.visibility = 'REVEALED';
    }

    return nodes;
};
