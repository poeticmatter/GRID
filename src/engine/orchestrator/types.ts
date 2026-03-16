import type { Grid, Card, NetworkNode, NodeRecord, PlayerStats, Effect, Coordinate, ActiveEffect, Cell } from '../types';

export type GamePhase = 'MENU' | 'PLAYING' | 'EFFECT_ORDERING' | 'EFFECT_RESOLUTION' | 'RESOLVING_NET_DAMAGE' | 'GAME_OVER' | 'VICTORY';

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
    // Normalized node state — single source of truth.
    nodes: NodeRecord;
    // Index into `nodes` for the currently active (targetable) servers.
    activeServerIds: string[];
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
    pendingNetDamage: number;
    isCardCommitted: boolean;
}

// ----- Visual Playback Event -----
// A discrete, presentation-only command for the PlaybackController.
// Does NOT carry logical state mutations — those are committed synchronously by Dispatch.

export type PlaybackEventType =
    | 'PLAY_SFX'
    | 'ANIMATE_CELLS'    // board cell state transitions
    | 'ANIMATE_NODES'    // server progress / status animations
    | 'WAIT';            // pure time delay with no other side effect

export interface PlaybackEvent {
    type: PlaybackEventType;
    durationMs: number;
    payload?: any;       // sfx key, affected cell ids, node ids, etc.
}

// ----- State Deltas (internal to the game engine only) -----
// Used exclusively by the FSM / mechanics pipeline to accumulate incremental changes
// before the final logical commit at the end of Dispatch.

export interface StateDeltas {
    grid?: Grid;
    refillRate?: number;
    // Normalized node mutations:
    nodes?: NodeRecord;
    activeServerIds?: string[];
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
    // Engine-internal transient fields (stripped before committing):
    events?: Array<{ type: string; payload?: any; durationMs?: number }>;
    pendingEffects?: Effect[];
    effectQueue?: ActiveEffect[];
    activeCardId?: string | null;
    reprogramTargetSource?: Coordinate | null;
    pendingNetDamage?: number;
    isCardCommitted?: boolean;
    durationMs?: number;
    harvestedCells?: Cell[];
    targetHacked?: boolean;

    // ----- Legacy compatibility fields (NetworkNode[]) -----
    // These are kept to support the transitional read path in resetMechanic
    // which references snapshot.activeServers. Remove once fully migrated.
    /** @deprecated Derive from activeServerIds + nodes instead */
    activeServers?: NetworkNode[];
    /** @deprecated Use nodes instead */
    networkGraph?: NetworkNode[];
}

export type GameAction =
    | { type: 'INITIALIZE_GAME' }
    | { type: 'SELECT_CARD'; payload: { cardId: string | null } }
    | { type: 'ROTATE_CARD' }
    | { type: 'RESOLVE_RUN'; payload: { x: number; y: number; pattern: any[] } }
    | { type: 'SYSTEM_RESET' }
    | { type: 'PLAY_CARD'; payload: { cardId: string; effects: Effect[] } }
    | { type: 'QUEUE_EFFECT'; payload: { effect: Effect } }
    | { type: 'CONFIRM_EFFECT_ORDER' }
    | { type: 'SET_REPROGRAM_SOURCE'; payload: { source: Coordinate | null } }
    | { type: 'RESOLVE_REPROGRAM'; payload: { source: Coordinate; dest: Coordinate } }
    | { type: 'RESOLVE_SYSTEM_RESET' }
    | { type: 'DISCARD_FOR_NET_DAMAGE'; payload: { cardId: string } }
    | { type: 'FINISH_CARD_RESOLUTION' }
    | { type: 'CANCEL_CARD' };
