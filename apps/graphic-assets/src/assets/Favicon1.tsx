import { forwardRef } from 'react';

/**
 * Favicon 1 — "Signal Trace"
 * A stylised G drawn as a PCB circuit trace with solder-point nodes.
 * Black background, vivid green, subtle grid.
 */
const Favicon1 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="32"
        height="32"
        shapeRendering="crispEdges"
    >
        <defs>
            <filter id="f1-glow" x="-50%" y="-50%" width="200%" height="200%">
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

        {/* Circuit trace — G shape */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Dim ghost layer for depth */}
            <path
                d="M19 6 L10 6 Q6 6 6 10 L6 22 Q6 26 10 26 L22 26 L22 16 L15 16"
                stroke="#0d3318"
                strokeWidth="2"
            />
            {/* Main trace */}
            <path
                d="M19 6 L10 6 Q6 6 6 10 L6 22 Q6 26 10 26 L22 26 L22 16 L15 16"
                stroke="#22c55e"
                strokeWidth="1.5"
                filter="url(#f1-glow)"
            />
        </g>

        {/* Solder nodes */}
        <g fill="#22c55e" filter="url(#f1-glow)">
            <circle cx="19" cy="6"  r="1.8" />
            <circle cx="6"  cy="16" r="1.8" />
            <circle cx="22" cy="26" r="1.8" />
            <circle cx="15" cy="16" r="1.8" />
        </g>

        {/* Corner tick marks */}
        <g stroke="#22c55e" strokeWidth="0.6" opacity="0.4">
            <path d="M2 2 L6 2 M2 2 L2 6" />
            <path d="M30 2 L26 2 M30 2 L30 6" />
            <path d="M2 30 L6 30 M2 30 L2 26" />
            <path d="M30 30 L26 30 M30 30 L30 26" />
        </g>
    </svg>
));

Favicon1.displayName = 'Favicon1';
export default Favicon1;
