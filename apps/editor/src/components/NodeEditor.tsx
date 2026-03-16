import {
    NodeDefinition,
    Countermeasure,
    COUNTERMEASURE_METADATA,
    CellColor,
} from '@grid/shared';
import { Trash2 } from 'lucide-react';
import { BlueprintRenderer } from './BlueprintRenderer';
import { LayerArrayInput } from './LayerArrayInput';
import clsx from 'clsx';

export function NodeEditor({ node, update }: { node: NodeDefinition, update: (n: NodeDefinition) => void }) {
    const addCountermeasure = () => {
        const newCM: Countermeasure = { requiredSymbols: [], type: 'TRACE', value: 10 };
        // Initialize from blueprint defaults
        Object.entries(COUNTERMEASURE_METADATA.fields).forEach(([key, fieldCfg]) => {
            (newCM as any)[key] = structuredClone(fieldCfg.default);
        });
        update({ ...node, countermeasures: [...node.countermeasures, newCM] });
    };

    const updateCMField = (index: number, field: string, value: any) => {
        const next = structuredClone(node.countermeasures);
        (next[index] as any)[field] = value;
        update({ ...node, countermeasures: next });
    };

    const removeCountermeasure = (index: number) => {
        const next = [...node.countermeasures];
        next.splice(index, 1);
        update({ ...node, countermeasures: next });
    };

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
             <header className="space-y-4">
                <input
                    className="bg-transparent text-5xl font-black border-b-2 border-slate-900 hover:border-slate-800 focus:border-cyan-500 focus:outline-none w-full py-2 transition-all tracking-tighter"
                    value={node.name}
                    onChange={e => update({ ...node, name: e.target.value })}
                />
                <div className="flex gap-4">
                    <select
                        className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-black text-emerald-500 uppercase tracking-widest outline-none focus:border-emerald-500"
                        value={node.type}
                        onChange={e => update({ ...node, type: e.target.value as any })}
                    >
                        <option>SERVER</option>
                        <option>ICE</option>
                        <option>MAINFRAME</option>
                        <option>HOME</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] border-b border-slate-900 pb-2">Node Mechanics</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Base Tier/Difficulty</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-emerald-500 outline-none font-mono text-emerald-500" value={node.baseDifficulty} onChange={e => update({ ...node, baseDifficulty: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Procedural Weight</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-emerald-500 outline-none font-mono text-emerald-500" value={node.weight} onChange={e => update({ ...node, weight: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em] border-b border-slate-900 pb-2 mt-8">Defense Layers</h3>
                    <div className="space-y-3">
                        {['ORANGE', 'SKY', 'EMERALD', 'LIME', 'FUCHSIA'].map(color => (
                            <div key={color} className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in duration-300">
                                <div className="p-4 flex items-center gap-4 bg-black/20">
                                    <div className={clsx("w-4 h-4 rounded-full shadow-[0_0_10px]", {
                                        'bg-orange-500 shadow-orange-500/50': color === 'ORANGE',
                                        'bg-sky-500 shadow-sky-500/50': color === 'SKY',
                                        'bg-emerald-500 shadow-emerald-500/50': color === 'EMERALD',
                                        'bg-lime-500 shadow-lime-500/50': color === 'LIME',
                                        'bg-fuchsia-500 shadow-fuchsia-500/50': color === 'FUCHSIA',
                                    })} />
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex-1">{color} LAYERS</span>
                                    <LayerArrayInput
                                        value={node.layers[color as CellColor] || []}
                                        onChange={(val) => update({ ...node, layers: { ...node.layers, [color as CellColor]: val } })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Countermeasures</h3>
                        <button
                            onClick={addCountermeasure}
                            className="bg-emerald-600 text-[10px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest cursor-pointer hover:bg-emerald-500 transition-colors"
                        >
                            + ADD_COUNTERMEASURE
                        </button>
                    </div>

                    <div className="space-y-4">
                        {(node.countermeasures || []).map((cm, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative group animate-in zoom-in-95 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-500 border border-amber-500/20">
                                            {idx + 1}
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-widest text-slate-300">{COUNTERMEASURE_METADATA.label}</span>
                                    </div>
                                    <button
                                        onClick={() => removeCountermeasure(idx)}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(COUNTERMEASURE_METADATA.fields).map(([fieldName, field]) => (
                                        <BlueprintRenderer
                                            key={fieldName}
                                            field={field}
                                            value={(cm as any)[fieldName]}
                                            onChange={(val) => updateCMField(idx, fieldName, val)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {(node.countermeasures || []).length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-slate-900 rounded-3xl text-slate-800 text-xs font-bold uppercase tracking-widest">
                                NO_COUNTERMEASURES
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
