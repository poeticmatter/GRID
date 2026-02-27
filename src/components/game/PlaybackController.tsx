import { useEffect, useRef } from 'react';
import { useVisualQueueStore } from '../../store/useVisualQueueStore';
import { applyDeltas } from '../../engine/orchestrator';

export const PlaybackController = () => {
    const isPlaying = useVisualQueueStore(state => state.isPlaying);
    const queueLength = useVisualQueueStore(state => state.queue.length);
    const dequeue = useVisualQueueStore(state => state.dequeue);
    const setPlaying = useVisualQueueStore(state => state.setPlaying);

    const processingRef = useRef(false);

    useEffect(() => {
        if (!isPlaying || processingRef.current || queueLength === 0) return;

        const processNext = async () => {
            processingRef.current = true;

            // Wait slightly before applying to let the previous frame settle visually
            await new Promise(resolve => setTimeout(resolve, 50));

            const action = dequeue();

            if (action) {
                applyDeltas(action.deltas);

                // Dynamic delay depending on events triggered to fake physical animation time
                let delay = 400; // base step delay for fluid visual
                if (action.deltas.events) {
                    const eventTypes = action.deltas.events.map(e => e.type);
                    if (eventTypes.includes('AUDIO_PLAY_SFX') && eventTypes.includes('error')) {
                        delay = 600;
                    }
                    if (eventTypes.includes('AUDIO_PLAY_SFX') && eventTypes.includes('cut')) {
                        delay = 800; // Let cut animation finish (example assumed)
                    }
                    if (eventTypes.includes('INCREMENT_TRACE_METER')) {
                        delay = 500;
                    }
                }

                await new Promise(resolve => setTimeout(resolve, delay));
                processingRef.current = false;

                // Trigger re-check
                setPlaying(true);
            } else {
                processingRef.current = false;
                setPlaying(false);
            }
        };

        processNext();
    }, [isPlaying, queueLength, dequeue, setPlaying]);

    // Input Bleed Block: Cover the screen with an invisible overlay
    if (!isPlaying) return null;

    return (
        <div
            className="fixed inset-0 z-[999] cursor-wait"
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};
