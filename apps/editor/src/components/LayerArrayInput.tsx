import { useState, useEffect } from 'react';

export function LayerArrayInput({ value, onChange }: { value: number[], onChange: (val: number[]) => void }) {
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
