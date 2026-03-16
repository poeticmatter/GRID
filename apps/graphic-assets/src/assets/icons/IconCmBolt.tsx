import { forwardRef } from 'react';

/** Countermeasure shape — Hex Bolt
 * Hexagon frame with a chunky zigzag bolt through the center. */
const IconCmBolt = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-bolt-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-bolt-glow)">
            {/* Hexagon */}
            <polygon points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" />
            {/* Lightning bolt inside */}
            <polyline points="14,5 9,13 13,13 10,19" strokeWidth="2" />
        </g>
    </svg>
));

IconCmBolt.displayName = 'IconCmBolt';
export default IconCmBolt;
