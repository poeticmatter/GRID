import { useRef } from 'react';
import { downloadSvg } from '../utils/exportSvg';

interface AssetCardProps {
    label: string;
    description: string;
    filename: string;
    children: (ref: React.RefObject<SVGSVGElement | null>) => React.ReactNode;
    previewBg?: string;
}

export function AssetCard({ label, description, filename, children, previewBg = '#050505' }: AssetCardProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    const handleExport = () => {
        if (svgRef.current) {
            downloadSvg(svgRef.current, filename);
        }
    };

    return (
        <div style={{
            background: '#0c0c0c',
            border: '1px solid #1f2f1f',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Preview area */}
            <div style={{
                background: previewBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                minHeight: '160px',
                borderBottom: '1px solid #1a2a1a',
            }}>
                {children(svgRef)}
            </div>

            {/* Meta + export */}
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#e4e4e7', marginBottom: '2px' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace' }}>
                        {description}
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    style={{
                        padding: '7px 16px',
                        background: 'transparent',
                        border: '1px solid #22c55e',
                        borderRadius: '5px',
                        color: '#22c55e',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#22c55e22';
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                >
                    EXPORT SVG
                </button>
            </div>
        </div>
    );
}
