import { produce } from 'immer';
import { refillGrid } from '../../grid-logic';
import { mergeDeltas } from '../deltaHelpers';
import type { IEffectMechanic } from '../mechanicRegistry';
import type { Card, Grid, NetworkNode } from '../../types';

export const resetMechanic: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot, payload: any = {}) => {
        const { cardId } = payload;
        const card = snapshot.hand.find((c: any) => c.id === cardId);
        if (!card) return {};

        const baseEvents = [{ type: 'AUDIO_PLAY_SFX', payload: 'select' }];

        const newHand = [...snapshot.hand.filter((c: any) => c.id !== cardId)] as Card[];
        newHand.push(...snapshot.discardPile as Card[]);

        let currentDiscard = [card as Card];

        // End turn logic
        const newGrid = produce(snapshot.grid as Grid, draft => {
            // refillGrid returns a new grid, so we assign wholesale
            const refilled = refillGrid(snapshot.grid as Grid, snapshot.refillRate);
            draft.splice(0, draft.length, ...refilled);
        });
        let currentDeck = [...snapshot.deck] as Card[];
        let finalHand = newHand;

        while (finalHand.length < snapshot.maxHandSize) {
            if (currentDeck.length === 0) {
                if (currentDiscard.length === 0) break;
                currentDeck = [...currentDiscard];
                for (let j = currentDeck.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [currentDeck[j], currentDeck[k]] = [currentDeck[k], currentDeck[j]];
                }
                currentDiscard = [];
            }
            const c = currentDeck.pop();
            if (c) finalHand.push(c);
        }

        // Derive active servers from the normalized node SSOT
        const activeServerIds = snapshot.activeServerIds as string[];
        const nodes = snapshot.nodes as Record<string, NetworkNode>;
        const REVEALED_SERVERS = activeServerIds
            .map(id => nodes[id])
            .filter((s): s is NetworkNode => !!s && s.visibility === 'REVEALED');
        const traceIncrease = REVEALED_SERVERS.reduce((sum: number, s) => sum + (s.resetTrace || 0), 0);
        const newTrace = snapshot.playerStats.trace + traceIncrease;

        const endTurnDeltas = {
            grid: newGrid,
            hand: finalHand,
            deck: currentDeck,
            discardPile: currentDiscard,
            playerStats: { ...snapshot.playerStats, trace: newTrace },
            turn: snapshot.turn + 1,
            selectedCardId: null,
            rotation: 0,
            durationMs: 600
        };

        return mergeDeltas(endTurnDeltas, { events: baseEvents });
    }
};
