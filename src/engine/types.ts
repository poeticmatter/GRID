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

export interface Card {
  id: string;
  name: string;
  visualColor: CellColor;
  effects: Effect[];
}

export type NodeRequirements = Array<{ color: CellColor, symbol: CellSymbol | 'NONE' }>;

export type CountermeasurePayload = { type: 'TRACE' | 'HARDWARE_DAMAGE' | 'NET_DAMAGE'; value: number };
export type CountermeasureDict = Partial<Record<CellSymbol, CountermeasurePayload>>;

export type NodeType = 'SERVER' | 'ICE' | 'MAINFRAME';

export interface NodeDefinition {
  type: NodeType;
  name: string;
  baseDifficulty: number;
  weight: number;
  requirements: NodeRequirements;
  countermeasures: CountermeasureDict;
  resetTrace: number;
}

export interface NetworkNode {
  id: string;
  type: NodeType;
  name: string;
  difficulty: number;
  requirements: NodeRequirements;
  progress: boolean[]; // Progress towards hacking requirements
  countermeasures: CountermeasureDict;
  resetTrace: number;
  status: 'ACTIVE' | 'HACKED' | 'LOCKED';
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
