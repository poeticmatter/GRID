import type { NodeDefinition } from '../engine/types';

export const NodePools: Record<string, NodeDefinition[]> = {
    CorporatePool: [
        { type: 'SERVER', name: 'Gateway Proxy', baseDifficulty: 1, weight: 10, layers: { BLUE: [2, 1, 3], RED: [2] }, countermeasures: { BLUE: { type: 'TRACE', value: 10 } }, resetTrace: 1 },
        { type: 'SERVER', name: 'Auth Server', baseDifficulty: 1, weight: 10, layers: { RED: [2, 4] }, countermeasures: { RED: { type: 'TRACE', value: 10 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Basic Firewall', baseDifficulty: 2, weight: 5, layers: { PURPLE: [3], BLUE: [2] }, countermeasures: { BLUE: { type: 'NET_DAMAGE', value: 1 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Load Balancer', baseDifficulty: 2, weight: 5, layers: { RED: [3], GREEN: [2] }, countermeasures: { GREEN: { type: 'HARDWARE_DAMAGE', value: 1 } }, resetTrace: 1 },
        { type: 'SERVER', name: 'Intrusion Detection', baseDifficulty: 3, weight: 5, layers: { PURPLE: [4], BLUE: [3] }, countermeasures: { BLUE: { type: 'TRACE', value: 20 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Encryption Layer', baseDifficulty: 3, weight: 4, layers: { RED: [5], PURPLE: [2] }, countermeasures: { PURPLE: { type: 'HARDWARE_DAMAGE', value: 1 } }, resetTrace: 1 },
        { type: 'SERVER', name: 'Sysadmin Terminal', baseDifficulty: 4, weight: 3, layers: { RED: [6], GREEN: [4] }, countermeasures: { GREEN: { type: 'TRACE', value: 25 } }, resetTrace: 1 },
        { type: 'MAINFRAME', name: 'Core Router', baseDifficulty: 5, weight: 1, layers: { PURPLE: [7], BLUE: [5] }, countermeasures: { BLUE: { type: 'HARDWARE_DAMAGE', value: 2 } }, resetTrace: 1 },
    ],
    UndergroundPool: [
        { type: 'SERVER', name: 'Shadow Router', baseDifficulty: 2, weight: 10, layers: { GREEN: [4] }, countermeasures: { GREEN: { type: 'TRACE', value: 15 } }, resetTrace: 1 },
        { type: 'ICE', name: 'Black ICE', baseDifficulty: 4, weight: 5, layers: { RED: [6], YELLOW: [2] }, countermeasures: { YELLOW: { type: 'HARDWARE_DAMAGE', value: 2 } }, resetTrace: 1 },
        { type: 'MAINFRAME', name: 'Data Vault', baseDifficulty: 6, weight: 1, layers: { RED: [8], GREEN: [8], BLUE: [8] }, countermeasures: { BLUE: { type: 'TRACE', value: 50 } }, resetTrace: 1 },
    ]
};
