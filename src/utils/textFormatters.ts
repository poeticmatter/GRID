import type { Countermeasure } from '../engine/types';

export function describeCountermeasure(cm: Countermeasure): string {
    switch (cm.type) {
        case 'TRACE':           return `+${cm.value} TRACE`;
        case 'HARDWARE_DAMAGE': return `-${cm.value} HARDWARE`;
        case 'NET_DAMAGE':      return `+${cm.value} NET DAMAGE`;
        case 'VIRUS':           return `INJECT ×${cm.value} VIRUS`;
        case 'CORRUPT':         return `CORRUPT ×${cm.value} CELLS`;
        case 'NOISE':           return `+${cm.value} NOISE`;
        default:                return (cm as Countermeasure).type;
    }
}
