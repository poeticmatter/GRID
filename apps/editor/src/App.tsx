import { useState, useEffect, useRef } from 'react';
import {
    CardDefinition,
    NodeDefinition,
    CardPoolSchema,
    NodePoolsSchema,
} from '@grid/shared';
import { CardEditor } from './components/CardEditor';
import { NodeEditor } from './components/NodeEditor';
import { Download, Upload, Plus, Trash2, Database, Layout, AlertCircle } from 'lucide-react';
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
