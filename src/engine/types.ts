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

export type CardAction = 'CUT' | 'RESET';

export interface Card {
  id: string;
  name: string;
  pattern: Coordinate[]; // Relative coordinates centered on anchor
  visualColor: CellColor; // For visual flavor
  action?: CardAction;
}

export interface ServerRequirements {
  colors: Partial<Record<CellColor, number>>;
  symbols: Partial<Record<CellSymbol, number>>; // e.g. Requires 2 Shields to avoid penalty
}

export interface ServerNode {
  id: string;
  name: string;
  difficulty: number;
  requirements: ServerRequirements;
  progress: ServerRequirements; // Progress towards hacking requirements
  penaltyType: 'TRACE' | 'HARDWARE_DAMAGE' | 'NET_DAMAGE';
  penaltyValue: number;
  status: 'ACTIVE' | 'HACKED' | 'LOCKED';
}

export interface PlayerStats {
  hardwareHealth: number; // Meat health
  trace: number; // 0-100
  credits: number;
  maxHardwareHealth: number;
}
