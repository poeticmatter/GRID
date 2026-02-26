import { checkPatternFit, getAffectedCells, rotatePattern } from '../../grid-logic';
import { calculateServerProgress } from '../../game-logic';
import { SERVER_GRAPH } from '../../graph-logic';
import type { ServerNode, Card, Grid } from '../../types';
import type { CardMechanicFn } from '../mechanicRegistry';

export const cutMechanic: CardMechanicFn = (snapshot, payload) => {
    const { cardId, x, y } = payload;
    const card = snapshot.hand.find((c: any) => c.id === cardId);
    if (!card) return {};

    const events: Array<{ type: string; payload?: any }> = [];

    // Clone the readonly array from deeply frozen state for rotatePattern
    const pattern = [...card.pattern].map(p => ({ ...p }));
    const rotatedPattern = rotatePattern(pattern, snapshot.rotation);

    // checkPatternFit expects Grid, but snapshot.grid is ReadonlyDeep<Grid>.
    // Casting is required when dropping deep immutability at boundaries.
    const activeGrid = snapshot.grid as unknown as Grid;

    if (!checkPatternFit(activeGrid, rotatedPattern, x, y)) {
        return { events: [{ type: 'AUDIO_PLAY_SFX', payload: 'error' }] };
    }

    events.push({ type: 'AUDIO_PLAY_SFX', payload: 'cut' });

    // 1. Harvest Cells & Update Grid
    const affected = getAffectedCells(activeGrid, rotatedPattern, x, y);
    const newGrid = activeGrid.map(row => row.map(cell => ({ ...cell })));
    affected.forEach(cell => {
        if (cell.y < newGrid.length && cell.x < newGrid[0].length) {
            newGrid[cell.y][cell.x].state = 'BROKEN';
        }
    });

    // 2. Broadcast to Servers & Update Stats
    const newPlayerStats = { ...snapshot.playerStats };
    const newActiveServers: ServerNode[] = [];

    let newHand = snapshot.hand.filter((c: any) => c.id !== cardId) as Card[];
    let newDeck = [...snapshot.deck] as Card[];
    let newTrashPile = [...snapshot.trashPile] as Card[];
    let newDiscard = [...snapshot.discardPile, card as Card] as Card[];

    snapshot.activeServers.forEach((readonlyServer: any) => {
        const server = readonlyServer as unknown as ServerNode;
        const result = calculateServerProgress(server, affected);

        if (result.penaltyTriggered) {
            events.push({ type: 'AUDIO_PLAY_SFX', payload: 'error' });
            if (server.penaltyType === 'TRACE') {
                newPlayerStats.trace = Math.min(100, newPlayerStats.trace + server.penaltyValue);
            } else if (server.penaltyType === 'HARDWARE_DAMAGE') {
                newPlayerStats.hardwareHealth = Math.max(0, newPlayerStats.hardwareHealth - server.penaltyValue);
            } else if (server.penaltyType === 'NET_DAMAGE') {
                for (let p = 0; p < server.penaltyValue; p++) {
                    if (newHand.length > 0) {
                        const idx = Math.floor(Math.random() * newHand.length);
                        const trashed = newHand.splice(idx, 1)[0];
                        newTrashPile.push(trashed);
                    } else if (newDeck.length > 0) {
                        const trashed = newDeck.pop();
                        if (trashed) newTrashPile.push(trashed);
                    }
                }
            }
        }

        newActiveServers.push(result.updatedServer);
    });

    // 3. Handle Hacked Servers (Progression)
    const remainingServers: ServerNode[] = [];
    const newDeepMap = [...snapshot.deepMap] as ServerNode[];
    let hasTargetHacked = false;

    newActiveServers.forEach(s => {
        if (s.status !== 'HACKED') {
            remainingServers.push(s);
        } else {
            newPlayerStats.credits += s.difficulty * 10;
            events.push({ type: 'AUDIO_PLAY_SFX', payload: 'hack' });

            const graphNode = SERVER_GRAPH[s.id];
            if (graphNode) {
                if (graphNode.isTarget) {
                    hasTargetHacked = true;
                }

                graphNode.edges.forEach((childId: string) => {
                    const existsActive = snapshot.activeServers.some((activeS: any) => activeS.id === childId);
                    const existsDeep = newDeepMap.some((deepS: any) => deepS.id === childId);

                    if (!existsActive && !existsDeep) {
                        const childNodeTemplate = SERVER_GRAPH[childId];
                        if (childNodeTemplate) {
                            const newChild: ServerNode = {
                                ...childNodeTemplate,
                                requirements: {
                                    colors: { ...childNodeTemplate.requirements.colors },
                                    symbols: { ...(childNodeTemplate.requirements.symbols || {}) }
                                },
                                progress: {
                                    colors: { ...childNodeTemplate.progress.colors },
                                    symbols: { ...(childNodeTemplate.progress.symbols || {}) }
                                }
                            };
                            newDeepMap.push(newChild);
                        }
                    }
                });
            }
        }
    });

    // Refill active row
    while (remainingServers.length < 3 && newDeepMap.length > 0) {
        remainingServers.push(newDeepMap.shift()!);
    }

    // Check Win/Loss
    let newGameState = snapshot.gameState;
    if (newPlayerStats.hardwareHealth <= 0 || newPlayerStats.trace >= 100 || (newHand.length === 0 && newDeck.length === 0)) {
        newGameState = 'GAME_OVER';
    } else if (hasTargetHacked) {
        newGameState = 'VICTORY';
    }

    if (newGameState === 'GAME_OVER' && snapshot.gameState !== 'GAME_OVER') {
        events.push({ type: 'AUDIO_PLAY_SFX', payload: 'game_over' });
    } else if (newGameState === 'VICTORY' && snapshot.gameState !== 'VICTORY') {
        events.push({ type: 'AUDIO_PLAY_SFX', payload: 'victory' });
    }

    return {
        grid: newGrid,
        activeServers: remainingServers,
        deepMap: newDeepMap,
        hand: newHand,
        deck: newDeck,
        discardPile: newDiscard,
        trashPile: newTrashPile,
        playerStats: newPlayerStats,
        gameState: newGameState,
        selectedCardId: null,
        rotation: 0,
        events: events.length > 0 ? events : undefined
    };
};
