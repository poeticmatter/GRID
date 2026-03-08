import type { CardDefinition } from '../engine/types';

export const CardPool: Record<string, CardDefinition> = {
    'line-h': {
        name: 'Line H',
        visualColor: 'BLUE',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }] },
        ]
    },
    'line-v': {
        name: 'Line V',
        visualColor: 'RED',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }] },
        ]
    },
    'square': {
        name: 'Square',
        visualColor: 'GREEN',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
        ]
    },
    't-shape': {
        name: 'T-Shape',
        visualColor: 'YELLOW',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] },
        ]
    },
    'l-shape': {
        name: 'L-Shape',
        visualColor: 'PURPLE',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }] },
        ]
    },
    'sys-reset': {
        name: 'SYS/RESET',
        visualColor: 'RED',
        memory: 4,
        weight: 5,
        isStartingCard: true,
        effects: [
            { type: 'SYSTEM_RESET' },
        ]
    }
};
