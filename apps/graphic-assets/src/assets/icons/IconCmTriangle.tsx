import { forwardRef } from 'react';

/** Countermeasure shape — Node Triangle
 * Equilateral triangle with large circle nodes at each vertex. */
const IconCmTriangle = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-tri-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-tri-glow)">
            {/* Triangle edges */}
            <polygon points="12,3 21.5,20 2.5,20" />
            {/* Vertex circles */}
            <circle cx="12"  cy="3"  r="2.5" fill="currentColor" stroke="none" />
            <circle cx="21.5" cy="20" r="2.5" fill="currentColor" stroke="none" />
            <circle cx="2.5"  cy="20" r="2.5" fill="currentColor" stroke="none" />
        </g>
    </svg>
));

IconCmTriangle.displayName = 'IconCmTriangle';
export default IconCmTriangle;
