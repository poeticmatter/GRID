import { createGrid } from '../grid-logic';
import type { Card, NetworkNode } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas } from './types';

export function handleResolveSystemReset(snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas {
    // 1. Move active card and all discard pile cards back to hand
    const activeCardId = snapshot.activeCardId;
    let currentHand = [...snapshot.hand];
    
    // Return discard pile to hand
    snapshot.discardPile.forEach(card => {
        if (!currentHand.find(c => c.id === card.id)) {
            currentHand.push(card);
        }
    });

    // Return active card to hand
    if (activeCardId) {
        const activeCard = [...snapshot.deck, ...snapshot.hand, ...snapshot.discardPile].find(c => c.id === activeCardId);
        if (activeCard && !currentHand.find(c => c.id === activeCard.id)) {
            currentHand.push(activeCard);
        }
    }

    // 2. Empty discard pile and filter deck (prevent duplicate references)
    let currentDiscard: Card[] = [];
    let currentDeck = snapshot.deck.filter(c => c.id !== activeCardId && !currentHand.find(h => h.id === c.id));

    const shuffle = (array: Card[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    while (currentHand.length < snapshot.maxHandSize) {
        if (currentDeck.length === 0) {
            if (currentDiscard.length === 0) break;
            currentDeck = shuffle(currentDiscard);
            currentDiscard = [];
        }
        const card = currentDeck.pop();
        if (card) currentHand.push(card);
        else break;
    }

    // 3. Grid Wipe
    const newGrid = createGrid(snapshot.grid.length, snapshot.grid[0].length);

    // 4. Countermeasures
    let playerStats = { ...snapshot.playerStats };
    let netDamageTally = 0;

    for (const nodeId of snapshot.activeServerIds) {
        const node = snapshot.nodes[nodeId] as NetworkNode;
        if (!node) continue;
        for (const cm of node.countermeasures) {
            if (cm.type === 'TRACE') {
                playerStats.trace = Math.min(playerStats.maxTrace ?? 15, playerStats.trace + cm.value);
            }
            if (cm.type === 'HARDWARE_DAMAGE') {
                playerStats.hardwareHealth = Math.max(0, playerStats.hardwareHealth - cm.value);
            }
            if (cm.type === 'NET_DAMAGE') {
                netDamageTally += cm.value;
            }
        }
    }

    // Cap net damage to prevent soft-locks
    netDamageTally = Math.min(netDamageTally, currentHand.length);
    const isResolvingNetDamage = netDamageTally > 0;

    return {
        grid: newGrid,
        hand: currentHand,
        deck: currentDeck,
        discardPile: currentDiscard,
        playerStats,
        turn: snapshot.turn + 1,
        pendingNetDamage: netDamageTally,
        gameState: isResolvingNetDamage ? 'RESOLVING_NET_DAMAGE' : 'PLAYING',
        effectQueue: [],
        activeCardId: null,
        selectedCardId: null,
        events: [{ type: 'AUDIO_PLAY_SFX', payload: isResolvingNetDamage ? 'error' : 'hack' }],
        durationMs: 800
    };
}
