import { z } from 'zod';

export const CellColorSchema = z.enum(['ORANGE', 'SKY', 'EMERALD', 'LIME', 'FUCHSIA']);

export const CoordinateSchema = z.object({
    x: z.number(),
    y: z.number()
});

export const EffectRunSchema = z.object({
    type: z.literal('RUN'),
    pattern: z.array(CoordinateSchema)
});

export const EffectReprogramSchema = z.object({
    type: z.literal('REPROGRAM'),
    amount: z.number()
});

export const EffectSystemResetSchema = z.object({
    type: z.literal('SYSTEM_RESET')
});


export const EffectSchema = z.discriminatedUnion('type', [
    EffectRunSchema,
    EffectReprogramSchema,
    EffectSystemResetSchema
]);

export const CardDefinitionSchema = z.object({
    name: z.string(),
    visualColor: CellColorSchema,
    effects: z.array(EffectSchema),
    memory: z.number(),
    weight: z.number(),
    isStartingCard: z.boolean()
});

export const CellSymbolSchema = z.enum(['SHIELD', 'EYE', 'SKULL', 'NONE']);

export const CountermeasurePayloadSchema = z.object({
    type: z.enum(['TRACE', 'HARDWARE_DAMAGE', 'NET_DAMAGE', 'CORRUPT', 'NOISE', 'VIRUS']),
    value: z.number()
});

export const CountermeasureSchema = z.object({
    requiredSymbols: z.array(CellSymbolSchema),
    type: z.enum(['TRACE', 'HARDWARE_DAMAGE', 'NET_DAMAGE', 'CORRUPT', 'NOISE', 'VIRUS']),
    value: z.number()
});

export const NodeLayersSchema = z.record(z.string(), z.array(z.number()));

export const NodeTypeSchema = z.enum(['SERVER', 'ICE', 'MAINFRAME', 'HOME']);

export const NodeDefinitionSchema = z.object({
    type: NodeTypeSchema,
    name: z.string(),
    baseDifficulty: z.number(),
    weight: z.number(),
    layers: NodeLayersSchema,
    countermeasures: z.array(CountermeasureSchema),
    resetTrace: z.number()
});

export const CardPoolSchema = z.record(z.string(), CardDefinitionSchema);
export const NodePoolsSchema = z.record(z.string(), z.array(NodeDefinitionSchema));
