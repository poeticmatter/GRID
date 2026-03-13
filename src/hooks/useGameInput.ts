import { useEffect } from 'react';
import { Dispatch } from '../engine/orchestrator';

export const useGameInput = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only rotate if not on an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'e') {
                Dispatch({ type: 'ROTATE_CARD' });
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            Dispatch({ type: 'ROTATE_CARD' });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);
};
