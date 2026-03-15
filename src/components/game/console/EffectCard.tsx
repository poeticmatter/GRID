import type { Effect } from '../../../engine/types';

interface EffectCardProps {
    effect: Effect;
    index: number;
    isActive: boolean;
    isOrdering: boolean;
    onClick: () => void;
    variant: 'mobile' | 'desktop';
}

export const EffectCard = ({ 
    effect, 
    index, 
    isActive: _isActive, 
    isOrdering, 
    onClick, 
    variant 
}: EffectCardProps) => {
    if (variant === 'mobile') {
        return (
            <button
                onClick={onClick}
                className={`
                    relative p-3 text-left rounded-lg border transition-all active:scale-[0.98]
                    ${isOrdering 
                        ? 'bg-green-950/40 border-green-500/30 hover:border-green-400' 
                        : 'bg-zinc-900/20 border-zinc-900/30 opacity-50'}
                `}
            >
                <div className="flex justify-between items-center uppercase tracking-wider">
                    <span className="text-xs font-bold text-green-100">{effect.type}</span>
                    {(effect as any).amount && (
                        <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 rounded font-mono">
                            x{(effect as any).amount}
                        </span>
                    )}
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={!isOrdering}
            className={`
                group relative p-3 text-left transition-all rounded-lg overflow-hidden border
                ${isOrdering 
                    ? 'bg-green-950/40 hover:bg-green-900/60 border-green-500/30 hover:border-green-400 cursor-pointer scale-100 hover:scale-[1.02]' 
                    : 'bg-zinc-900/20 border-zinc-900/30 opacity-50 cursor-not-allowed'}
            `}
        >
            <div className="text-[9px] font-mono text-green-500/60 mb-1">
                EFFECT_INSTANCE_{index.toString().padStart(2, '0')}
            </div>
            <div className="text-sm font-black text-green-50 uppercase tracking-wider flex justify-between items-center">
                {effect.type}
                {(effect as any).amount && (
                    <span className="bg-green-500/20 px-1.5 rounded text-[10px] text-green-300">
                        x{(effect as any).amount}
                    </span>
                )}
            </div>
        </button>
    );
};
