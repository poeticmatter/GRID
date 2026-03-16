import { forwardRef } from 'react';

/** Countermeasure shape — Triple Orbit
 * Three orbital ellipses at 60° intervals around a central dot. */
const IconCmOrbit = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="square" strokeLinejoin="miter">
        <defs>
            <filter id="cm-orbit-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
        </defs>
        <g filter="url(#cm-orbit-glow)">
            <ellipse cx="12" cy="12" rx="10" ry="3.5" />
            <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="3.5" transform="rotate(120 12 12)" />
            <circle  cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
        </g>
    </svg>
));

IconCmOrbit.displayName = 'IconCmOrbit';
export default IconCmOrbit;
