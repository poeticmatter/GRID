import { AssetCard } from '../components/AssetCard';
import Favicon1 from '../assets/Favicon1';
import Favicon2 from '../assets/Favicon2';
import Favicon3 from '../assets/Favicon3';

const FAVICONS = [
    {
        label: 'Signal Trace',
        description: 'Circuit PCB trace forming a G — 32×32',
        filename: 'grid-favicon-signal-trace.svg',
        Component: Favicon1,
        note: 'Organic circuit aesthetic, detailed at all sizes',
    },
    {
        label: 'Hex Node',
        description: 'Hexagonal cell grid with node pattern — 32×32',
        filename: 'grid-favicon-hex-node.svg',
        Component: Favicon2,
        note: 'Geometric / honeycomb, distinct silhouette',
    },
    {
        label: 'Sector Lock',
        description: 'Concentric squares with crosshair — 32×32',
        filename: 'grid-favicon-sector-lock.svg',
        Component: Favicon3,
        note: 'Ultra-minimal, reads perfectly at 16×16',
    },
];

export function FaviconTab() {
    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.12em', marginBottom: '6px' }}>
                    FAVICON VARIANTS
                </h2>
                <p style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace', lineHeight: 1.6 }}>
                    Three designs displayed at 4× (128px) — all export as 32×32 SVG.
                    Fonts are system monospace; no internet required.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {FAVICONS.map(({ label, description, filename, Component, note }) => (
                    <AssetCard key={label} label={label} description={description} filename={filename}>
                        {(ref) => (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                {/* 4× preview */}
                                <div style={{ width: 128, height: 128, imageRendering: 'pixelated' }}>
                                    <Component
                                        ref={ref}
                                        // @ts-expect-error – width/height override for display
                                        width="128"
                                        height="128"
                                    />
                                </div>
                                {/* 1× actual size comparison */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Component />
                                    <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace' }}>actual 32px</span>
                                </div>
                                <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace', textAlign: 'center', maxWidth: 200 }}>
                                    {note}
                                </span>
                            </div>
                        )}
                    </AssetCard>
                ))}
            </div>
        </div>
    );
}
