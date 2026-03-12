import type { CardDefinition } from '../engine/types';

export const CardPool: Record<string, CardDefinition> = {
    'line-shell': {
        name: 'Line Shell',
        visualColor: 'BLUE',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }] },
        ]
    },
    'square-shell': {
        name: 'Square Shell',
        visualColor: 'GREEN',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
        ]
    },
    't-shell': {
        name: 'T-Shell',
        visualColor: 'YELLOW',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] },
        ]
    },
    'l-shell': {
        name: 'L-Shell',
        visualColor: 'PURPLE',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'CUT', pattern: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }] },
        ]
    },
    'reprogram-2': {
        name: 'Reprogram 2',
        visualColor: 'PURPLE',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'REPROGRAM', amount: 2 },
        ]
    },
    'reprogram-4': {
        name: 'Reprogram 4',
        visualColor: 'PURPLE',
        memory: 2,
        weight: 10,
        isStartingCard: true,
        effects: [
            { type: 'REPROGRAM', amount: 4 },
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
