import { refillGrid } from '../grid-logic';
import type { GameSnapshot, StateDeltas, ReadonlyDeep } from './types';
import type { Card, Grid } from '../types';

export const handleEndTurn = (snapshot: ReadonlyDeep<GameSnapshot>, tracePenalty: number, handOverride?: Card[], discardOverride?: Card[]): StateDeltas => {
    const newGrid = refillGrid(snapshot.grid as unknown as Grid, snapshot.refillRate);
    let currentDeck = [...snapshot.deck] as Card[];
    let currentDiscard = discardOverride ? [...discardOverride] : [...snapshot.discardPile] as Card[];
    let finalHand = handOverride ? [...handOverride] : [...snapshot.hand] as Card[];

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
        const card = currentDeck.pop();
        if (card) finalHand.push(card);
    }

    const newTrace = Math.min(100, snapshot.playerStats.trace + tracePenalty);

    let newGameState = snapshot.gameState;
    if (newTrace >= 100 || (finalHand.length === 0 && currentDeck.length === 0)) {
        newGameState = 'GAME_OVER';
    }

    const events: Array<{ type: string; payload?: any; durationMs?: number }> = [];
    if (newGameState === 'GAME_OVER' && snapshot.gameState !== 'GAME_OVER') {
        events.push({ type: 'AUDIO_PLAY_SFX', payload: 'game_over', durationMs: 1500 });
    }

    return {
        grid: newGrid,
        hand: finalHand,
        deck: currentDeck,
        discardPile: currentDiscard,
        playerStats: { ...snapshot.playerStats, trace: newTrace },
        gameState: newGameState,
        turn: snapshot.turn + 1,
        selectedCardId: null,
        rotation: 0,
        events: events.length > 0 ? events : undefined,
        durationMs: 600
    };
};
