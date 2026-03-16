import { forwardRef } from 'react';

/** Countermeasure shape — Triple Chevrons
 * Three stacked right-facing chevrons — speed/execute feel. */
const IconCmChevron = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-chevron-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-chevron-glow)">
            <polyline points="4,4  10,12 4,20"  />
            <polyline points="10,4 16,12 10,20" />
            <polyline points="16,4 22,12 16,20" />
        </g>
    </svg>
));

IconCmChevron.displayName = 'IconCmChevron';
export default IconCmChevron;
