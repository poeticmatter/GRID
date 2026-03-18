import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { useTargetingStore } from '../../../store/useTargetingStore';
import { useViewModel } from '../../../hooks/useViewModel';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { Dispatch } from '../../../engine/orchestrator';
import { AnimatePresence } from 'framer-motion';
import { MobileConsoleView } from './MobileConsoleView';
import { DesktopConsoleView } from './DesktopConsoleView';
import { useActiveGlobalCountermeasures } from '../../../store/selectors';
import type { Effect } from '../../../engine/types';

export const ConsoleController = () => {
    const { gameState, pendingEffects, effectQueue, isCardCommitted } = useGameStore();
    const { hoveredCoordinate, setHoveredCoordinate } = useTargetingStore();
    const { grid } = useViewModel();
    const isMobile = useIsMobile();
    const [isExpanded, setIsExpanded] = useState(false);
    const globalCountermeasures = useActiveGlobalCountermeasures();

    const activeEffect = effectQueue[0]?.effect;
    const isResolving = gameState === 'EFFECT_RESOLUTION' && (activeEffect?.type === 'RUN' || activeEffect?.type === 'REPROGRAM' || activeEffect?.type === 'SYSTEM_RESET');
    const isVisible = (gameState === 'EFFECT_ORDERING' || gameState === 'EFFECT_RESOLUTION') && (pendingEffects.length > 0 || isResolving);

    // Auto-open drawer when console becomes active on mobile
    useEffect(() => {
        if (isMobile && isVisible) {
            setIsExpanded(true);
        }
    }, [isVisible, isMobile]);

    // Mobile Virtual Cursor Initialization
    useEffect(() => {
        if (isMobile && gameState === 'EFFECT_RESOLUTION' && (activeEffect?.type === 'RUN' || activeEffect?.type === 'REPROGRAM') && hoveredCoordinate === null) {
            const centerY = Math.floor(grid.length / 2);
            const centerX = Math.floor(grid[0]?.length / 2) || 0;
            setHoveredCoordinate({ x: centerX, y: centerY });
        }
    }, [gameState, activeEffect?.type, isMobile, grid, setHoveredCoordinate, hoveredCoordinate]);

    const handleDpadMove = useCallback((dx: number, dy: number) => {
        if (!hoveredCoordinate) return;
        const newX = Math.max(0, Math.min(grid[0].length - 1, hoveredCoordinate.x + dx));
        const newY = Math.max(0, Math.min(grid.length - 1, hoveredCoordinate.y + dy));
        setHoveredCoordinate({ x: newX, y: newY });
    }, [grid, hoveredCoordinate, setHoveredCoordinate]);

    const handleConfirm = useCallback(() => {
        if (activeEffect?.type === 'RUN' && hoveredCoordinate) {
            Dispatch({ type: 'RESOLVE_RUN', payload: { x: hoveredCoordinate.x, y: hoveredCoordinate.y, pattern: activeEffect.pattern } });
            setHoveredCoordinate(null);
        } else if (activeEffect?.type === 'REPROGRAM' && hoveredCoordinate) {
            const { reprogramTargetSource } = useGameStore.getState();
            
            if (!reprogramTargetSource) {
                // Phase 1: Select Source
                const nodeAtCoord = grid[hoveredCoordinate.y]?.[hoveredCoordinate.x];
                if (nodeAtCoord?.state !== 'BROKEN') {
                    Dispatch({ type: 'SET_REPROGRAM_SOURCE', payload: { source: hoveredCoordinate } });
                }
            } else {
                // Phase 2: Select Destination
                Dispatch({ type: 'RESOLVE_REPROGRAM', payload: { source: reprogramTargetSource, dest: hoveredCoordinate } });
                setHoveredCoordinate(null);
            }
        }
    }, [activeEffect, hoveredCoordinate, setHoveredCoordinate, grid]);

    const handleQueueEffect = useCallback((effect: Effect) => {
        if (gameState === 'EFFECT_ORDERING') {
            Dispatch({ type: 'QUEUE_EFFECT', payload: { effect } });
        }
    }, [gameState]);

    const handleRotate = useCallback(() => {
        Dispatch({ type: 'ROTATE_CARD' });
    }, []);

    const handleResolveSystemReset = useCallback(() => {
        Dispatch({ type: 'RESOLVE_SYSTEM_RESET' });
    }, []);

    const handleCancel = useCallback(() => {
        Dispatch({ type: 'CANCEL_CARD' });
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                isMobile ? (
                    <MobileConsoleView
                        key="mobile-console"
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        isResolving={isResolving}
                        pendingEffects={pendingEffects}
                        gameState={gameState}
                        onQueueEffect={handleQueueEffect}
                        onDpadMove={handleDpadMove}
                        onRotate={handleRotate}
                        onConfirm={handleConfirm}
                        onResolveSystemReset={handleResolveSystemReset}
                        onCancel={handleCancel}
                        isCardCommitted={isCardCommitted}
                        activeEffectType={activeEffect?.type}
                        globalCountermeasures={globalCountermeasures}
                    />
                ) : (
                    <DesktopConsoleView
                        key="desktop-console"
                        isResolving={isResolving}
                        pendingEffects={pendingEffects}
                        gameState={gameState}
                        onQueueEffect={handleQueueEffect}
                        onRotate={handleRotate}
                        onResolveSystemReset={handleResolveSystemReset}
                        onCancel={handleCancel}
                        isCardCommitted={isCardCommitted}
                        activeEffectType={activeEffect?.type}
                        globalCountermeasures={globalCountermeasures}
                    />
                )
            )}
        </AnimatePresence>
    );
};
