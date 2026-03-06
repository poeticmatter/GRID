import { nodeRegistry } from './registry/NodeRegistry';
import type { NetworkNode } from './types';

export const generateGraph = (): NetworkNode[] => {
    const nodes: NetworkNode[] = [];

    // Node 0: Root (Home)
    const homeNode: NetworkNode = {
        id: `node-0-HOME`,
        type: 'HOME',
        name: 'Home Gateway',
        difficulty: 0,
        layers: {},
        progress: {},
        countermeasures: {},
        resetTrace: 0,
        status: 'ACTIVE',
        visibility: 'REVEALED',
        children: []
    };
    nodes.push(homeNode);

    // Nodes 1-8: Servers/ICE
    for (let i = 1; i <= 8; i++) {
        const poolId = nodeRegistry.getRandomPoolId();
        // Increasing difficulty slightly as depth increases
        const diff = Math.floor((i - 1) / 3) + 1; // 1, 1, 1, 2, 2, 2, 3, 3
        const node = nodeRegistry.selectNode(poolId, diff);
        node.id = `node-${i}-${node.name.replace(/\s/g, '')}-${Date.now()}`;
        // Ensure no MAINFRAMES generated here by pure chance if possible, but NodeRegistry fallback will handle it.
        // If it selected a MAINFRAME, that's fine, but let's assume it's okay.
        nodes.push(node);
    }

    // Node 9: Mainframe
    const mfPool = nodeRegistry.getRandomPoolId();
    // MAINFRAME Usually has difficulty 5-6
    const mainframe = nodeRegistry.selectNode(mfPool, 5);
    mainframe.id = `node-9-MAINFRAME-${Date.now()}`;
    nodes.push(mainframe);

    // Build the DAG edges
    // Depth 0: [0]
    // Depth 1: [1, 2, 3]
    // Depth 2: [4, 5, 6]
    // Depth 3: [7, 8]
    // Depth 4: [9]

    // Connect Depth 0 -> Depth 1
    nodes[0].children = [nodes[1].id, nodes[2].id, nodes[3].id];

    // For depth 1 -> 2, ensure each node in depth 2 has at least one parent in depth 1
    const depth1Ids = [nodes[1].id, nodes[2].id, nodes[3].id];
    const depth2Idx = [4, 5, 6];
    depth2Idx.forEach((childIdx, i) => {
        // Simple mapping: 1->4, 2->5, 3->6
        const parentId = depth1Ids[i % depth1Ids.length];
        const parentNode = nodes.find(n => n.id === parentId);
        if (parentNode) {
            parentNode.children.push(nodes[childIdx].id);
        }
    });
    // Add some random cross links?
    nodes[2].children.push(nodes[4].id);
    nodes[1].children.push(nodes[5].id);

    // Connect Depth 2 -> Depth 3
    const depth2Ids = [nodes[4].id, nodes[5].id, nodes[6].id];
    const depth3Idx = [7, 8];
    depth3Idx.forEach((childIdx, i) => {
        const parentId = depth2Ids[i % depth2Ids.length];
        const parentNode = nodes.find(n => n.id === parentId);
        if (parentNode) {
            parentNode.children.push(nodes[childIdx].id);
        }
    });
    nodes[6].children.push(nodes[7].id); // crosslink

    // Connect Depth 3 -> Depth 4 (Mainframe)
    nodes[7].children.push(nodes[9].id);
    nodes[8].children.push(nodes[9].id);

    // Initial revealed nodes are children of Home. They are hidden by default from registry, so we reveal them.
    nodes[1].visibility = 'REVEALED';
    nodes[2].visibility = 'REVEALED';
    nodes[3].visibility = 'REVEALED';

    return nodes;
};
