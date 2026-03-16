import { forwardRef } from 'react';

/**
 * Favicon 4 — "Trace Run"
 * Favicon1's PCB circuit aesthetic (traces, solder nodes, corner ticks, glow)
 * but the shape is an L-run across a 3×3 cell grid — no letter G.
 * Directly evokes the game's RUN mechanic.
 */
const Favicon4 = forwardRef<SVGSVGElement>((_, ref) => {
    // 3×3 grid: cell=7px, gap=1px → step=8, total=23, start=4.5
    const cs = 7;
    const step = 8;
    const s = 4.5;
    const cx = (c: number) => s + c * step + cs / 2; // col center: 8, 16, 24
    const cy = (r: number) => s + r * step + cs / 2; // row center: 8, 16, 24

    // L-run: top row (r=0, c=0..2) then right column (r=1..2, c=2)
    const litSet = new Set(['0,0', '0,1', '0,2', '1,2', '2,2']);
    const tracePts = `${cx(0)},${cy(0)} ${cx(1)},${cy(0)} ${cx(2)},${cy(0)} ${cx(2)},${cy(1)} ${cx(2)},${cy(2)}`;

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
                <filter id="f4-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Background */}
            <rect width="32" height="32" fill="#050505" />

            {/* Subtle grid */}
            <g stroke="#0d1f0d" strokeWidth="0.4" fill="none">
                {[8, 16, 24].map(x => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="32" />)}
                {[8, 16, 24].map(y => <line key={`h${y}`} x1="0" y1={y} x2="32" y2={y} />)}
            </g>

            {/* Grid cells — dim base */}
            {Array.from({ length: 3 }, (_, r) =>
                Array.from({ length: 3 }, (_, c) => (
                    <rect
                        key={`${r},${c}`}
                        x={s + c * step} y={s + r * step}
                        width={cs} height={cs}
                        fill={litSet.has(`${r},${c}`) ? '#0f2a15' : '#080f08'}
                    />
                ))
            )}

            {/* Ghost trace layer for depth */}
            <polyline
                points={tracePts}
                fill="none" stroke="#0d3318" strokeWidth="2.2"
                strokeLinejoin="round" strokeLinecap="round"
            />
            {/* Main circuit trace */}
            <polyline
                points={tracePts}
                fill="none" stroke="#22c55e" strokeWidth="1.5"
                strokeLinejoin="round" strokeLinecap="round"
                filter="url(#f4-glow)"
            />

            {/* Solder nodes at trace endpoints */}
            {[{ c: 0, r: 0 }, { c: 2, r: 0 }, { c: 2, r: 2 }].map(({ c, r }) => (
                <circle key={`n${r},${c}`}
                    cx={cx(c)} cy={cy(r)} r="1.8"
                    fill="#22c55e" filter="url(#f4-glow)"
                />
            ))}

            {/* Corner tick marks */}
            <g stroke="#22c55e" strokeWidth="0.6" opacity="0.4">
                <path d="M2 2 L6 2 M2 2 L2 6" fill="none" />
                <path d="M30 2 L26 2 M30 2 L30 6" fill="none" />
                <path d="M2 30 L6 30 M2 30 L2 26" fill="none" />
                <path d="M30 30 L26 30 M30 30 L30 26" fill="none" />
            </g>
        </svg>
    );
});

Favicon4.displayName = 'Favicon4';
export default Favicon4;
