import { forwardRef } from 'react';

/** Trace · Variation 2 — PCB Route
 * Angular Z-shaped circuit trace with solder nodes. */
const IconTrace2 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Z-route trace */}
        <polyline points="3,19 3,8 12,8 12,16 21,16" />
        {/* Solder nodes at each corner */}
        <circle cx="3"  cy="19" r="2" />
        <circle cx="3"  cy="8"  r="2" />
        <circle cx="12" cy="8"  r="2" />
        <circle cx="12" cy="16" r="2" />
        <circle cx="21" cy="16" r="2" />
    </svg>
));

IconTrace2.displayName = 'IconTrace2';
export default IconTrace2;
