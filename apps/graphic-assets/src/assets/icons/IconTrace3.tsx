import { forwardRef } from 'react';

/** Trace · Variation 3 — Targeting Reticle
 * Corner-bracket crosshair with center gap and pip. */
const IconTrace3 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Corner brackets */}
        <polyline points="2,7  2,2  7,2"  />
        <polyline points="17,2 22,2 22,7" />
        <polyline points="2,17 2,22 7,22" />
        <polyline points="17,22 22,22 22,17" />
        {/* Crosshair with center gap */}
        <line x1="12" y1="2"  x2="12" y2="9.5" />
        <line x1="12" y1="14.5" x2="12" y2="22" />
        <line x1="2"  y1="12" x2="9.5"  y2="12" />
        <line x1="14.5" y1="12" x2="22" y2="12" />
        {/* Center pip */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
));

IconTrace3.displayName = 'IconTrace3';
export default IconTrace3;
