import { forwardRef } from 'react';

/** Memory · Variation 3 — Data Layers
 * Three stacked storage slabs with bus connectors. Lucide-style. */
const IconMemory3 = forwardRef<SVGSVGElement>((_, ref) => (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" width="24" height="24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* Three stacked layers */}
        <rect x="2" y="3"  width="20" height="4" />
        <rect x="2" y="10" width="20" height="4" />
        <rect x="2" y="17" width="20" height="4" />
        {/* Vertical bus lines between layers */}
        <line x1="6"  y1="7"  x2="6"  y2="10" />
        <line x1="12" y1="7"  x2="12" y2="10" />
        <line x1="18" y1="7"  x2="18" y2="10" />
        <line x1="6"  y1="14" x2="6"  y2="17" />
        <line x1="12" y1="14" x2="12" y2="17" />
        <line x1="18" y1="14" x2="18" y2="17" />
        {/* Layer labels (short tick marks) */}
        <line x1="4" y1="5"  x2="7"  y2="5"  />
        <line x1="4" y1="12" x2="7"  y2="12" />
        <line x1="4" y1="19" x2="7"  y2="19" />
    </svg>
));

IconMemory3.displayName = 'IconMemory3';
export default IconMemory3;
