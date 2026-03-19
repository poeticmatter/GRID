/**
 * MenuTitle — inline SVG for the G.R.I.D title on the main menu.
 * Uses VT323 via @import in the SVG <style> tag (same technique as the
 * graphic-assets Title components) so the font is guaranteed to load.
 * Transparent background — the menu overlay provides the backdrop.
 */
export function MenuTitle() {
    const css = `
        .mt-text {
            font-family: 'VT323', 'Courier New', monospace;
            font-size: 120px;
            fill: #39ff7a;
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: 20px;
        }
        .mt-wrap {
            animation: mt-flicker 6s ease-in-out infinite;
        }
        @keyframes mt-flicker {
            0%,  91%, 100% { opacity: 1; }
            92%             { opacity: 0.9; }
            93%             { opacity: 0.96; }
            94%             { opacity: 0.85; }
            95%             { opacity: 0.98; }
        }
    `;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 480 140"
            style={{ width: 'clamp(260px, 60vw, 520px)', height: 'auto', overflow: 'visible' }}
        >
            <defs>
                <style dangerouslySetInnerHTML={{ __html: css }} />
                <filter id="mt-glow" x="-20%" y="-50%" width="140%" height="200%"
                    colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2"  result="b1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="7"  result="b2" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b3" />
                    <feColorMatrix in="b2" type="matrix"
                        values="0 0 0 0 0.1   0 0 0 0 1   0 0 0 0 0.3   0 0 0 1.4 0"
                        result="b2g" />
                    <feColorMatrix in="b3" type="matrix"
                        values="0 0 0 0 0   0 0 0 0 0.8   0 0 0 0 0.1   0 0 0 0.7 0"
                        result="b3g" />
                    <feMerge>
                        <feMergeNode in="b3g" />
                        <feMergeNode in="b2g" />
                        <feMergeNode in="b1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <g className="mt-wrap">
                <text x="240" y="76" className="mt-text" filter="url(#mt-glow)">
                    G.R.I.D
                </text>
            </g>
        </svg>
    );
}
