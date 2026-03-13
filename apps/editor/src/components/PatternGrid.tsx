import { Coordinate } from '@grid/shared';
import clsx from 'clsx';

interface PatternGridProps {
    pattern: Coordinate[];
    onChange: (newPattern: Coordinate[]) => void;
}

export const PatternGrid = ({ pattern, onChange }: PatternGridProps) => {
    // 5x5 grid, centered at 0,0 (range -2 to 2)
    const range = [-2, -1, 0, 1, 2];

    const toggleCell = (x: number, y: number) => {
        const index = pattern.findIndex(p => p.x === x && p.y === y);
        if (index >= 0) {
            onChange(pattern.filter((_, i) => i !== index));
        } else {
            onChange([...pattern, { x, y }]);
        }
    };

    const isSelected = (x: number, y: number) => {
        return pattern.some(p => p.x === x && p.y === y);
    };

    return (
        <div className="flex flex-col gap-1 p-4 bg-slate-800 rounded-lg border border-slate-700 w-fit">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">CUT Pattern (5x5)</h3>
            {range.map(y => (
                <div key={y} className="flex gap-1">
                    {range.map(x => (
                        <button
                            key={`${x},${y}`}
                            onClick={() => toggleCell(x, y)}
                            className={clsx(
                                "w-10 h-10 rounded border transition-all duration-200",
                                isSelected(x, y) 
                                    ? "bg-cyan-500 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                                    : "bg-slate-900 border-slate-700 hover:border-slate-500",
                                x === 0 && y === 0 && !isSelected(x, y) && "border-dashed border-slate-500"
                            )}
                        >
                            {x === 0 && y === 0 && <div className="w-1 h-1 bg-slate-500 rounded-full mx-auto" />}
                        </button>
                    ))}
                </div>
            ))}
            <div className="mt-2 text-[10px] text-slate-500 text-center italic">
                Center dot is origin (0,0)
            </div>
        </div>
    );
};
