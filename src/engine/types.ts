// Core types for the game engine

export type CellColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE';
export type CellSymbol = 'SHIELD' | 'EYE' | 'SKULL' | 'NONE';
export type CellState = 'LOCKED' | 'BROKEN' | 'CORRUPTED';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Cell {
  id: string; // Unique ID for key prop
  x: number;
  y: number;
  color: CellColor;
  symbol: CellSymbol;
  state: CellState;
}

export type Grid = Cell[][];

export interface EffectCut {
  type: 'CUT';
  pattern: Coordinate[];
}

export interface EffectReprogram {
  type: 'REPROGRAM';
  amount: number;
}

export interface EffectSystemReset {
  type: 'SYSTEM_RESET';
}

export interface EffectEndTurn {
  type: 'END_TURN';
  tracePenalty?: number;
}

export type Effect = EffectCut | EffectReprogram | EffectSystemReset | EffectEndTurn;

export interface CardDefinition {
  name: string;
  visualColor: CellColor;
  effects: Effect[];
  memory: number;
  weight: number;
  isStartingCard: boolean;
}

export interface Card {
  id: string;
  name: string;
  visualColor: CellColor;
  effects: Effect[];
  memory: number;
}

export interface LayerSlot {
  symbol: CellSymbol | 'NONE';
}

export type NodeLayers = Partial<Record<CellColor, LayerSlot[]>>;

export type CountermeasurePayload = { type: 'TRACE' | 'HARDWARE_DAMAGE' | 'NET_DAMAGE'; value: number };
export type CountermeasureDict = Partial<Record<CellSymbol, CountermeasurePayload>>;

export type NodeType = 'SERVER' | 'ICE' | 'MAINFRAME' | 'HOME';

export interface NodeDefinition {
  type: NodeType;
  name: string;
  baseDifficulty: number;
  weight: number;
  layers: NodeLayers;
  countermeasures: CountermeasureDict;
  resetTrace: number;
}

export interface NetworkNode {
  id: string;
  type: NodeType;
  name: string;
  difficulty: number;
  layers: NodeLayers;
  progress: Partial<Record<CellColor, boolean[]>>; // Progress towards hacking layers
  countermeasures: CountermeasureDict;
  resetTrace: number;
  status: 'ACTIVE' | 'HACKED' | 'LOCKED' | 'BYPASSED';
  visibility: 'REVEALED' | 'HIDDEN';
  children: string[];
  gridX: number;
  gridY: number;
}

export interface PlayerStats {
  hardwareHealth: number; // Meat health
  trace: number; // 0-100
  credits: number;
  maxHardwareHealth: number;
}

export interface ActiveEffect {
  cardId: string;
  effect: Effect;
}
