import { forwardRef } from 'react';

/**
 * Favicon 5 — "Grid Square"
 * Favicon2's inner-cell-grid concept but inside a square frame with corner
 * brackets — no hex. 3×3 cells in a checker pattern, center cell brightest.
 * Directly represents the game board.
 */
const Favicon5 = forwardRef<SVGSVGElement>((_, ref) => {
    // 3×3 grid: cell=6px, gap=1px → step=7, total=20, start=6
    const cs = 6;
    const step = 7;
    const s = 6;

    // lit: corners + center (checker); center is brightest
    const bright = new Set(['1,1']);
    const lit = new Set(['0,0', '0,2', '1,1', '2,0', '2,2']);

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
        >
            <defs>
                <filter id="f5-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="1" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Background */}
            <rect width="32" height="32" fill="#050505" />

            {/* Outer square fill */}
            <rect x="2" y="2" width="28" height="28" fill="#060e06" />

            {/* Grid cells */}
            {Array.from({ length: 3 }, (_, r) =>
                Array.from({ length: 3 }, (_, c) => {
                    const key = `${r},${c}`;
                    const isLit = lit.has(key);
                    const isBright = bright.has(key);
                    return (
                        <rect
                            key={key}
                            x={s + c * step} y={s + r * step}
                            width={cs} height={cs}
                            fill={isBright ? '#4ade80' : isLit ? '#22c55e' : '#0d2210'}
                            opacity={isLit ? 1 : 0.7}
                            filter={isLit ? 'url(#f5-glow)' : undefined}
                        />
                    );
                })
            )}

            {/* Corner bracket frame */}
            <g stroke="#22c55e" strokeWidth="1" strokeLinecap="square" fill="none" opacity="0.6">
                <path d="M2 7  L2 2  L7 2" />
                <path d="M25 2 L30 2 L30 7" />
                <path d="M2 25 L2 30 L7 30" />
                <path d="M30 25 L30 30 L25 30" />
            </g>
        </svg>
    );
});

Favicon5.displayName = 'Favicon5';
export default Favicon5;
