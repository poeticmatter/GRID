import { AssetCard } from '../components/AssetCard';
import Title1 from '../assets/Title1';
import Title2 from '../assets/Title2';
import Title3 from '../assets/Title3';
import Title4 from '../assets/Title4';

const TITLES = [
    {
        label: 'Phosphor Tube',
        description: 'VT323 · phosphor bloom · CRT scanlines · flicker',
        filename: 'grid-title-phosphor.svg',
        Component: Title1,
        font: 'VT323',
        note: 'Warm pixel-terminal. Flicker every ~5s. Online for font.',
    },
    {
        label: 'Chromatic Fracture',
        description: 'Orbitron 900 · RGB split · hard glitch burst every ~4s',
        filename: 'grid-title-chromatic.svg',
        Component: Title2,
        font: 'Orbitron',
        note: 'Sci-fi geometric. Glitch slices. Online for font.',
    },
    {
        label: 'Grid Terminal',
        description: 'Share Tech Mono · scan beam · blink cursor · interlace',
        filename: 'grid-title-terminal.svg',
        Component: Title3,
        font: 'Share Tech Mono',
        note: 'Hacker terminal. Sweeping beam. Online for font.',
    },
    {
        label: 'Phosphor Terminal',
        description: 'VT323 · phosphor green · scan beam · blink cursor · interlace',
        filename: 'grid-title-phosphor-terminal.svg',
        Component: Title4,
        font: 'VT323',
        note: 'Phosphor tube meets terminal grid. Online for font.',
    },
];

export function TitleTab() {
    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.12em', marginBottom: '6px' }}>
                    TITLE SCREEN VARIANTS
                </h2>
                <p style={{ fontSize: '12px', color: '#52525b', fontFamily: 'monospace', lineHeight: 1.6 }}>
                    640×200 animated SVG. All animations are pure SVG/CSS — no JS at runtime.
                    Google Fonts are loaded via @import in the SVG &lt;style&gt; tag — live preview
                    requires an internet connection; exported SVGs work offline with fallback fonts.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {TITLES.map(({ label, description, filename, Component, font, note }) => (
                    <AssetCard
                        key={label}
                        label={label}
                        description={description}
                        filename={filename}
                        previewBg="#000"
                    >
                        {(ref) => (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Responsive-scaled preview */}
                                <div style={{ width: '100%', overflow: 'hidden', borderRadius: '4px' }}>
                                    <Component
                                        ref={ref}
                                        // @ts-expect-error – override for display scaling
                                        width="100%"
                                        height="auto"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px', paddingTop: '4px' }}>
                                    <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace' }}>
                                        Font: <span style={{ color: '#22c55e' }}>{font}</span>
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#3f3f46', fontFamily: 'monospace' }}>
                                        {note}
                                    </span>
                                </div>
                            </div>
                        )}
                    </AssetCard>
                ))}
            </div>
        </div>
    );
}
