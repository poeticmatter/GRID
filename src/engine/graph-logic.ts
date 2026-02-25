import { ServerNode } from './types';

export interface GraphNode extends ServerNode {
    edges: string[];
    isTarget?: boolean;
}

export const SERVER_GRAPH: Record<string, GraphNode> = {
    'node-1': {
        id: 'node-1',
        name: 'Entry Gateway (Public)',
        difficulty: 1,
        requirements: { colors: { BLUE: 2 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 10,
        status: 'ACTIVE',
        edges: ['node-4', 'node-5']
    },
    'node-2': {
        id: 'node-2',
        name: 'Proxy Server Beta',
        difficulty: 1,
        requirements: { colors: { GREEN: 2 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 10,
        status: 'ACTIVE',
        edges: ['node-5', 'node-6']
    },
    'node-3': {
        id: 'node-3',
        name: 'Auth Node C',
        difficulty: 1,
        requirements: { colors: { RED: 2 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 10,
        status: 'ACTIVE',
        edges: ['node-6', 'node-7']
    },
    'node-4': {
        id: 'node-4',
        name: 'Firewall Alpha',
        difficulty: 2,
        requirements: { colors: { PURPLE: 3, BLUE: 2 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'NET_DAMAGE',
        penaltyValue: 1,
        status: 'ACTIVE',
        edges: ['node-8']
    },
    'node-5': {
        id: 'node-5',
        name: 'Data Relay 1',
        difficulty: 2,
        requirements: { colors: { YELLOW: 4 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 15,
        status: 'ACTIVE',
        edges: ['node-8', 'node-9']
    },
    'node-6': {
        id: 'node-6',
        name: 'Load Balancer',
        difficulty: 2,
        requirements: { colors: { RED: 3, GREEN: 2 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'HARDWARE_DAMAGE',
        penaltyValue: 1,
        status: 'ACTIVE',
        edges: ['node-9', 'node-10']
    },
    'node-7': {
        id: 'node-7',
        name: 'Auth Node D',
        difficulty: 2,
        requirements: { colors: { RED: 4 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 15,
        status: 'ACTIVE',
        edges: ['node-10']
    },
    'node-8': {
        id: 'node-8',
        name: 'Intrusion Detection',
        difficulty: 3,
        requirements: { colors: { PURPLE: 4, BLUE: 3 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 20,
        status: 'ACTIVE',
        edges: ['node-11']
    },
    'node-9': {
        id: 'node-9',
        name: 'Internal Relay',
        difficulty: 3,
        requirements: { colors: { YELLOW: 5, GREEN: 3 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'NET_DAMAGE',
        penaltyValue: 1,
        status: 'ACTIVE',
        edges: ['node-11', 'node-12']
    },
    'node-10': {
        id: 'node-10',
        name: 'Encryption Layer',
        difficulty: 3,
        requirements: { colors: { RED: 5, PURPLE: 2 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'HARDWARE_DAMAGE',
        penaltyValue: 1,
        status: 'ACTIVE',
        edges: ['node-12']
    },
    'node-11': {
        id: 'node-11',
        name: 'Secure Database',
        difficulty: 4,
        requirements: { colors: { BLUE: 6, YELLOW: 3 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'NET_DAMAGE',
        penaltyValue: 2,
        status: 'ACTIVE',
        edges: ['node-13']
    },
    'node-12': {
        id: 'node-12',
        name: 'Sysadmin Terminal',
        difficulty: 4,
        requirements: { colors: { RED: 6, GREEN: 4 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 25,
        status: 'ACTIVE',
        edges: ['node-13', 'node-14']
    },
    'node-13': {
        id: 'node-13',
        name: 'Core Router',
        difficulty: 5,
        requirements: { colors: { PURPLE: 7, BLUE: 5 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'HARDWARE_DAMAGE',
        penaltyValue: 2,
        status: 'ACTIVE',
        edges: ['node-15']
    },
    'node-14': {
        id: 'node-14',
        name: 'Backup Archive',
        difficulty: 4,
        requirements: { colors: { YELLOW: 6, RED: 3 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'NET_DAMAGE',
        penaltyValue: 1,
        status: 'ACTIVE',
        edges: ['node-15']
    },
    'node-15': {
        id: 'node-15',
        name: 'Mainframe Access Point',
        difficulty: 6,
        requirements: { colors: { RED: 8, GREEN: 8, BLUE: 8 } },
        progress: { colors: {}, symbols: {} },
        penaltyType: 'TRACE',
        penaltyValue: 50,
        status: 'ACTIVE',
        edges: [],
        isTarget: true
    }
};

export const STARTING_NODES = ['node-1', 'node-2', 'node-3'];
