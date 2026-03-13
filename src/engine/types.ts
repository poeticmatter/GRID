import type { CellColor, Effect, NodeType, NodeLayers, CountermeasureDict } from '@grid/shared';
export * from '@grid/shared';

export type CellSymbol = 'SHIELD' | 'EYE' | 'SKULL' | 'NONE';
export type CellState = 'LOCKED' | 'BROKEN' | 'CORRUPTED';

export interface Cell {
  id: string;
  x: number;
  y: number;
  color: CellColor;
  symbol: CellSymbol;
  state: CellState;
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
  countermeasures: CountermeasureDict;
  resetTrace: number;
  status: 'ACTIVE' | 'HACKED' | 'LOCKED' | 'BYPASSED';
  visibility: 'REVEALED' | 'HIDDEN';
  children: string[];
  gridX: number;
  gridY: number;
}

// Normalized dictionary: the Single Source of Truth for all NetworkNode entities.
export type NodeRecord = Record<string, NetworkNode>;

export interface PlayerStats {
  hardwareHealth: number;
  trace: number;
  credits: number;
  maxHardwareHealth: number;
}

export interface ActiveEffect {
  cardId: string;
  effect: Effect;
}
