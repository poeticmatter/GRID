import { useEffect, useRef } from 'react';
import { useVisualQueueStore } from '../../store/useVisualQueueStore';
import { gameEventBus } from '../../engine/eventBus';

/**
 * PlaybackController — consumes the PlaybackEvent queue and drives
 * sequenced animations/audio timing for the UI.
 *
 * CRITICAL: This component does NOT apply logical state anymore.
 * Logical state is committed synchronously in Dispatch() before this
 * component ever runs. PlaybackController is purely a timing/presentation
 * orchestrator that tells the UI *when* to animate, not *what* state to show.
 */
export const PlaybackController = () => {
    const isPlaying = useVisualQueueStore(state => state.isPlaying);
    const setPlaying = useVisualQueueStore(state => state.setPlaying);

    const processingRef = useRef(false);

    useEffect(() => {
        if (!isPlaying || processingRef.current) return;

        const processQueue = async () => {
            processingRef.current = true;

            while (true) {
                const queueStore = useVisualQueueStore.getState();
                const event = queueStore.dequeue();

                if (!event) {
                    break;
                }

                // Dispatch the event type-specific presentation action
                switch (event.type) {
                    case 'PLAY_SFX':
                        // SFX is already fired via gameEventBus in commitLogicalState.
                        // Here we just wait the appropriate duration for the animation to align.
                        break;

                    case 'ANIMATE_CELLS':
                        // Notify any subscribed animation layers that cells are changing.
                        // The Board reads from the logical store (already committed) — this
                        // event just triggers CSS transition timing coordination.
                        gameEventBus.emit('VISUAL_ANIMATE_CELLS', event.payload);
                        break;

                    case 'ANIMATE_NODES':
                        // Notify NetworkMap to run entry/progress animations.
                        gameEventBus.emit('VISUAL_ANIMATE_NODES', event.payload);
                        break;

                    case 'ANIMATE_COUNTERMEASURE':
                        // Notify presentation layer to display the countermeasure penalty.
                        gameEventBus.emit('VISUAL_COUNTERMEASURE', event.payload);
                        break;

                    case 'WAIT':
                        // Pure pacing delay — no side effect.
                        break;
                }

                // Wait the event's duration before processing the next event.
                if (event.durationMs > 0) {
                    await new Promise(resolve => setTimeout(resolve, event.durationMs));
                }
            }

            processingRef.current = false;
            setPlaying(false);
        };

        processQueue();
    }, [isPlaying, setPlaying]);

    // Input Bleed Block: Cover the screen with an invisible overlay while animating.
    if (!isPlaying) return null;

    return (
        <div
            className="fixed inset-0 z-[999] cursor-wait"
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};
