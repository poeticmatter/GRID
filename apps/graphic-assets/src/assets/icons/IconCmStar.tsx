import { forwardRef } from 'react';

/** Countermeasure shape — Six-Arm Asterisk
 * Six lines radiating at 60° intervals with filled dot tips. */
const IconCmStar = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-star-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-star-glow)">
            {/* 6 arms at 60° intervals (vertices of a hexagon from center) */}
            <line x1="12" y1="12" x2="12" y2="2"  />
            <line x1="12" y1="12" x2="21" y2="7"  />
            <line x1="12" y1="12" x2="21" y2="17" />
            <line x1="12" y1="12" x2="12" y2="22" />
            <line x1="12" y1="12" x2="3"  y2="17" />
            <line x1="12" y1="12" x2="3"  y2="7"  />
            {/* Tip dots */}
            <circle cx="12" cy="2"  r="1.8" fill="currentColor" stroke="none" />
            <circle cx="21" cy="7"  r="1.8" fill="currentColor" stroke="none" />
            <circle cx="21" cy="17" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="12" cy="22" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="3"  cy="17" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="3"  cy="7"  r="1.8" fill="currentColor" stroke="none" />
            {/* Center */}
            <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </g>
    </svg>
));

IconCmStar.displayName = 'IconCmStar';
export default IconCmStar;
