import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';
import { cardMechanicRegistry } from './mechanicRegistry';

export const handlePlayCard = (snapshot: ReadonlyDeep<GameSnapshot>, cardId: string, x: number, y: number): StateDeltas => {
    const card = snapshot.hand.find(c => c.id === cardId);
    if (!card) return {};

    const actionType = card.action || 'CUT';
    const mechanicFn = cardMechanicRegistry[actionType];

    if (!mechanicFn) {
        console.warn(`[Orchestrator] No mechanic registered for action: ${actionType}`);
        return {};
    }

    return mechanicFn(snapshot, { cardId, x, y });
};

