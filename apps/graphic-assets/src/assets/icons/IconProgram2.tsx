import { forwardRef } from 'react';

/** Program · Variation 2 — Code File
 * Document with folded corner and indented code lines. */
const IconProgram2 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Page outline with folded corner */}
        <path d="M4,2 L15,2 L20,7 L20,22 L4,22 Z" />
        {/* Fold crease */}
        <polyline points="15,2 15,7 20,7" />
        {/* Code lines (varying indent = syntax feel) */}
        <line x1="7"  y1="11" x2="17" y2="11" />
        <line x1="9"  y1="14" x2="15" y2="14" />
        <line x1="7"  y1="17" x2="16" y2="17" />
        <line x1="9"  y1="20" x2="13" y2="20" />
    </svg>
));

IconProgram2.displayName = 'IconProgram2';
export default IconProgram2;
