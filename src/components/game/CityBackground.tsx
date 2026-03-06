import { useMemo } from 'react';

export interface CityBackgroundProps {
    nodeCoords: Record<string, { x: number, y: number }>;
}

export const CityBackground = ({ nodeCoords }: CityBackgroundProps) => {
    const buildings = useMemo(() => {
        const b = [];

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
                color: random() > 0.5 ? '#1e293b' : '#0f172a', // slate-800 or slate-900
                opacity: 0.1 + random() * 0.4
            });
        }

        // Prominent buildings under nodes
        Object.values(nodeCoords).forEach(coord => {
            // Main tower aligning from the bottom up to the node
            b.push({
                type: 'tower',
                left: coord.x, // Center x
                width: 3 + random() * 3,
                height: 100 - coord.y + (3 + random() * 5), // Extends slightly past node
                color: '#083344', // cyan-950
                border: '1px solid rgba(6, 182, 212, 0.1)', // cyan-500/10
                opacity: 0.4 + random() * 0.4
            });

            // Sub towers around the main node
            b.push({
                type: 'sub-tower',
                left: coord.x - (1 + random() * 2),
                width: 1 + random() * 2,
                height: 100 - coord.y - (5 + random() * 10),
                color: '#164e63', // cyan-900
                opacity: 0.3
            });
            b.push({
                type: 'sub-tower',
                left: coord.x + (1 + random() * 2),
                width: 1 + random() * 2,
                height: 100 - coord.y - (5 + random() * 10),
                color: '#164e63', // cyan-900
                opacity: 0.3
            });
        });

        // Add some horizontal walkways/neon lines
        for (let i = 0; i < 20; i++) {
            b.push({
                type: 'walkway',
                left: random() * 80,
                width: 5 + random() * 25,
                bottom: 10 + random() * 80, // y position from bottom
                height: 0.1 + random() * 0.2,
                color: 'rgba(34, 211, 238, 0.1)', // cyan-400
                opacity: 0.5 + random() * 0.5
            });
        }

        return b;
    }, [nodeCoords]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-slate-950">
            {/* Background haze */}
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/10 to-transparent" />

            {buildings.map((b, i) => {
                if (b.type === 'walkway') {
                    return (
                        <div
                            key={`b-${i}`}
                            className="absolute"
                            style={{
                                left: `${b.left}%`,
                                width: `${b.width}%`,
                                bottom: `${b.bottom}%`,
                                height: `${b.height}%`,
                                backgroundColor: b.color,
                                opacity: b.opacity,
                                boxShadow: `0 0 5px ${b.color}`
                            }}
                        />
                    );
                }

                return (
                    <div
                        key={`b-${i}`}
                        className="absolute bottom-0 rounded-t-sm"
                        style={{
                            left: b.type === 'filler' ? `${b.left}%` : `calc(${b.left}% - ${b.width / 2}%)`,
                            width: `${b.width}%`,
                            height: `${b.height}%`,
                            backgroundColor: b.color,
                            opacity: b.opacity,
                            border: b.border || undefined,
                        }}
                    />
                );
            })}

            {/* Ground line & bottom fade */}
            <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute bottom-6 w-full h-[1px] bg-cyan-900/30" />
        </div>
    );
};
