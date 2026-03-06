import type { NodeDefinition } from '../engine/types';

export const NodePools: Record<string, NodeDefinition[]> = {
    CorporatePool: [
        { type: 'SERVER', name: 'Gateway Proxy', baseDifficulty: 1, weight: 10, requirements: { colors: { BLUE: 2 } }, penaltyType: 'TRACE', penaltyValue: 10 },
        { type: 'SERVER', name: 'Auth Server', baseDifficulty: 1, weight: 10, requirements: { colors: { RED: 2 } }, penaltyType: 'TRACE', penaltyValue: 10 },
        { type: 'ICE', name: 'Basic Firewall', baseDifficulty: 2, weight: 5, requirements: { colors: { PURPLE: 3, BLUE: 2 } }, penaltyType: 'NET_DAMAGE', penaltyValue: 1 },
        { type: 'ICE', name: 'Load Balancer', baseDifficulty: 2, weight: 5, requirements: { colors: { RED: 3, GREEN: 2 } }, penaltyType: 'HARDWARE_DAMAGE', penaltyValue: 1 },
        { type: 'SERVER', name: 'Intrusion Detection', baseDifficulty: 3, weight: 5, requirements: { colors: { PURPLE: 4, BLUE: 3 } }, penaltyType: 'TRACE', penaltyValue: 20 },
        { type: 'ICE', name: 'Encryption Layer', baseDifficulty: 3, weight: 4, requirements: { colors: { RED: 5, PURPLE: 2 } }, penaltyType: 'HARDWARE_DAMAGE', penaltyValue: 1 },
        { type: 'SERVER', name: 'Sysadmin Terminal', baseDifficulty: 4, weight: 3, requirements: { colors: { RED: 6, GREEN: 4 } }, penaltyType: 'TRACE', penaltyValue: 25 },
        { type: 'MAINFRAME', name: 'Core Router', baseDifficulty: 5, weight: 1, requirements: { colors: { PURPLE: 7, BLUE: 5 } }, penaltyType: 'HARDWARE_DAMAGE', penaltyValue: 2 },
    ],
    UndergroundPool: [
        { type: 'SERVER', name: 'Shadow Router', baseDifficulty: 2, weight: 10, requirements: { colors: { GREEN: 4 } }, penaltyType: 'TRACE', penaltyValue: 15 },
        { type: 'ICE', name: 'Black ICE', baseDifficulty: 4, weight: 5, requirements: { colors: { RED: 6, YELLOW: 2 } }, penaltyType: 'HARDWARE_DAMAGE', penaltyValue: 2 },
        { type: 'MAINFRAME', name: 'Data Vault', baseDifficulty: 6, weight: 1, requirements: { colors: { RED: 8, GREEN: 8, BLUE: 8 } }, penaltyType: 'TRACE', penaltyValue: 50 },
    ]
};
