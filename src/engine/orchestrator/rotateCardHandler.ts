import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';

export const handleRotateCard = (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
    return {
        rotation: (snapshot.rotation + 90) % 360
    };
};
