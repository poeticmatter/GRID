import { forwardRef } from 'react';

/** Trace · Variation 1 — Radar Sweep
 * Concentric rings, crosshair ticks, and a sweep line with ping dot. */
const IconTrace1 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Outer ring */}
        <circle cx="12" cy="12" r="10" />
        {/* Inner ring */}
        <circle cx="12" cy="12" r="5" />
        {/* Crosshair ticks (outer only) */}
        <line x1="12" y1="2"  x2="12" y2="5"  />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2"  y1="12" x2="5"  y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        {/* Sweep line */}
        <line x1="12" y1="12" x2="20" y2="4" />
        {/* Ping dot on sweep */}
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        {/* Center dot */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
));

IconTrace1.displayName = 'IconTrace1';
export default IconTrace1;
