import { createGrid } from '../grid-logic';
import type { Card, NetworkNode, NodeRecord } from '../types';
import type { ReadonlyDeep, GameSnapshot, StateDeltas, GamePhase } from './types';
import { applyCountermeasure } from './countermeasureExecutor';
import type { CountermeasureContext } from './countermeasureExecutor';

export function handleResolveSystemReset(snapshot: ReadonlyDeep<GameSnapshot>): StateDeltas {
    // Phase 1: Grid & State Wipe
    // Generate the newGrid via createGrid(). This clears grid from all code, viruses, and corruption first.
    // Note: If node-specific virus-clearing logic is required in the future, it occurs here.
    const rows = snapshot.grid.length;
    const cols = snapshot.grid[0]?.length ?? 0;
    const newGrid = createGrid(rows, cols);

    // Phase 2: Card Management
    // Move active card and discard pile back to hand, and draw from deck up to maxHandSize.
    const activeCardId = snapshot.activeCardId;
    let currentHand = [...snapshot.hand];
    
    // Return discard pile to hand
    snapshot.discardPile.forEach(card => {
        if (!currentHand.find(c => c.id === card.id)) {
            currentHand.push(card as Card);
        }
    });

    // Return active card to hand
    if (activeCardId) {
        const activeCard = [...snapshot.deck, ...snapshot.hand, ...snapshot.discardPile].find(c => c.id === activeCardId);
        if (activeCard && !currentHand.find(c => c.id === activeCard.id)) {
            currentHand.push(activeCard as Card);
        }
    }

    let currentDiscard: Card[] = [];
    let currentDeck = snapshot.deck.filter(c => c.id !== activeCardId && !currentHand.find(h => h.id === c.id)) as Card[];

    const shuffle = (array: Card[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Draw up to maxHandSize
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

    // Phase 3: Countermeasure Activation
    // Iterate through the active servers and apply their countermeasures via the centralized executor.
    let playerStats = { ...snapshot.playerStats };
    let newNodes = { ...snapshot.nodes } as NodeRecord;
    let netDamageTally = 0;
    const countermeasureEvents: Array<{ type: string; payload?: any; durationMs?: number }> = [];

    // 2a. Local Loop: ICE countermeasures for frontline nodes
    for (const nodeId of snapshot.activeServerIds) {
        const node = snapshot.nodes[nodeId] as NetworkNode;
        if (!node) continue;

        for (const cm of node.countermeasures) {
            const context: CountermeasureContext = {
                grid: newGrid,
                playerStats,
                nodes: newNodes,
                activeServerIds: [...snapshot.activeServerIds],
                pendingNetDamage: netDamageTally
            };

            applyCountermeasure(cm, context, nodeId);

            // Emit visual event so the playback pipeline can animate this penalty
            countermeasureEvents.push({
                type: 'COUNTERMEASURE_FIRED',
                payload: { nodeId, type: cm.type, value: cm.value }
            });

            // Sync mutable values back
            netDamageTally = context.pendingNetDamage;
        }
    }

    // 2b. Global Loop: Server/Mainframe global countermeasures across entire dictionary
    for (const rawNode of Object.values(snapshot.nodes)) {
        if (!rawNode || (rawNode.type !== 'SERVER' && rawNode.type !== 'MAINFRAME') || !rawNode.globalCountermeasures?.length) {
            continue;
        }

        const node = rawNode as NetworkNode;
        const nodeId = node.id;
        for (const cm of node.globalCountermeasures ?? []) {
            const context: CountermeasureContext = {
                grid: newGrid,
                playerStats,
                nodes: newNodes,
                activeServerIds: [...snapshot.activeServerIds],
                pendingNetDamage: netDamageTally
            };

            applyCountermeasure(cm, context, nodeId);

            countermeasureEvents.push({
                type: 'COUNTERMEASURE_FIRED',
                payload: { nodeId, type: cm.type, value: cm.value, isGlobal: true }
            });

            netDamageTally = context.pendingNetDamage;
        }
    }

    // Determine final game state in priority order
    const isGameOver = playerStats.hardwareHealth <= 0 || playerStats.trace >= (playerStats.maxTrace ?? 15);
    const isResolvingNetDamage = !isGameOver && netDamageTally > 0;
    // Cap net damage to prevent soft-locks (only relevant when entering that state)
    if (isResolvingNetDamage) {
        netDamageTally = Math.min(netDamageTally, currentHand.length);
    }

    let gameState: GamePhase = 'PLAYING';
    if (isGameOver) gameState = 'GAME_OVER';
    else if (isResolvingNetDamage) gameState = 'RESOLVING_NET_DAMAGE';

    const sfx = isGameOver ? 'game_over' : isResolvingNetDamage ? 'error' : 'hack';

    return {
        grid: newGrid,
        nodes: newNodes,
        hand: currentHand as Card[],
        deck: currentDeck as Card[],
        discardPile: currentDiscard as Card[],
        playerStats,
        turn: snapshot.turn + 1,
        pendingNetDamage: netDamageTally,
        gameState,
        effectQueue: [],
        activeCardId: null,
        selectedCardId: null,
        events: [{ type: 'AUDIO_PLAY_SFX', payload: sfx }, ...countermeasureEvents],
        durationMs: 800
    };
}

