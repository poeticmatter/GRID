import type { NodeDefinition, CellColor, CellSymbol, NodeLayers } from '../engine/types';

const seq = (...parts: Array<{ color: CellColor, count: number, trap?: CellSymbol }>): NodeLayers => {
    const result: NodeLayers = {};
    for (const p of parts) {
        if (!result[p.color]) {
            result[p.color] = [];
        }
        for (let i = 0; i < p.count; i++) {
            result[p.color]!.push({
                symbol: (i === p.count - 1 && p.trap) ? p.trap : 'NONE'
            });
        }
    }
    return result;
};

export const NodePools: Record<string, NodeDefinition[]> = {
    CorporatePool: [
        { type: 'SERVER', name: 'Gateway Proxy', baseDifficulty: 1, weight: 10, layers: seq({ color: 'BLUE', count: 2, trap: 'EYE' }), countermeasures: { EYE: { type: 'TRACE', value: 10 } }, resetTrace: 1 },
        { type: 'SERVER', name: 'Auth Server', baseDifficulty: 1, weight: 10, layers: seq({ color: 'RED', count: 2, trap: 'EYE' }), countermeasures: { EYE: { type: 'TRACE', value: 10 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Basic Firewall', baseDifficulty: 2, weight: 5, layers: seq({ color: 'PURPLE', count: 3 }, { color: 'BLUE', count: 2, trap: 'SKULL' }), countermeasures: { SKULL: { type: 'NET_DAMAGE', value: 1 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Load Balancer', baseDifficulty: 2, weight: 5, layers: seq({ color: 'RED', count: 3 }, { color: 'GREEN', count: 2, trap: 'SKULL' }), countermeasures: { SKULL: { type: 'HARDWARE_DAMAGE', value: 1 } }, resetTrace: 1 },
        { type: 'SERVER', name: 'Intrusion Detection', baseDifficulty: 3, weight: 5, layers: seq({ color: 'PURPLE', count: 4 }, { color: 'BLUE', count: 3, trap: 'EYE' }), countermeasures: { EYE: { type: 'TRACE', value: 20 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Encryption Layer', baseDifficulty: 3, weight: 4, layers: seq({ color: 'RED', count: 5 }, { color: 'PURPLE', count: 2, trap: 'SKULL' }), countermeasures: { SKULL: { type: 'HARDWARE_DAMAGE', value: 1 } }, resetTrace: 1 },
        { type: 'SERVER', name: 'Sysadmin Terminal', baseDifficulty: 4, weight: 3, layers: seq({ color: 'RED', count: 6 }, { color: 'GREEN', count: 4, trap: 'EYE' }), countermeasures: { EYE: { type: 'TRACE', value: 25 } }, resetTrace: 1 },
        { type: 'MAINFRAME', name: 'Core Router', baseDifficulty: 5, weight: 1, layers: seq({ color: 'PURPLE', count: 7 }, { color: 'BLUE', count: 5, trap: 'SKULL' }), countermeasures: { SKULL: { type: 'HARDWARE_DAMAGE', value: 2 } }, resetTrace: 1 },
    ],
    UndergroundPool: [
        { type: 'SERVER', name: 'Shadow Router', baseDifficulty: 2, weight: 10, layers: seq({ color: 'GREEN', count: 4, trap: 'EYE' }), countermeasures: { EYE: { type: 'TRACE', value: 15 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Black ICE', baseDifficulty: 4, weight: 5, layers: seq({ color: 'RED', count: 6 }, { color: 'YELLOW', count: 2, trap: 'SKULL' }), countermeasures: { SKULL: { type: 'HARDWARE_DAMAGE', value: 2 } }, resetTrace: 1 },
        { type: 'MAINFRAME', name: 'Data Vault', baseDifficulty: 6, weight: 1, layers: seq({ color: 'RED', count: 8 }, { color: 'GREEN', count: 8 }, { color: 'BLUE', count: 8, trap: 'EYE' }), countermeasures: { EYE: { type: 'TRACE', value: 50 } }, resetTrace: 1 },
    ]
};
