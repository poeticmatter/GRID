import { useMemo } from 'react';

export interface CityBackgroundProps {
    nodeCoords: Record<string, { x: number, y: number }>;
}

export const CityBackground = ({ nodeCoords }: CityBackgroundProps) => {
    const buildings = useMemo(() => {
        const b: { type: string, left: number, width: number, height: number, color: string, border?: string }[] = [];

        // Use a simple seeded random to avoid rendering flicker
        let seed = 1234;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        // Background filler buildings
        for (let i = 0; i < 50; i++) {
            b.push({
                type: 'filler',
                left: i * 2 + random() * 2,
                width: 2 + random() * 4,
                height: 5 + random() * 70,
                color: random() > 0.5 ? '#18181b' : '#27272a', // alternate zincs
                border: '1px solid #3f3f46', // zinc-700 outline
            });
        }

        // Prominent buildings under nodes
        Object.values(nodeCoords).forEach(coord => {
            // Sub towers around the main node
            b.push({
                type: 'sub-tower',
                left: coord.x - (1 + random() * 2),
                width: 1 + random() * 2,
                height: 100 - coord.y - (5 + random() * 10),
                color: '#09090b',
                border: '1px solid #27272a', // muted gray/green
            });
            b.push({
                type: 'sub-tower',
                left: coord.x + (1 + random() * 2),
                width: 1 + random() * 2,
                height: 100 - coord.y - (5 + random() * 10),
                color: '#09090b',
                border: '1px solid #27272a', // muted gray/green
            });

            // Main tower aligning from the bottom up to the node
            b.push({
                type: 'tower',
                left: coord.x, // Center x
                width: 3 + random() * 3,
                height: 100 - coord.y + (3 + random() * 5), // Extends slightly past node
                color: '#09090b', // block out background
                border: '1px solid #064e3b', // muted dark CRT green
            });
        });

        return b;
    }, [nodeCoords]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-neutral-950">
            {/* Background haze */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-20" />

            {buildings.map((b, i) => {
                return (
                    <div
                        key={`b-${i}`}
                        className="absolute bottom-0 rounded-t-sm"
                        style={{
                            left: b.type === 'filler' ? `${b.left}%` : `calc(${b.left}% - ${b.width / 2}%)`,
                            width: `${b.width}%`,
                            height: `${b.height}%`,
                            backgroundColor: b.color,
                            border: b.border || undefined,
                        }}
                    />
                );
            })}

            {/* Ground line & bottom fade texturing (using solid gradients) */}
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-neutral-950 to-transparent" />
            <div className="absolute bottom-6 w-full h-[1px] bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
        </div>
    );
};
