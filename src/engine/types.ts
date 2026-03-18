import type { CellColor, CellSymbol, Effect, NodeType, NodeLayers, Countermeasure } from '@grid/shared';
export * from '@grid/shared';

export type CellState = 'PRIMED' | 'BROKEN' | 'CORRUPTED';

export interface Cell {
  id: string;
  x: number;
  y: number;
  color: CellColor;
  symbol: CellSymbol;
  state: CellState;
  hasVirus?: boolean;
}

export type Grid = Cell[][];

export interface Card {
  id: string;
  name: string;
  visualColor: CellColor;
  effects: Effect[];
  memory: number;
}

export interface NetworkNode {
  id: string;
  type: NodeType;
  name: string;
  difficulty: number;
  layers: NodeLayers;
  progress: Partial<Record<CellColor, boolean[]>>;
  countermeasures: Countermeasure[];
  /** Countermeasures that fire unconditionally when SYSTEM_RESET resolves. */
  globalCountermeasures?: Countermeasure[];
  resetTrace: number;
  status: 'ACTIVE' | 'HACKED' | 'LOCKED' | 'BYPASSED';
  visibility: 'REVEALED' | 'HIDDEN';
  children: string[];
  gridX: number;
  gridY: number;
  hasHorizontalConnection?: boolean;
}

// Normalized dictionary: the Single Source of Truth for all NetworkNode entities.
export type NodeRecord = Record<string, NetworkNode>;

export interface PlayerStats {
  hardwareHealth: number;
  trace: number;
  credits: number;
  maxHardwareHealth: number;
  maxTrace: number;
}

export interface ActiveEffect {
  cardId: string;
  effect: Effect;
}
