import { forwardRef } from 'react';

/** Countermeasure shape — Node Diamond
 * Rotated square (diamond) with circle nodes at the 4 cardinal points. */
const IconCmDiamond = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-diamond-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-diamond-glow)">
            {/* Diamond */}
            <polygon points="12,2 22,12 12,22 2,12" />
            {/* Vertex circles */}
            <circle cx="12" cy="2"  r="2.2" fill="currentColor" stroke="none" />
            <circle cx="22" cy="12" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="22" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="2"  cy="12" r="2.2" fill="currentColor" stroke="none" />
        </g>
    </svg>
));

IconCmDiamond.displayName = 'IconCmDiamond';
export default IconCmDiamond;
