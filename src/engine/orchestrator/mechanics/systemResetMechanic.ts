import { produce } from 'immer';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from '../types';
import { createGrid } from '../../grid-logic';
import type { Card, NetworkNode } from '../../types';
import type { IEffectMechanic } from '../mechanicRegistry';

export const systemResetMechanic: IEffectMechanic = {
    type: 'IMMEDIATE',
    execute: (snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas => {
        // 1. Grid Wipe: generate a completely fresh grid
        const newGrid = createGrid(snapshot.grid.length, snapshot.grid[0].length);

        // 2. Hand/Deck Logic: discard hand, shuffle discard into deck, draw up to maxHandSize
        const allToDiscard = [...snapshot.discardPile, ...snapshot.hand] as Card[];
        
        let currentDeck = [...snapshot.deck] as Card[];
        let currentDiscard = allToDiscard;
        let finalHand: Card[] = [];

        // Fisher-Yates shuffle
        const shuffle = (array: Card[]) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };

        // Draw up to maxHandSize
        const drawUpToMax = () => {
            while (finalHand.length < snapshot.maxHandSize) {
                if (currentDeck.length === 0) {
                    if (currentDiscard.length === 0) break;
                    currentDeck = shuffle(currentDiscard);
                    currentDiscard = [];
                }
                const card = currentDeck.pop();
                if (card) finalHand.push(card);
                else break;
            }
        };

        drawUpToMax();

        // 3. Threat Penalty: Trigger countermeasures of all active nodes
        let playerStats = { ...snapshot.playerStats };
        let currentHand = [...finalHand];
        let currentTrash = [...snapshot.trashPile] as Card[];

        for (const nodeId of snapshot.activeServerIds) {
            const node = snapshot.nodes[nodeId] as NetworkNode;
            if (!node) continue;

            // Trigger ALL countermeasures unconditionally
            for (const cm of node.countermeasures) {
                switch (cm.type) {
                    case 'TRACE':
                        playerStats.trace += cm.value;
                        break;
                    case 'HARDWARE_DAMAGE':
                        playerStats.hardwareHealth = Math.max(0, playerStats.hardwareHealth - cm.value);
                        break;
                    case 'NET_DAMAGE':
                        // Trash random cards from hand/deck
                        for (let i = 0; i < cm.value; i++) {
                            const totalAvailable = currentHand.length + currentDeck.length;
                            if (totalAvailable === 0) break;

                            const targetIndex = Math.floor(Math.random() * totalAvailable);
                            if (targetIndex < currentHand.length) {
                                // Trash from hand
                                const trashed = currentHand.splice(targetIndex, 1)[0];
                                if (trashed) currentTrash.push(trashed);
                            } else {
                                // Trash from deck
                                const deckIndex = targetIndex - currentHand.length;
                                const trashed = currentDeck.splice(deckIndex, 1)[0];
                                if (trashed) currentTrash.push(trashed);
                            }
                        }
                        break;
                }
            }
        }

        const triggeredPenalty = snapshot.activeServerIds.length > 0;

        return {
            grid: newGrid,
            hand: currentHand,
            deck: currentDeck,
            discardPile: currentDiscard,
            trashPile: currentTrash,
            playerStats,
            turn: snapshot.turn + 1,
            selectedCardId: null,
            activeCardId: null,
            rotation: 0,
            events: [{ 
                type: 'AUDIO_PLAY_SFX', 
                payload: triggeredPenalty ? 'error' : 'hack' 
            }],
            durationMs: 800
        };
    }
};
