import { forwardRef } from 'react';

/**
 * Favicon 3 — "Sector Lock"
 * Three concentric squares with corner bracket marks and a crosshair.
 * Minimal, bold, recognisable at 16×16.
 */
const Favicon3 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="32"
        height="32"
        shapeRendering="crispEdges"
    >
        <defs>
            <filter id="f3-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="0.9" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>

        {/* Background */}
        <rect width="32" height="32" fill="#050505" />

        {/* Outermost ring — dim */}
        <rect x="2"  y="2"  width="28" height="28" fill="none" stroke="#0f2e0f" strokeWidth="1" />

        {/* Middle ring */}
        <rect x="6"  y="6"  width="20" height="20" fill="none" stroke="#166534" strokeWidth="1" />

        {/* Inner ring — bright */}
        <rect x="10" y="10" width="12" height="12" fill="#091409" stroke="#22c55e" strokeWidth="1.2" filter="url(#f3-glow)" />

        {/* Crosshair */}
        <g stroke="#22c55e" strokeWidth="0.8" filter="url(#f3-glow)">
            <line x1="16" y1="3"  x2="16" y2="10" />
            <line x1="16" y1="22" x2="16" y2="29" />
            <line x1="3"  y1="16" x2="10" y2="16" />
            <line x1="22" y1="16" x2="29" y2="16" />
        </g>

        {/* Corner brackets on outer ring */}
        <g stroke="#22c55e" strokeWidth="1" strokeLinecap="square" opacity="0.7">
            <path d="M2 7  L2 2  L7 2"  fill="none" />
            <path d="M25 2 L30 2 L30 7" fill="none" />
            <path d="M2 25 L2 30 L7 30" fill="none" />
            <path d="M30 25 L30 30 L25 30" fill="none" />
        </g>

        {/* Center pixel */}
        <rect x="15" y="15" width="2" height="2" fill="#4ade80" filter="url(#f3-glow)" />
    </svg>
));

Favicon3.displayName = 'Favicon3';
export default Favicon3;
