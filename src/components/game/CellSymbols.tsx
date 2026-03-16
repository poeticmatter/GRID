import type { CellSymbol } from '../../engine/types';

/** Low-level mask icon from any SVG file in public/icons/symbols/. */
export const SvgMaskIcon = ({ file, size }: { file: string; size: number }) => (
    <span
        className="drop-shadow-md"
        style={{
            display: 'inline-block',
            width: size,
            height: size,
            backgroundColor: 'currentColor',
            maskImage: `url(/icons/symbols/${file})`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: `url(/icons/symbols/${file})`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
        }}
    />
);

/** Renders a CellSymbol icon. Takes on `currentColor` from its parent. */
export const SymbolIcon = ({ symbol, size = 32 }: { symbol: CellSymbol; size?: number }) => {
    if (symbol === 'NONE') return null;
    return <SvgMaskIcon file={`${symbol.toLowerCase()}.svg`} size={size} />;
};
