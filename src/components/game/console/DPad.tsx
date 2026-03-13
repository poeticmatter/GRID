import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Check } from 'lucide-react';

interface DPadProps {
    onMove: (dx: number, dy: number) => void;
    onRotate: () => void;
    onConfirm: () => void;
    layout?: 'horizontal' | 'vertical';
    confirmLabel?: string;
}

export const DPad = ({ 
    onMove, 
    onRotate, 
    onConfirm, 
    layout = 'vertical',
    confirmLabel = 'Confirm'
}: DPadProps) => {
    if (layout === 'horizontal') {
        return (
            <div className="flex flex-row items-stretch gap-3 w-full">
                <div className="grid grid-cols-3 gap-1 shrink-0">
                    <div />
                    <button 
                        onPointerDown={() => onMove(0, -1)}
                        className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                    >
                        <ArrowUp className="w-5 h-5 text-cyan-400" />
                    </button>
                    <div />
                    
                    <button 
                        onPointerDown={() => onMove(-1, 0)}
                        className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-cyan-400" />
                    </button>
                    
                    <button 
                        onPointerDown={onRotate}
                        className="w-11 h-11 bg-rose-500/20 border border-rose-500/40 rounded-lg flex items-center justify-center active:bg-rose-500/40 transition-colors"
                    >
                        <RotateCw className="w-5 h-5 text-rose-400" />
                    </button>
                    
                    <button 
                        onPointerDown={() => onMove(1, 0)}
                        className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                    >
                        <ArrowRight className="w-5 h-5 text-cyan-400" />
                    </button>

                    <div />
                    <button 
                        onPointerDown={() => onMove(0, 1)}
                        className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                    >
                        <ArrowDown className="w-5 h-5 text-cyan-400" />
                    </button>
                    <div />
                </div>

                <button 
                    onPointerDown={onConfirm}
                    className="flex-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex flex-col items-center justify-center gap-1 font-black text-emerald-400 uppercase tracking-widest active:bg-emerald-500/40 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                    <Check className="w-6 h-6" />
                    <span className="text-[10px]">{confirmLabel}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-2 w-full">
            <div className="grid grid-cols-3 gap-2">
                <div />
                <button 
                    onPointerDown={() => onMove(0, -1)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                >
                    <ArrowUp className="w-6 h-6 text-cyan-400" />
                </button>
                <div />
                
                <button 
                    onPointerDown={() => onMove(-1, 0)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-cyan-400" />
                </button>
                
                <button 
                    onPointerDown={onRotate}
                    className="w-12 h-12 bg-rose-500/20 border border-rose-500/40 rounded-lg flex items-center justify-center active:bg-rose-500/40 transition-colors"
                >
                    <RotateCw className="w-6 h-6 text-rose-400" />
                </button>
                
                <button 
                    onPointerDown={() => onMove(1, 0)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 text-cyan-400" />
                </button>

                <div />
                <button 
                    onPointerDown={() => onMove(0, 1)}
                    className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-center active:bg-cyan-500/40 transition-colors"
                >
                    <ArrowDown className="w-6 h-6 text-cyan-400" />
                </button>
                <div />
            </div>

            <button 
                onPointerDown={onConfirm}
                className="w-full h-12 mt-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex items-center justify-center gap-2 font-black text-emerald-400 uppercase tracking-widest active:bg-emerald-500/40 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
                <Check className="w-5 h-5" />
                {confirmLabel}
            </button>
        </div>
    );
};
