import { forwardRef } from 'react';

/**
 * Title 2 — "Chromatic Fracture"
 * Orbitron geometric sci-fi font. Chromatic aberration split (red/cyan offsets)
 * with periodic hard glitch bursts. Slice-corrupted clip rectangles.
 */
const Title2 = forwardRef<SVGSVGElement>((_, ref) => {
    const css = `
        .t2-text {
            font-family: 'Orbitron', 'Arial Black', sans-serif;
            font-size: 96px;
            font-weight: 900;
            text-anchor: middle;
            dominant-baseline: middle;
            letter-spacing: 14px;
        }
        /* Red channel — shifts left, glitches out periodically */
        .t2-red {
            fill: #ff2244;
            opacity: 0.75;
            animation: t2-red-drift 3.7s ease-in-out infinite;
        }
        /* Cyan channel — shifts right */
        .t2-cyan {
            fill: #00ffee;
            opacity: 0.75;
            animation: t2-cyan-drift 3.7s ease-in-out infinite;
        }
        /* Main white/green layer */
        .t2-main {
            fill: #e8ffe0;
            animation: t2-main-glitch 3.7s ease-in-out infinite;
        }
        @keyframes t2-red-drift {
            0%,  78%, 100% { transform: translateX(-4px); opacity: 0.7; }
            79%             { transform: translateX(-22px) translateY(3px); opacity: 0.9; }
            80%             { transform: translateX(-8px);  opacity: 0.5; }
            81%             { transform: translateX(-28px) translateY(-2px); opacity: 0.95; }
            82%             { transform: translateX(-4px);  opacity: 0.7; }
            83%             { transform: translateX(-14px) translateY(1px); opacity: 0.85; }
            84%             { transform: translateX(-4px);  opacity: 0.7; }
        }
        @keyframes t2-cyan-drift {
            0%,  78%, 100% { transform: translateX(4px); opacity: 0.7; }
            79%             { transform: translateX(18px) translateY(-2px); opacity: 0.9; }
            80%             { transform: translateX(6px);  opacity: 0.5; }
            81%             { transform: translateX(24px) translateY(3px); opacity: 0.95; }
            82%             { transform: translateX(4px);  opacity: 0.7; }
            83%             { transform: translateX(12px) translateY(-1px); opacity: 0.85; }
            84%             { transform: translateX(4px);  opacity: 0.7; }
        }
        @keyframes t2-main-glitch {
            0%,  78%, 100% { transform: translateX(0); opacity: 1; }
            79%             { transform: translateX(6px) skewX(-1deg); opacity: 0.9; }
            80%             { transform: translateX(-4px); opacity: 1; }
            81%             { transform: translateX(3px) skewX(0.5deg); opacity: 0.85; }
            82%             { transform: translateX(0); opacity: 1; }
        }
        /* Glitch slice animations */
        .t2-slice1 { animation: t2-slice1 3.7s ease-in-out infinite; }
        .t2-slice2 { animation: t2-slice2 3.7s ease-in-out infinite; }
        @keyframes t2-slice1 {
            0%,  77%, 85%, 100% { transform: translateX(0); opacity: 0; }
            78%  { transform: translateX(20px); opacity: 1; }
            79%  { transform: translateX(-14px); opacity: 1; }
            80%  { transform: translateX(0); opacity: 0; }
        }
        @keyframes t2-slice2 {
            0%,  79%, 84%, 100% { transform: translateX(0); opacity: 0; }
            80%  { transform: translateX(-18px); opacity: 0.8; }
            81%  { transform: translateX(10px); opacity: 0.8; }
            82%  { transform: translateX(0); opacity: 0; }
        }
        /* Noise pulse */
        .t2-noise { animation: t2-noise-pulse 3.7s ease-in-out infinite; }
        @keyframes t2-noise-pulse {
            0%,  78%, 100% { opacity: 0; }
            79%             { opacity: 0.06; }
            80%             { opacity: 0; }
            81%             { opacity: 0.04; }
            82%             { opacity: 0; }
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

                {/* Noise filter for static */}
                <filter id="t2-static">
                    <feTurbulence type="turbulence" baseFrequency="0.65" numOctaves="3"
                        stitchTiles="stitch" result="noise" />
                    <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
                    <feBlend in="SourceGraphic" in2="grey" mode="hard-light" result="blend" />
                </filter>

                {/* Subtle outer glow */}
                <filter id="t2-glow" x="-10%" y="-40%" width="120%" height="180%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Clip regions for glitch slices */}
                <clipPath id="t2-clip1">
                    <rect x="0" y="60" width="640" height="28" />
                </clipPath>
                <clipPath id="t2-clip2">
                    <rect x="0" y="110" width="640" height="22" />
                </clipPath>

                {/* Vignette */}
                <radialGradient id="t2-vignette" cx="50%" cy="50%" r="75%">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                </radialGradient>
            </defs>

            {/* Background */}
            <rect width="640" height="200" fill="#03030a" />

            {/* Diagonal scanlines */}
            <line x1="0" y1="0" x2="640" y2="0" stroke="#0a0a18" strokeWidth="1" />
            {Array.from({ length: 100 }, (_, i) => (
                <line key={i} x1="0" y1={i * 2 + 1} x2="640" y2={i * 2 + 1}
                    stroke="#000" strokeWidth="0.8" opacity="0.3" />
            ))}

            {/* Red channel */}
            <text x="320" y="102" className="t2-text t2-red" filter="url(#t2-glow)">
                G.R.I.D
            </text>

            {/* Cyan channel */}
            <text x="320" y="102" className="t2-text t2-cyan" filter="url(#t2-glow)">
                G.R.I.D
            </text>

            {/* Main layer */}
            <text x="320" y="102" className="t2-text t2-main">
                G.R.I.D
            </text>

            {/* Glitch slice 1 — uses clip rect at y=60 */}
            <g clipPath="url(#t2-clip1)" className="t2-slice1">
                <text x="320" y="102" className="t2-text" fill="#00ffee" opacity="0.9">
                    G.R.I.D
                </text>
            </g>

            {/* Glitch slice 2 */}
            <g clipPath="url(#t2-clip2)" className="t2-slice2">
                <text x="320" y="102" className="t2-text" fill="#ff2244" opacity="0.9">
                    G.R.I.D
                </text>
            </g>

            {/* Noise overlay */}
            <rect width="640" height="200" fill="#fff" className="t2-noise"
                filter="url(#t2-static)" />

            {/* Vignette */}
            <rect width="640" height="200" fill="url(#t2-vignette)" />

            {/* Corner chrome */}
            <g stroke="#555" strokeWidth="0.6" fill="none" opacity="0.6">
                <path d="M 4 20 L 4 4 L 20 4" />
                <path d="M 620 20 L 620 4 L 604 4" />
                <path d="M 4 180 L 4 196 L 20 196" />
                <path d="M 620 180 L 620 196 L 604 196" />
            </g>

            {/* Sub-label */}
            <text x="320" y="180" fill="#fff" opacity="0.25"
                fontFamily="'Orbitron', sans-serif" fontSize="9"
                textAnchor="middle" letterSpacing="10">
                NEURAL INTRUSION SYSTEM
            </text>
        </svg>
    );
});

Title2.displayName = 'Title2';
export default Title2;
