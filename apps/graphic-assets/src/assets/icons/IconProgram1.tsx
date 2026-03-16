import { forwardRef } from 'react';

/** Program · Variation 1 — Terminal
 * Monitor frame with chevron prompt and cursor. */
const IconProgram1 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Screen frame */}
        <rect x="2" y="3" width="20" height="15" />
        {/* Status bar divider */}
        <line x1="2" y1="15" x2="22" y2="15" />
        {/* Chevron prompt ">" */}
        <line x1="5" y1="7.5" x2="8.5" y2="10.5" />
        <line x1="8.5" y1="10.5" x2="5" y2="13.5" />
        {/* Cursor */}
        <line x1="10" y1="10.5" x2="14" y2="10.5" />
        {/* Stand */}
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="8"  y1="21" x2="16" y2="21" />
    </svg>
));

IconProgram1.displayName = 'IconProgram1';
export default IconProgram1;
