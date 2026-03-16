import {
    CardDefinition,
    EFFECT_METADATA,
    Effect,
} from '@grid/shared';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { BlueprintRenderer } from './BlueprintRenderer';
import clsx from 'clsx';

export function CardEditor({ card, update }: { card: CardDefinition, update: (c: CardDefinition) => void }) {
    const addEffect = (type: Effect['type']) => {
        const metadata = EFFECT_METADATA[type];
        const newEffect: any = { type };

        // Initialize with defaults from blueprint
        Object.entries(metadata.fields).forEach(([key, field]) => {
            newEffect[key] = structuredClone(field.default);
        });

        update({ ...card, effects: [...card.effects, newEffect] });
    };

    const removeEffect = (index: number) => {
        const next = [...card.effects];
        next.splice(index, 1);
        update({ ...card, effects: next });
    };

    const updateEffectField = (index: number, field: string, value: any) => {
        const next = structuredClone(card.effects);
        (next[index] as any)[field] = value;
        update({ ...card, effects: next });
    };

    const moveEffect = (index: number, dir: 'up' | 'down') => {
        const next = [...card.effects];
        const swapIdx = dir === 'up' ? index - 1 : index + 1;
        if (swapIdx < 0 || swapIdx >= next.length) return;
        [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
        update({ ...card, effects: next });
    };

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="space-y-4">
                <input
                    className="bg-transparent text-5xl font-black border-b-2 border-slate-900 hover:border-slate-800 focus:border-emerald-500 focus:outline-none w-full py-2 transition-all tracking-tighter"
                    value={card.name}
                    onChange={e => update({ ...card, name: e.target.value })}
                />
                <div className="flex gap-4">
                    <div className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        ID: <span className="text-slate-400">LOCAL_{card.name.toUpperCase().replace(/\s+/g, '_')}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] border-b border-slate-900 pb-2">Primary Configuration</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Allocation</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-emerald-500 outline-none font-mono text-emerald-500" value={card.memory} onChange={e => update({ ...card, memory: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spawn Probability</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-emerald-500 outline-none font-mono text-emerald-500" value={card.weight} onChange={e => update({ ...card, weight: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
                        <div className="flex-1">
                            <div className="text-sm font-bold text-slate-200">Starting Asset</div>
                            <div className="text-[10px] text-slate-500 uppercase">Include in player's initial buffer</div>
                        </div>
                        <button
                            onClick={() => update({ ...card, isStartingCard: !card.isStartingCard })}
                            className={clsx("w-12 h-6 rounded-full transition-all relative", card.isStartingCard ? "bg-emerald-600" : "bg-slate-800")}
                        >
                            <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", card.isStartingCard ? "left-7" : "left-1")} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Effect Pipeline</h3>
                        <select
                            onChange={(e) => { if(e.target.value) addEffect(e.target.value as any); e.target.value = ''; }}
                            className="bg-emerald-600 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-colors outline-none"
                        >
                            <option value="">+ ADD_EFFECT</option>
                            {Object.keys(EFFECT_METADATA).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        {card.effects.map((effect, idx) => {
                            const metadata = EFFECT_METADATA[effect.type];
                            return (
                                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group animate-in zoom-in-95 duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                                                {idx + 1}
                                            </div>
                                            <span className="font-black text-xs uppercase tracking-widest text-slate-300">{metadata.label}</span>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveEffect(idx, 'up')} className="p-1 hover:text-emerald-400 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                                            <button onClick={() => moveEffect(idx, 'down')} className="p-1 hover:text-emerald-400 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                                            <button onClick={() => removeEffect(idx)} className="p-1 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(metadata.fields).map(([fieldName, field]) => (
                                            <BlueprintRenderer
                                                key={fieldName}
                                                field={field}
                                                value={(effect as any)[fieldName]}
                                                onChange={(val) => updateEffectField(idx, fieldName, val)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {card.effects.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-900 rounded-3xl text-slate-800 text-xs font-bold uppercase tracking-widest">
                                EMPTY_EFFECT_STACK
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
