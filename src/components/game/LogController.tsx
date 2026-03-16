import { useEffect } from 'react';
import { gameEventBus } from '../../engine/eventBus';
import { useLogStore } from '../../store/useLogStore';

const CM_LOG: Record<string, { label: string; type: 'danger' | 'warning' }> = {
    TRACE:           { label: 'ICE countermeasure: TRACE +',           type: 'warning' },
    HARDWARE_DAMAGE: { label: 'ICE countermeasure: HARDWARE DMG -',    type: 'danger'  },
    NET_DAMAGE:      { label: 'ICE countermeasure: NET DAMAGE',        type: 'danger'  },
    VIRUS:           { label: 'ICE countermeasure: VIRUS INJECTED ×',  type: 'danger'  },
    CORRUPT:         { label: 'ICE countermeasure: CORRUPTION ×',      type: 'danger'  },
    NOISE:           { label: 'ICE countermeasure: NOISE +',           type: 'warning' },
};

export const LogController = () => {
    const addLog = useLogStore(state => state.addLog);

    useEffect(() => {
        const handleCountermeasure = (payload: any) => {
            const entry = CM_LOG[payload?.type];
            if (entry) {
                addLog(`${entry.label}${payload.value}`, entry.type);
            }
        };

        const handleAnimateCells = () => {
            addLog('Grid sector accessed — cell data harvested', 'info');
        };

        const handleAnimateNodes = () => {
            addLog('Node integrity breach detected', 'info');
        };

        gameEventBus.on('VISUAL_COUNTERMEASURE', handleCountermeasure);
        gameEventBus.on('VISUAL_ANIMATE_CELLS', handleAnimateCells);
        gameEventBus.on('VISUAL_ANIMATE_NODES', handleAnimateNodes);

        return () => {
            gameEventBus.off('VISUAL_COUNTERMEASURE', handleCountermeasure);
            gameEventBus.off('VISUAL_ANIMATE_CELLS', handleAnimateCells);
            gameEventBus.off('VISUAL_ANIMATE_NODES', handleAnimateNodes);
        };
    }, [addLog]);

    return null;
};
