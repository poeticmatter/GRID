import { useEffect, useRef } from 'react';
import { useVisualQueueStore } from '../../store/useVisualQueueStore';
import { applyDeltas } from '../../engine/orchestrator';

export const PlaybackController = () => {
    const isPlaying = useVisualQueueStore(state => state.isPlaying);
    const setPlaying = useVisualQueueStore(state => state.setPlaying);

    const processingRef = useRef(false);

    useEffect(() => {
        if (!isPlaying || processingRef.current) return;

        const processQueue = async () => {
            processingRef.current = true;

            while (true) {
                // Wait slightly before applying to let the previous frame settle visually
                await new Promise(resolve => setTimeout(resolve, 50));

                const queueStore = useVisualQueueStore.getState();
                const action = queueStore.dequeue();

                if (!action) {
                    break;
                }

                applyDeltas(action.deltas);

                // Dynamic delay driven by event and root metadata
                let delay = action.deltas.durationMs || 0;
                if (action.deltas.events && action.deltas.events.length > 0) {
                    const maxDuration = Math.max(
                        ...action.deltas.events.map(e => e.durationMs || 0)
                    );
                    if (maxDuration > delay) {
                        delay = maxDuration;
                    }
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }

            processingRef.current = false;
            setPlaying(false);
        };

        processQueue();
    }, [isPlaying, setPlaying]);

    // Input Bleed Block: Cover the screen with an invisible overlay
    if (!isPlaying) return null;

    return (
        <div
            className="fixed inset-0 z-[999] cursor-wait"
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};
