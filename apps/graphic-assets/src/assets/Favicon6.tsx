import { forwardRef } from 'react';

/**
 * Favicon 6 — "Signal Matrix"
 * A 4×4 mini game-board. A diagonal trace run is highlighted across cells.
 * No outer border — the grid *is* the icon. Corner tick marks anchor it.
 */
const Favicon6 = forwardRef<SVGSVGElement>((_, ref) => {
    // 4×4 grid: cell=5px, gap=1px → step=6, total=27...
    // Recalc: 4*5 + 3*1 = 23, start=(32-23)/2=4.5
    const cs = 5;
    const step = 6;
    const s = 4.5;

    // Diagonal run snaking down-right: [0,0],[1,0],[1,1],[2,1],[2,2],[3,2]
    const run = new Set(['0,0', '1,0', '1,1', '2,1', '2,2', '3,2']);
    // Active cell (cursor) — brightest
    const active = '2,2';

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
            shapeRendering="crispEdges"
        >
            <defs>
                <filter id="f6-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background */}
            <rect width="32" height="32" fill="#050505" />

            {/* Grid cells */}
            {Array.from({ length: 4 }, (_, r) =>
                Array.from({ length: 4 }, (_, c) => {
                    const key = `${r},${c}`;
                    const isRun = run.has(key);
                    const isActive = key === active;
                    return (
                        <rect
                            key={key}
                            x={s + c * step} y={s + r * step}
                            width={cs} height={cs}
                            fill={isActive ? '#4ade80' : isRun ? '#22c55e' : '#0a180a'}
                            opacity={isRun ? 1 : 0.5}
                            filter={isRun ? 'url(#f6-glow)' : undefined}
                        />
                    );
                })
            )}

            {/* Corner tick marks */}
            <g stroke="#22c55e" strokeWidth="0.6" opacity="0.4" fill="none">
                <path d="M2 2 L5 2 M2 2 L2 5" />
                <path d="M30 2 L27 2 M30 2 L30 5" />
                <path d="M2 30 L5 30 M2 30 L2 27" />
                <path d="M30 30 L27 30 M30 30 L30 27" />
            </g>
        </svg>
    );
});

Favicon6.displayName = 'Favicon6';
export default Favicon6;
