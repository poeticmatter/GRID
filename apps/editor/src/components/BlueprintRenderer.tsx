import type { BlueprintField } from '@grid/shared';
import { PatternGrid } from './PatternGrid';
import { SymbolArrayInput } from './SymbolArrayInput';

export function BlueprintRenderer({ field, value, onChange }: { field: BlueprintField, value: any, onChange: (val: any) => void }) {
    switch (field.type) {
        case 'number':
            return (
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                    <input
                        type="number"
                        value={value ?? field.default}
                        onChange={e => onChange(parseInt(e.target.value))}
                        className="w-full bg-slate-900/80 border border-slate-800 p-3 rounded-lg focus:border-emerald-500/50 outline-none font-mono text-emerald-400 transition-all focus:ring-1 focus:ring-emerald-500/20"
                    />
                </div>
            );
        case 'select':
            return (
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                    <select
                        value={value ?? field.default}
                        onChange={e => onChange(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-800 p-3 rounded-lg focus:border-emerald-500/50 outline-none font-bold text-slate-300 transition-all"
                    >
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            );
        case 'coordinate_array':
            return (
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                    <PatternGrid pattern={value ?? field.default} onChange={onChange} />
                </div>
            );
        case 'symbol_array':
            return (
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field.label}</label>
                    <SymbolArrayInput
                        value={value ?? field.default}
                        options={field.options || []}
                        onChange={onChange}
                    />
                </div>
            );
        default:
            return null;
    }
}
