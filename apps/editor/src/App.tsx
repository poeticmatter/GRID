import { useState, useEffect, useRef } from 'react';
import { 
    CardDefinition, 
    NodeDefinition, 
    Countermeasure,
    CardPoolSchema, 
    NodePoolsSchema, 
    EFFECT_METADATA, 
    COUNTERMEASURE_METADATA,
    Effect,
    BlueprintField,
    CellColor
} from '@grid/shared';
import { PatternGrid } from './components/PatternGrid';
import { Download, Upload, Plus, Trash2, Database, Layout, AlertCircle, ChevronUp, ChevronDown, Shield, Eye, Skull, X } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'CARDS' | 'NODES';

export default function App() {
    const [activeTab, setActiveTab] = useState<Tab>('CARDS');
    const [cards, setCards] = useState<Record<string, CardDefinition>>({});
    const [nodes, setNodes] = useState<Record<string, NodeDefinition[]>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedNodePool, setSelectedNodePool] = useState<string | null>(null);
    const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Persistence
    useEffect(() => {
        const savedCards = localStorage.getItem('grid-assets-cards');
        const savedNodes = localStorage.getItem('grid-assets-nodes');
        try {
            if (savedCards) setCards(JSON.parse(savedCards));
            if (savedNodes) setNodes(JSON.parse(savedNodes));
        } catch (e) {
            console.error("Failed to load persistence", e);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('grid-assets-cards', JSON.stringify(cards));
        localStorage.setItem('grid-assets-nodes', JSON.stringify(nodes));
    }, [cards, nodes]);

    const handleExport = () => {
        const download = (blob: Blob, name: string) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.click();
            URL.revokeObjectURL(url);
        };

        if (activeTab === 'CARDS') {
            const blob = new Blob([JSON.stringify(cards, null, 4)], { type: 'application/json' });
            download(blob, 'cards.json');
        } else {
            const blob = new Blob([JSON.stringify(nodes, null, 4)], { type: 'application/json' });
            download(blob, 'nodes.json');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                setError(null);

                // Validation Gate
                if (file.name.includes('cards')) {
                    const validated = CardPoolSchema.parse(json);
                    setCards(validated);
                } else if (file.name.includes('nodes')) {
                    const validated = NodePoolsSchema.parse(json);
                    setNodes(validated);
                } else {
                    throw new Error("Unknown file type. Name must contain 'cards' or 'nodes'.");
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Invalid JSON or Schema Mismatch");
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addCard = () => {
        const id = `card_${Date.now()}`;
        setCards(prev => ({
            ...prev,
            [id]: {
                name: 'New Card',
                visualColor: 'SKY',
                memory: 1,
                weight: 10,
                isStartingCard: false,
                effects: []
            }
        }));
        setSelectedId(id);
    };

    const addNode = (pool: string) => {
        const newNode: NodeDefinition = {
            type: 'SERVER',
            name: 'New Node',
            baseDifficulty: 1,
            weight: 10,
            layers: {},
            countermeasures: [],
            resetTrace: 1
        };
        setNodes(prev => ({
            ...prev,
            [pool]: [...(prev[pool] || []), newNode]
        }));
        setSelectedNodePool(pool);
        setSelectedNodeIndex((nodes[pool]?.length || 0));
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200">
            <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
            
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="text-emerald-500 w-6 h-6" />
                        <h1 className="font-bold text-xl tracking-tight uppercase">Grid.dev</h1>
                    </div>
                </div>

                {error && (
                    <div className="m-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex gap-3 text-red-400 text-xs animate-in slide-in-from-top">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <div>{error}</div>
                    </div>
                )}

                <div className="flex p-2 gap-2 bg-black/20">
                    <button 
                        onClick={() => setActiveTab('CARDS')}
                        className={clsx("flex-1 py-2 rounded text-sm font-bold transition-all", activeTab === 'CARDS' ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "hover:bg-slate-800 text-slate-400")}
                    >
                        Cards
                    </button>
                    <button 
                        onClick={() => setActiveTab('NODES')}
                        className={clsx("flex-1 py-2 rounded text-sm font-bold transition-all", activeTab === 'NODES' ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "hover:bg-slate-800 text-slate-400")}
                    >
                        Nodes
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none">
                    {activeTab === 'CARDS' ? (
                        <>
                            {Object.entries(cards).map(([id, card]) => (
                                <button
                                    key={id}
                                    onClick={() => setSelectedId(id)}
                                    className={clsx("w-full text-left p-3 rounded-lg border transition-all group relative", 
                                        selectedId === id ? "bg-emerald-500/10 border-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]" : "bg-slate-800/50 border-slate-700 hover:border-slate-500")}
                                >
                                    <div className="font-bold truncate pr-6">{card.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono italic">{id}</div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); const next = {...cards}; delete next[id]; setCards(next); if(selectedId === id) setSelectedId(null); }}
                                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </button>
                            ))}
                            <button onClick={addCard} className="w-full py-4 rounded-lg border border-dashed border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 flex items-center justify-center gap-2 text-slate-400 font-bold transition-all">
                                <Plus className="w-4 h-4" /> New Card
                            </button>
                        </>
                    ) : (
                        <>
                            {Object.entries(nodes).map(([pool, poolNodes]) => (
                                <div key={pool} className="space-y-1 mb-6">
                                    <div className="flex items-center justify-between px-2 mb-2">
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{pool}</div>
                                        <button onClick={() => {const n={...nodes}; delete n[pool]; setNodes(n);}} className="text-slate-700 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    {poolNodes.map((node, idx) => (
                                        <button
                                            key={`${pool}-${idx}`}
                                            onClick={() => { setSelectedNodePool(pool); setSelectedNodeIndex(idx); }}
                                            className={clsx("w-full text-left p-2 rounded-lg border transition-all text-sm group relative", 
                                            selectedNodePool === pool && selectedNodeIndex === idx ? "bg-emerald-500/10 border-emerald-500" : "bg-slate-800/30 border-slate-800 hover:border-slate-600")}
                                        >
                                            <div className="truncate pr-6">{node.name}</div>
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    const next = [...nodes[pool]]; 
                                                    next.splice(idx, 1); 
                                                    setNodes({...nodes, [pool]: next});
                                                    if (selectedNodePool === pool && selectedNodeIndex === idx) { setSelectedNodePool(null); setSelectedNodeIndex(null); }
                                                }}
                                                className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </button>
                                    ))}
                                    <button onClick={() => addNode(pool)} className="w-full py-2 text-[10px] rounded-lg border border-dashed border-slate-800 text-slate-600 hover:border-slate-500 font-bold uppercase tracking-widest transition-all">
                                        + Add {pool}
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => {
                                const name = prompt('New Pool Identifier?');
                                if (name) setNodes(prev => ({ ...prev, [name]: [] }));
                            }} className="w-full py-4 rounded-lg border border-dashed border-slate-800 text-slate-500 font-bold transition-all hover:border-slate-600">
                                <Layout className="w-4 h-4 mx-auto" />
                            </button>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 grid grid-cols-2 gap-2 bg-black/30">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black tracking-widest">
                        <Upload className="w-3 h-3" /> IMPORT
                    </button>
                    <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Download className="w-3 h-3" /> EXPORT
                    </button>
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#0f172a,black)] p-12 custom-scrollbar">
                {activeTab === 'CARDS' && selectedId && cards[selectedId] ? (
                    <CardEditor card={cards[selectedId]} update={(c) => setCards(prev => ({ ...prev, [selectedId]: c }))} />
                ) : activeTab === 'NODES' && selectedNodePool !== null && selectedNodeIndex !== null && nodes[selectedNodePool]?.[selectedNodeIndex] ? (
                    <NodeEditor node={nodes[selectedNodePool][selectedNodeIndex]} update={(n) => {
                        const newPool = [...nodes[selectedNodePool]];
                        newPool[selectedNodeIndex] = n;
                        setNodes(prev => ({ ...prev, [selectedNodePool]: newPool }));
                    }} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 italic border-4 border-dashed border-slate-900/50 rounded-3xl m-4">
                        <div className="relative mb-6">
                            <Layout className="w-24 h-24 opacity-10" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 opacity-20 animate-pulse" />
                            </div>
                        </div>
                        <div className="tracking-[0.3em] font-black opacity-20">AWAITING_INPUT_STREAM</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Schema-Driven Generic Field Renderer
function BlueprintRenderer({ field, value, onChange }: { field: BlueprintField, value: any, onChange: (val: any) => void }) {
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

// Specialized sub-component for decoupled array parsing
function LayerArrayInput({ value, onChange }: { value: number[], onChange: (val: number[]) => void }) {
    const [localValue, setLocalValue] = useState(value.join(', '));

    // Sync from parent if value changes externally (e.g. node selection change)
    useEffect(() => {
        const joined = value.join(', ');
        // Don't overwrite if the parsed numbers are the same (prevents cursor jump while typing)
        const currentParsed = localValue.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        if (JSON.stringify(currentParsed) !== JSON.stringify(value)) {
            setLocalValue(joined);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const str = e.target.value;
        setLocalValue(str);
        
        // Only trigger parent update if the parsed numbers have actually changed
        const parsed = str.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        onChange(parsed);
    };

    return (
        <input 
            className="bg-transparent border-none focus:outline-none text-xs font-mono text-emerald-400 placeholder:text-slate-700 w-full" 
            placeholder="Lane Capacities (e.g. 2, 4, 1)" 
            value={localValue}
            onChange={handleChange}
        />
    );
}

// Specialized sub-component for visual symbol array input
function SymbolArrayInput({ value, options, onChange }: { value: string[], options: string[], onChange: (val: string[]) => void }) {
    const SymbolIcon: Record<string, any> = { SHIELD: Shield, EYE: Eye, SKULL: Skull };

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
                    {options.map(opt => {
                        const Icon = SymbolIcon[opt];
                        return (
                            <button
                                key={opt}
                                onClick={() => addSymbol(opt)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-lg flex flex-col items-center gap-1 transition-all group"
                                title={`Add ${opt}`}
                            >
                                {Icon && <Icon className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />}
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{opt}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Selection */}
            <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Requirements ({value.length})</span>
                <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-black/20 rounded-lg border border-slate-800/50">
                    {value.map((sym, idx) => {
                        const Icon = SymbolIcon[sym];
                        return (
                            <button
                                key={idx}
                                onClick={() => removeSymbol(idx)}
                                className="relative bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-500/50 p-2 rounded flex items-center justify-center transition-all group"
                                title="Click to remove"
                            >
                                {Icon && <Icon className="w-5 h-5 text-amber-400" />}
                                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 rounded-full p-0.5 shadow-lg transition-opacity">
                                    <X className="w-2 h-2 text-white" />
                                </div>
                            </button>
                        );
                    })}
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

function CardEditor({ card, update }: { card: CardDefinition, update: (c: CardDefinition) => void }) {
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

function NodeEditor({ node, update }: { node: NodeDefinition, update: (n: NodeDefinition) => void }) {
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
