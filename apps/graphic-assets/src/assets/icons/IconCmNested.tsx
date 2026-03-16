import { forwardRef } from 'react';

/** Countermeasure shape — Nested Squares
 * Three concentric squares — like a signal target or data frame. */
const IconCmNested = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-nested-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-nested-glow)">
            <rect x="2"  y="2"  width="20" height="20" />
            <rect x="6"  y="6"  width="12" height="12" />
            <rect x="10" y="10" width="4"  height="4"  />
        </g>
    </svg>
));

IconCmNested.displayName = 'IconCmNested';
export default IconCmNested;
