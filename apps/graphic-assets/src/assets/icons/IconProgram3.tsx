import { forwardRef } from 'react';

/** Program · Variation 3 — Executable
 * IC chip body with a play-triangle inside — run/execute. */
const IconProgram3 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Chip body */}
        <rect x="4" y="4" width="16" height="16" />
        {/* Side pins */}
        <line x1="1"  y1="8"  x2="4"  y2="8"  />
        <line x1="1"  y1="12" x2="4"  y2="12" />
        <line x1="1"  y1="16" x2="4"  y2="16" />
        <line x1="20" y1="8"  x2="23" y2="8"  />
        <line x1="20" y1="12" x2="23" y2="12" />
        <line x1="20" y1="16" x2="23" y2="16" />
        {/* Play triangle inside */}
        <polygon points="9,8 9,16 17,12" />
    </svg>
));

IconProgram3.displayName = 'IconProgram3';
export default IconProgram3;
