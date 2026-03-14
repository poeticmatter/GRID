import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameEventBus } from '../../engine/eventBus';
import { useUIStore } from '../../store/useUIStore';
import { LAYER_THEME } from '../../presentation/theme';
import { Shield, Eye, Skull } from 'lucide-react';
import { clsx } from 'clsx';
import type { CellColor, CellSymbol, Coordinate, Cell as CellType } from '../../engine/types';

const SYMBOL_MAP: Record<CellSymbol, React.ReactNode> = {
    SHIELD: <Shield className="w-5 h-5 text-current drop-shadow-md" />,
    EYE: <Eye className="w-5 h-5 text-current drop-shadow-md" />,
    SKULL: <Skull className="w-5 h-5 text-current drop-shadow-md" />,
    NONE: null,
};

interface SwapEvent {
    source: Coordinate;
    dest: Coordinate;
    sourceCell: CellType;
    destCell: CellType;
}

const DummyCell = ({ cell, startX, startY, endX, endY }: { cell: CellType, startX: number, startY: number, endX: number, endY: number }) => {
    const { color, symbol } = cell;

    const baseClasses = clsx(
        'absolute flex items-center justify-center rounded-sm border-2',
        LAYER_THEME[color].surface,
        LAYER_THEME[color].border,
        LAYER_THEME[color].text
    );

    const { cellSize } = useUIStore.getState().spatialMetrics;

    return (
        <motion.div
            className={baseClasses}
            style={{ 
                width: cellSize, 
                height: cellSize,
                left: startX,
                top: startY,
                zIndex: 100
            }}
            initial={{ scale: 1, left: startX, top: startY }}
            animate={{ 
                scale: [1, 0.5, 0.5, 1.2, 1],
                left: [startX, startX, endX, endX],
                top: [startY, startY, endY, endY],
                filter: ['brightness(1)', 'brightness(1)', 'brightness(2)', 'brightness(1)']
            }}
            transition={{ 
                duration: 0.8,
                times: [0, 0.3, 0.6, 0.9, 1],
                ease: "easeInOut"
            }}
        >
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
             <div className="relative z-10">
                {SYMBOL_MAP[symbol]}
            </div>
        </motion.div>
    );
};

export const VFXOverlayLayer = () => {
    const [activeSwap, setActiveSwap] = useState<SwapEvent | null>(null);
    const spatialMetrics = useUIStore(state => state.spatialMetrics);

    useEffect(() => {
        const handleSwap = (payload: SwapEvent) => {
            setActiveSwap(payload);
            setTimeout(() => setActiveSwap(null), 800);
        };

        gameEventBus.on('VFX_REPROGRAM_SWAP', handleSwap);
        return () => gameEventBus.off('VFX_REPROGRAM_SWAP', handleSwap);
    }, []);

    // Helper to calculate pixel position
    const getPos = (coord: Coordinate) => {
        const { cellSize, gapSize } = spatialMetrics;
        return {
            x: coord.x * (cellSize + gapSize),
            y: coord.y * (cellSize + gapSize)
        };
    };

    if (!activeSwap) return null;

    const sourcePos = getPos(activeSwap.source);
    const destPos = getPos(activeSwap.dest);

    return (
        <div className="absolute inset-2 pointer-events-none z-50">
            <AnimatePresence>
                {activeSwap && (
                    <>
                        <DummyCell 
                            key={`dummy-source-${activeSwap.sourceCell.id}`}
                            cell={activeSwap.sourceCell}
                            startX={sourcePos.x}
                            startY={sourcePos.y}
                            endX={destPos.x}
                            endY={destPos.y}
                        />
                        <DummyCell 
                            key={`dummy-dest-${activeSwap.destCell.id}`}
                            cell={activeSwap.destCell}
                            startX={destPos.x}
                            startY={destPos.y}
                            endX={sourcePos.x}
                            endY={sourcePos.y}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
