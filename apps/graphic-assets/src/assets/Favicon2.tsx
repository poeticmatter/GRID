import { forwardRef } from 'react';

/**
 * Favicon 2 — "Hex Node"
 * A hexagonal border containing a 3×3 cell grid.
 * Six cells are lit in a pattern suggesting a network node.
 */
const Favicon2 = forwardRef<SVGSVGElement>((_, ref) => {
    // Hexagon path centered at 16,16 with radius 13
    const HEX_R = 13.5;
    const cx = 16, cy = 16;
    const hexPts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30);
        return `${(cx + HEX_R * Math.cos(a)).toFixed(2)},${(cy + HEX_R * Math.sin(a)).toFixed(2)}`;
    }).join(' ');

    // 3x3 inner grid — which cells are lit
    const lit = [0, 2, 4, 6, 8]; // corners + center
    const cellSize = 5;
    const gridOff = { x: cx - cellSize * 1.5, y: cy - cellSize * 1.5 };

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
        >
            <defs>
                <filter id="f2-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="1" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <clipPath id="f2-hex-clip">
                    <polygon points={hexPts} />
                </clipPath>
            </defs>

            {/* Background */}
            <rect width="32" height="32" fill="#050505" />

            {/* Hex fill */}
            <polygon points={hexPts} fill="#0a1a0a" />

            {/* Inner grid cells */}
            {Array.from({ length: 9 }, (_, i) => {
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = gridOff.x + col * (cellSize + 0.5);
                const y = gridOff.y + row * (cellSize + 0.5);
                const isLit = lit.includes(i);
                return (
                    <rect
                        key={i}
                        x={x} y={y}
                        width={cellSize} height={cellSize}
                        fill={isLit ? '#22c55e' : '#0d2210'}
                        opacity={isLit ? 1 : 0.6}
                        rx="0.5"
                        filter={isLit ? 'url(#f2-glow)' : undefined}
                        clipPath="url(#f2-hex-clip)"
                    />
                );
            })}

            {/* Center bright node */}
            <circle cx={cx} cy={cy} r="2" fill="#4ade80" filter="url(#f2-glow)" />

            {/* Hex border */}
            <polygon
                points={hexPts}
                fill="none"
                stroke="#22c55e"
                strokeWidth="1.2"
                filter="url(#f2-glow)"
            />
        </svg>
    );
});

Favicon2.displayName = 'Favicon2';
export default Favicon2;
