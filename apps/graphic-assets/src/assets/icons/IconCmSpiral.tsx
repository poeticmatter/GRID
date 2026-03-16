import { forwardRef } from 'react';

/** Countermeasure shape — Rectangular Spiral
 * Angular inward-winding path — data labyrinth / recursive loop. */
const IconCmSpiral = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-spiral-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-spiral-glow)">
            {/* Inward rectangular spiral — 3 revolutions */}
            <path d="
                M 2,12
                L 2,2   L 22,2  L 22,22 L 2,22
                L 2,6   L 18,6  L 18,18 L 6,18
                L 6,10  L 14,10 L 14,14 L 10,14
            " />
        </g>
    </svg>
));

IconCmSpiral.displayName = 'IconCmSpiral';
export default IconCmSpiral;
