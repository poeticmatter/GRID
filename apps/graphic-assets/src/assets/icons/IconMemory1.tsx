import { forwardRef } from 'react';

/** Memory · Variation 1 — RAM Module
 * Horizontal memory stick with chips and edge-connector pins. Lucide-style. */
const IconMemory1 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Board body */}
        <rect x="1.5" y="7" width="21" height="8" />
        {/* Memory chips (3) */}
        <rect x="3.5" y="8.5" width="3" height="5" />
        <rect x="10.5" y="8.5" width="3" height="5" />
        <rect x="17" y="8.5" width="3" height="5" />
        {/* Connector pins — left group */}
        <line x1="3.5" y1="15" x2="3.5" y2="19" />
        <line x1="5"   y1="15" x2="5"   y2="19" />
        <line x1="6.5" y1="15" x2="6.5" y2="19" />
        <line x1="8"   y1="15" x2="8"   y2="19" />
        {/* Connector pins — right group */}
        <line x1="15.5" y1="15" x2="15.5" y2="19" />
        <line x1="17"   y1="15" x2="17"   y2="19" />
        <line x1="18.5" y1="15" x2="18.5" y2="19" />
        <line x1="20"   y1="15" x2="20"   y2="19" />
        {/* Notch key */}
        <polyline points="10,19 10,21.5 14,21.5 14,19" />
    </svg>
));

IconMemory1.displayName = 'IconMemory1';
export default IconMemory1;
