import { forwardRef } from 'react';

/**
 * Title 4 — "Phosphor Terminal"
 * VT323 pixel-terminal font (Title1) + warm green phosphor color (Title1)
 * over Title3's dot-grid background, scanning beam, interlace, and CRT vignette.
 */
const Title4 = forwardRef<SVGSVGElement>((_, ref) => {
    const css = `
        .t4-text {
            font-family: 'VT323', 'Courier New', monospace;
            font-size: 100px;
            fill: #39ff7a;
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: 18px;
        }
        .t4-beam {
            animation: t4-sweep 2.6s linear infinite;
        }
        @keyframes t4-sweep {
            0%   { transform: translateY(-220px); opacity: 0; }
            5%   { opacity: 0.45; }
            90%  { opacity: 0.45; }
            100% { transform: translateY(220px); opacity: 0; }
        }
        .t4-cursor {
            animation: t4-blink 1.1s step-end infinite;
        }
        @keyframes t4-blink {
            0%,  49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }
        .t4-flicker {
            animation: t4-flicker 6s ease-in-out infinite;
        }
        @keyframes t4-flicker {
            0%,  91%, 100% { opacity: 1; }
            92%             { opacity: 0.9; }
            93%             { opacity: 0.96; }
            94%             { opacity: 0.85; }
            95%             { opacity: 0.98; }
        }
        .t4-interlace {
            animation: t4-interlace-shift 10s linear infinite;
        }
        @keyframes t4-interlace-shift {
            0%   { transform: translateY(0); }
            100% { transform: translateY(2px); }
        }
    `;

    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 200"
            width="640"
            height="200"
        >
            <defs>
                <style dangerouslySetInnerHTML={{ __html: css }} />

                {/* Dot grid */}
                <pattern id="t4-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="8" cy="8" r="0.7" fill="#0a1f0a" />
                </pattern>

                {/* Scanning beam gradient */}
                <linearGradient id="t4-beam-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="40%"  stopColor="#39ff7a" stopOpacity="0.12" />
                    <stop offset="50%"  stopColor="#39ff7a" stopOpacity="0.22" />
                    <stop offset="60%"  stopColor="#39ff7a" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>

                {/* Phosphor glow */}
                <filter id="t4-glow" x="-12%" y="-50%" width="124%" height="200%"
                    colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2" />
                    <feColorMatrix in="b2" type="matrix"
                        values="0 0 0 0 0.1   0 0 0 0 1   0 0 0 0 0.3   0 0 0 0.8 0"
                        result="b2g" />
                    <feMerge>
                        <feMergeNode in="b2g" />
                        <feMergeNode in="b1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Interlace pattern */}
                <pattern id="t4-interlace" x="0" y="0" width="640" height="4"
                    patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="640" height="2" fill="#000" opacity="0.12" />
                </pattern>

                {/* CRT vignette */}
                <radialGradient id="t4-vignette" cx="50%" cy="50%" r="72%">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.65" />
                </radialGradient>

                {/* Clip beam to canvas */}
                <clipPath id="t4-clip">
                    <rect x="0" y="0" width="640" height="200" />
                </clipPath>
            </defs>

            {/* Background */}
            <rect width="640" height="200" fill="#020f02" />

            {/* Dot grid */}
            <rect width="640" height="200" fill="url(#t4-dots)" />

            {/* Sub-pixel horizontal lines */}
            {Array.from({ length: 25 }, (_, i) => (
                <line key={i} x1="0" y1={i * 8} x2="640" y2={i * 8}
                    stroke="#0a1f0a" strokeWidth="0.3" />
            ))}

            {/* Flicker group */}
            <g className="t4-flicker">
                {/* Main text with glow */}
                <text x="312" y="100" className="t4-text" filter="url(#t4-glow)">
                    G.R.I.D
                </text>

                {/* Blinking cursor */}
                <rect x="559" y="60" width="10" height="76" fill="#39ff7a"
                    className="t4-cursor" filter="url(#t4-glow)" />
            </g>

            {/* Scanning beam */}
            <g clipPath="url(#t4-clip)">
                <rect x="0" y="0" width="640" height="200"
                    fill="url(#t4-beam-grad)" className="t4-beam" />
            </g>

            {/* Interlace overlay */}
            <rect width="640" height="200" fill="url(#t4-interlace)"
                className="t4-interlace" />

            {/* Vignette */}
            <rect width="640" height="200" fill="url(#t4-vignette)" />

            {/* UI chrome */}
            <g stroke="#22c55e" strokeWidth="0.7" fill="none" opacity="0.35">
                <path d="M 4 20 L 4 4 L 20 4" />
                <path d="M 620 20 L 620 4 L 604 4" />
                <path d="M 4 180 L 4 196 L 20 196" />
                <path d="M 620 180 L 620 196 L 604 196" />
            </g>

            {/* Bottom label */}
            <text x="320" y="188" fill="#22c55e" opacity="0.4"
                fontFamily="'VT323', monospace" fontSize="11"
                textAnchor="middle" letterSpacing="6">
                GOVERNMENT RUNTIME INJECTION DAEMON
            </text>
        </svg>
    );
});

Title4.displayName = 'Title4';
export default Title4;
