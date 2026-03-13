import { z } from 'zod';

export const CellColorSchema = z.enum(['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE']);

export const CoordinateSchema = z.object({
    x: z.number(),
    y: z.number()
});

export const EffectCutSchema = z.object({
    type: z.literal('CUT'),
    pattern: z.array(CoordinateSchema)
});

export const EffectReprogramSchema = z.object({
    type: z.literal('REPROGRAM'),
    amount: z.number()
});

export const EffectSystemResetSchema = z.object({
    type: z.literal('SYSTEM_RESET')
});

export const EffectEndTurnSchema = z.object({
    type: z.literal('END_TURN'),
    tracePenalty: z.number().optional()
});

export const EffectSchema = z.discriminatedUnion('type', [
    EffectCutSchema,
    EffectReprogramSchema,
    EffectSystemResetSchema,
    EffectEndTurnSchema
]);

export const CardDefinitionSchema = z.object({
    name: z.string(),
    visualColor: CellColorSchema,
    effects: z.array(EffectSchema),
    memory: z.number(),
    weight: z.number(),
    isStartingCard: z.boolean()
});

export const CountermeasurePayloadSchema = z.object({
    type: z.enum(['TRACE', 'HARDWARE_DAMAGE', 'NET_DAMAGE']),
    value: z.number()
});

export const CountermeasureDictSchema = z.record(z.string(), CountermeasurePayloadSchema);

export const NodeLayersSchema = z.record(z.string(), z.array(z.number()));

export const NodeTypeSchema = z.enum(['SERVER', 'ICE', 'MAINFRAME', 'HOME']);

export const NodeDefinitionSchema = z.object({
    type: NodeTypeSchema,
    name: z.string(),
    baseDifficulty: z.number(),
    weight: z.number(),
    layers: NodeLayersSchema,
    countermeasures: CountermeasureDictSchema,
    resetTrace: z.number()
});

export const CardPoolSchema = z.record(z.string(), CardDefinitionSchema);
export const NodePoolsSchema = z.record(z.string(), z.array(NodeDefinitionSchema));
