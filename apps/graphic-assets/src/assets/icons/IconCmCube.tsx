import { forwardRef } from 'react';

/** Countermeasure shape — Isometric Cube
 * Transparent hex-outline cube with dot nodes at all 7 visible vertices. */
const IconCmCube = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-cube-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-cube-glow)">
            {/* Outer hexagon */}
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
            {/* Three inner edges from front-center vertex */}
            <line x1="12" y1="12" x2="12" y2="2"  />
            <line x1="12" y1="12" x2="21" y2="7"  />
            <line x1="12" y1="12" x2="3"  y2="7"  />
            {/* Vertex dots */}
            <circle cx="12" cy="2"  r="1.8" fill="currentColor" stroke="none" />
            <circle cx="21" cy="7"  r="1.8" fill="currentColor" stroke="none" />
            <circle cx="21" cy="17" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="22" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="3"  cy="17" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="3"  cy="7"  r="1.8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
        </g>
    </svg>
));

IconCmCube.displayName = 'IconCmCube';
export default IconCmCube;
