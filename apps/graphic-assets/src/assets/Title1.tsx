import { forwardRef } from 'react';

/**
 * Title 1 — "Phosphor Tube"
 * VT323 pixel-terminal font. Warm green phosphor glow built from stacked
 * Gaussian blur layers. CRT scanlines + slow organic flicker.
 */
const Title1 = forwardRef<SVGSVGElement>((_, ref) => {
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

        .t1-text {
            font-family: 'VT323', 'Courier New', monospace;
            font-size: 118px;
            fill: #39ff7a;
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: 18px;
        }
        .t1-wrap {
            animation: t1-flicker 5s ease-in-out infinite;
        }
        @keyframes t1-flicker {
            0%,  87%,  100% { opacity: 1; }
            88%              { opacity: 0.88; }
            89%              { opacity: 0.96; }
            90%              { opacity: 0.82; }
            91%              { opacity: 0.97; }
            92%              { opacity: 0.93; }
            93%              { opacity: 0.78; }
            94%              { opacity: 1; }
        }
        .t1-scanlines {
            animation: t1-scan-drift 8s linear infinite;
        }
        @keyframes t1-scan-drift {
            0%   { transform: translateY(0px); }
            100% { transform: translateY(4px); }
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

                {/* Phosphor bloom: three blur radii merged with screen blending */}
                <filter id="t1-phosphor" x="-15%" y="-40%" width="130%" height="180%"
                    colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2"  result="b1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6"  result="b2" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b3" />
                    {/* Tint the halos green */}
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

                {/* Scanline tile pattern */}
                <pattern id="t1-scanlines" x="0" y="0" width="1" height="4" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="640" height="2" fill="#000" opacity="0.18" />
                    <rect x="0" y="2" width="640" height="2" fill="transparent" />
                </pattern>

                {/* Subtle horizontal noise displacement */}
                <filter id="t1-noise" x="-2%" y="-5%" width="104%" height="110%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9 0.01"
                        numOctaves="1" seed="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise"
                        scale="1.2" xChannelSelector="R" yChannelSelector="G" />
                </filter>

                {/* CRT vignette */}
                <radialGradient id="t1-vignette" cx="50%" cy="50%" r="70%">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                </radialGradient>
            </defs>

            {/* Background */}
            <rect width="640" height="200" fill="#020f02" />

            {/* Faint background grid */}
            <g stroke="#0a1f0a" strokeWidth="0.4" opacity="0.5">
                {Array.from({ length: 16 }, (_, i) => (
                    <line key={`v${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="200" />
                ))}
                {Array.from({ length: 5 }, (_, i) => (
                    <line key={`h${i}`} x1="0" y1={(i + 1) * 33} x2="640" y2={(i + 1) * 33} />
                ))}
            </g>

            {/* Flickering group */}
            <g className="t1-wrap">
                {/* Phosphor glow text */}
                <text x="320" y="102" className="t1-text" filter="url(#t1-phosphor)">
                    G.R.I.D
                </text>
            </g>

            {/* Scanlines overlay */}
            <rect width="640" height="200" fill="url(#t1-scanlines)" className="t1-scanlines" />

            {/* Vignette */}
            <rect width="640" height="200" fill="url(#t1-vignette)" />

            {/* Corner UI chrome */}
            <g stroke="#22c55e" strokeWidth="0.8" fill="none" opacity="0.5">
                <path d="M 4 20 L 4 4 L 20 4" />
                <path d="M 620 20 L 620 4 L 604 4" />
                <path d="M 4 180 L 4 196 L 20 196" />
                <path d="M 620 180 L 620 196 L 604 196" />
            </g>

            {/* Sub-label */}
            <text x="320" y="178" fill="#22c55e" opacity="0.4"
                fontFamily="'VT323', monospace" fontSize="14"
                textAnchor="middle" letterSpacing="8">
                NEURAL INTRUSION SYSTEM v4.1
            </text>
        </svg>
    );
});

Title1.displayName = 'Title1';
export default Title1;
