import type { Grid, Card, ServerNode, PlayerStats } from '../types';

export type GamePhase = 'MENU' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

type Builtin = Function | Date | Error | RegExp | string | number | boolean | null | undefined;

export type ReadonlyDeep<T> = T extends Builtin
    ? T
    : T extends Array<infer U>
    ? ReadonlyArray<ReadonlyDeep<U>>
    : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<ReadonlyDeep<U>>
    : T extends object
    ? { readonly [K in keyof T]: ReadonlyDeep<T[K]> }
    : T;

export interface GameSnapshot {
    grid: Grid;
    refillRate: number;
    activeServers: ServerNode[];
    deepMap: ServerNode[];
    hand: Card[];
    deck: Card[];
    discardPile: Card[];
    trashPile: Card[];
    maxHandSize: number;
    playerStats: PlayerStats;
    selectedCardId: string | null;
    rotation: number;
    gameState: GamePhase;
    turn: number;
}

export interface StateDeltas {
    grid?: Grid;
    refillRate?: number;
    activeServers?: ServerNode[];
    deepMap?: ServerNode[];
    hand?: Card[];
    deck?: Card[];
    discardPile?: Card[];
    trashPile?: Card[];
    maxHandSize?: number;
    playerStats?: PlayerStats;
    selectedCardId?: string | null;
    rotation?: number;
    gameState?: GamePhase;
    turn?: number;
    events?: Array<{ type: string; payload?: any }>;
}

export type GameAction =
    | { type: 'INITIALIZE_GAME' }
    | { type: 'SELECT_CARD'; payload: { cardId: string | null } }
    | { type: 'ROTATE_CARD' }
    | { type: 'PLAY_CARD'; payload: { cardId: string; x: number; y: number } }
    | { type: 'END_TURN' };
