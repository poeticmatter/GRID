import { forwardRef } from 'react';

/** Memory · Variation 2 — IC Chip
 * Square chip body with side pins and inner cross. Lucide-style. */
const IconMemory2 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Chip body */}
        <rect x="6" y="6" width="12" height="12" />
        {/* Pin 1 notch indicator */}
        <circle cx="7.5" cy="7.5" r="1" />
        {/* Left pins */}
        <line x1="2" y1="9"  x2="6" y2="9"  />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="2" y1="15" x2="6" y2="15" />
        {/* Right pins */}
        <line x1="18" y1="9"  x2="22" y2="9"  />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="18" y1="15" x2="22" y2="15" />
        {/* Inner cross (die pattern) */}
        <line x1="9"  y1="12" x2="15" y2="12" />
        <line x1="12" y1="9"  x2="12" y2="15" />
    </svg>
));

IconMemory2.displayName = 'IconMemory2';
export default IconMemory2;
