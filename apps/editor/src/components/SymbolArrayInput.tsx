import { X } from 'lucide-react';

const SYMBOL_SVG_PROPS = {
    viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const,
};

const SYMBOL_SVG: Record<string, React.ReactNode> = {
    CUBE: (
        <svg {...SYMBOL_SVG_PROPS}>
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
            <line x1="12" y1="12" x2="12" y2="2" /><line x1="12" y1="12" x2="21" y2="7" /><line x1="12" y1="12" x2="3" y2="7" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    ),
    TRIANGLE: (
        <svg {...SYMBOL_SVG_PROPS}>
            <polygon points="12,3 21.5,20 2.5,20" />
            <circle cx="12" cy="3" r="2" fill="currentColor" stroke="none" />
            <circle cx="21.5" cy="20" r="2" fill="currentColor" stroke="none" />
            <circle cx="2.5" cy="20" r="2" fill="currentColor" stroke="none" />
        </svg>
    ),
    NESTED: (
        <svg {...SYMBOL_SVG_PROPS}>
            <rect x="2" y="2" width="20" height="20" />
            <rect x="6" y="6" width="12" height="12" />
            <rect x="10" y="10" width="4" height="4" />
        </svg>
    ),
    STAR: (
        <svg {...SYMBOL_SVG_PROPS}>
            <line x1="12" y1="12" x2="12" y2="2" /><line x1="12" y1="12" x2="21" y2="7" />
            <line x1="12" y1="12" x2="21" y2="17" /><line x1="12" y1="12" x2="12" y2="22" />
            <line x1="12" y1="12" x2="3" y2="17" /><line x1="12" y1="12" x2="3" y2="7" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
    ),
    ORBIT: (
        <svg {...SYMBOL_SVG_PROPS}>
            <ellipse cx="12" cy="12" rx="10" ry="3.5" />
            <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(120 12 12)" />
            <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
    ),
};

export function SymbolArrayInput({ value, options, onChange }: { value: string[], options: string[], onChange: (val: string[]) => void }) {

    const addSymbol = (sym: string) => {
        onChange([...value, sym]);
    };

    const removeSymbol = (index: number) => {
        const next = [...value];
        next.splice(index, 1);
        onChange(next);
    };

    return (
        <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            {/* Palette */}
            <div className="flex flex-col gap-2">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Add Symbol</span>
                <div className="flex gap-2">
                    {options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => addSymbol(opt)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-lg flex flex-col items-center gap-1 transition-all group"
                            title={`Add ${opt}`}
                        >
                            <span className="text-amber-400">{SYMBOL_SVG[opt]}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Selection */}
            <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Requirements ({value.length})</span>
                <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-black/20 rounded-lg border border-slate-800/50">
                    {value.map((sym, idx) => (
                        <button
                            key={idx}
                            onClick={() => removeSymbol(idx)}
                            className="relative bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-500/50 p-2 rounded flex items-center justify-center transition-all group"
                            title="Click to remove"
                        >
                            <span className="text-amber-400">{SYMBOL_SVG[sym]}</span>
                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 rounded-full p-0.5 shadow-lg transition-opacity">
                                <X className="w-2 h-2 text-white" />
                            </div>
                        </button>
                    ))}
                    {value.length === 0 && (
                        <div className="flex items-center justify-center w-full text-[10px] italic text-slate-700 uppercase tracking-widest font-bold">
                            No requirements
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
