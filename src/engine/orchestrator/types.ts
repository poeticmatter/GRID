import type { Grid, Card, ServerNode, PlayerStats, Effect, Coordinate, ActiveEffect } from '../types';

export type GamePhase = 'MENU' | 'PLAYING' | 'EFFECT_ORDERING' | 'EFFECT_RESOLUTION' | 'GAME_OVER' | 'VICTORY';

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
    pendingEffects: Effect[];
    effectQueue: ActiveEffect[];
    activeCardId: string | null;
    reprogramTargetSource: Coordinate | null;
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
    pendingEffects?: Effect[];
    effectQueue?: ActiveEffect[];
    activeCardId?: string | null;
    reprogramTargetSource?: Coordinate | null;
}

export type GameAction =
    | { type: 'INITIALIZE_GAME' }
    | { type: 'SELECT_CARD'; payload: { cardId: string | null } }
    | { type: 'ROTATE_CARD' }
    | { type: 'RESOLVE_CUT'; payload: { x: number; y: number; pattern: any[] } }
    | { type: 'END_TURN' }
    | { type: 'PLAY_CARD'; payload: { cardId: string; effects: Effect[] } }
    | { type: 'QUEUE_EFFECT'; payload: { effect: Effect } }
    | { type: 'CONFIRM_EFFECT_ORDER' }
    | { type: 'SET_REPROGRAM_SOURCE'; payload: { source: Coordinate | null } }
    | { type: 'RESOLVE_SYSTEM_RESET' }
    | { type: 'RESOLVE_REPROGRAM'; payload: { source: Coordinate; dest: Coordinate } }
    | { type: 'FINISH_CARD_RESOLUTION' };
