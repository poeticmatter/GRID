import { forwardRef } from 'react';

/** Countermeasure shape — Cross
 * Hollow polygon cross with dot terminals at the four arm ends. */
const IconCmCross = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-cross-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-cross-glow)">
            {/* Cross polygon outline */}
            <polygon points="9,2 15,2 15,9 22,9 22,15 15,15 15,22 9,22 9,15 2,15 2,9 9,9" />
            {/* Arm-end dots */}
            <circle cx="12" cy="2"  r="1.8" fill="currentColor" stroke="none" />
            <circle cx="22" cy="12" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="22" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="2"  cy="12" r="1.8" fill="currentColor" stroke="none" />
        </g>
    </svg>
));

IconCmCross.displayName = 'IconCmCross';
export default IconCmCross;
