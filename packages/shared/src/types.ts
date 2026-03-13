// Core types for the game engine - Shared between Game and Editor

export type CellColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE';
export type CellSymbol = 'SHIELD' | 'EYE' | 'SKULL' | 'NONE';

export interface Coordinate {
  x: number;
  y: number;
}

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

export type NodeLayers = Partial<Record<CellColor, number[]>>;

export type CountermeasurePayload = { type: 'TRACE' | 'HARDWARE_DAMAGE' | 'NET_DAMAGE'; value: number };
export type CountermeasureDict = Partial<Record<CellColor, CountermeasurePayload>>;

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

// Runtime Metadata Blueprints for Schema-Driven UI
export type FieldType = 'number' | 'string' | 'boolean' | 'coordinate_array' | 'select' | 'color';

export interface BlueprintField {
  label: string;
  type: FieldType;
  default: any;
  options?: string[]; // For 'select' type
}

export interface Blueprint {
  label: string;
  fields: Record<string, BlueprintField>;
}

export const EFFECT_METADATA: Record<Effect['type'], Blueprint> = {
  CUT: {
    label: 'CUT (Grid Pattern)',
    fields: {
      pattern: { label: 'Pattern', type: 'coordinate_array', default: [{ x: 0, y: 0 }] }
    }
  },
  REPROGRAM: {
    label: 'REPROGRAM (Modify Values)',
    fields: {
      amount: { label: 'Amount', type: 'number', default: 1 }
    }
  },
  SYSTEM_RESET: {
    label: 'SYSTEM RESET (Total Cleanup)',
    fields: {}
  },
  END_TURN: {
    label: 'END TURN (Forced)',
    fields: {
      tracePenalty: { label: 'Trace Penalty', type: 'number', default: 2 }
    }
  }
};

export const COUNTERMEASURE_METADATA: Blueprint = {
  label: 'Node Countermeasure',
  fields: {
    type: { 
      label: 'Penalty Type', 
      type: 'select', 
      default: 'TRACE',
      options: ['TRACE', 'HARDWARE_DAMAGE', 'NET_DAMAGE'] 
    },
    value: { label: 'Penalty Value', type: 'number', default: 10 }
  }
};
