// Core types for the game engine - Shared between Game and Editor

export type CellColor = 'ORANGE' | 'SKY' | 'EMERALD' | 'LIME' | 'FUCHSIA';
export type CellSymbol = 'SHIELD' | 'EYE' | 'SKULL' | 'NONE';

export interface Coordinate {
  x: number;
  y: number;
}

export interface EffectRun {
  type: 'RUN';
  pattern: Coordinate[];
}

export interface EffectReprogram {
  type: 'REPROGRAM';
  amount: number;
}

export interface EffectSystemReset {
  type: 'SYSTEM_RESET';
}


export type Effect = EffectRun | EffectReprogram | EffectSystemReset;

export interface CardDefinition {
  name: string;
  visualColor: CellColor;
  effects: Effect[];
  memory: number;
  weight: number;
  isStartingCard: boolean;
}

export type NodeLayers = Partial<Record<CellColor, number[]>>;

export type CountermeasureType = 'TRACE' | 'HARDWARE_DAMAGE' | 'NET_DAMAGE' | 'SCRAMBLE' | 'NOISE' | 'VIRUS';

export type CountermeasurePayload = { type: CountermeasureType; value: number };

export interface Countermeasure {
  requiredSymbols: CellSymbol[];
  type: CountermeasureType;
  value: number;
}

export type NodeType = 'SERVER' | 'ICE' | 'MAINFRAME' | 'HOME';

export interface NodeDefinition {
  type: NodeType;
  name: string;
  baseDifficulty: number;
  weight: number;
  layers: NodeLayers;
  countermeasures: Countermeasure[];
  resetTrace: number;
}

// Runtime Metadata Blueprints for Schema-Driven UI
export type FieldType = 'number' | 'string' | 'boolean' | 'coordinate_array' | 'select' | 'color' | 'symbol_array';

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
  RUN: {
    label: 'RUN (Grid Pattern)',
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
  }
};

export const COUNTERMEASURE_METADATA: Blueprint = {
  label: 'Node Countermeasure',
  fields: {
    requiredSymbols: {
      label: 'Required Symbols',
      type: 'symbol_array',
      default: [],
      options: ['SHIELD', 'EYE', 'SKULL']
    },
    type: { 
      label: 'Penalty Type', 
      type: 'select', 
      default: 'TRACE',
      options: ['TRACE', 'HARDWARE_DAMAGE', 'NET_DAMAGE', 'SCRAMBLE', 'NOISE', 'VIRUS'] 
    },
    value: { label: 'Penalty Value', type: 'number', default: 1 }
  }
};
