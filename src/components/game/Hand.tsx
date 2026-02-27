import { useDeckStore } from '../../store/useDeckStore';
import { useUIStore } from '../../store/useUIStore';
import { useGameStore } from '../../store/useGameStore';
import { Dispatch } from '../../engine/orchestrator';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Play } from 'lucide-react';

export const Hand = () => {
    const { hand } = useDeckStore();
    const { selectedCardId, rotation } = useUIStore();
    const { gameState } = useGameStore();

    const handleRotate = (e: React.MouseEvent) => {
        e.stopPropagation();
        Dispatch({ type: 'ROTATE_CARD' });
    };

    const handlePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedCardId && gameState === 'PLAYING') {
            const card = hand.find(c => c.id === selectedCardId);
            if (card) {
                Dispatch({ type: 'PLAY_CARD', payload: { cardId: selectedCardId, effects: card.effects } });
            }
        }
    };

    const selectedCard = hand.find(c => c.id === selectedCardId);
    const isPlayingPhase = gameState === 'PLAYING';
    const isReset = selectedCard?.effects?.some(e => e.type === 'SYSTEM_RESET');

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 pointer-events-auto">
            <AnimatePresence mode="wait">
                {selectedCard && isPlayingPhase && (
                    <motion.div
                        key="actions"
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        className="flex gap-2 items-center justify-center bg-black/60 p-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl"
                    >
                        <button
                            onClick={handlePlay}
                            className="flex items-center gap-2 bg-emerald-600/80 hover:bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-emerald-900/50 transition-all hover:scale-105 border border-emerald-400"
                        >
                            <Play className="w-5 h-5" />
                            PLAY CARD
                        </button>
                        {!isReset && (
                            <button
                                onClick={handleRotate}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold transition-colors hover:shadow-cyan-400/20 border border-slate-600 hover:border-cyan-400 hover:text-cyan-400"
                                title="Rotate Shape"
                            >
                                <RotateCw className="w-5 h-5" />
                                ROTATE
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-end justify-center -space-x-4 hover:space-x-2 transition-all duration-300">
                <AnimatePresence>
                    {hand.map((card) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Card
                                card={card}
                                isSelected={selectedCardId === card.id}
                                onClick={() => {
                                    if (gameState === 'PLAYING') {
                                        Dispatch({ type: 'SELECT_CARD', payload: { cardId: selectedCardId === card.id ? null : card.id } })
                                    }
                                }}
                                rotation={selectedCardId === card.id ? rotation : 0}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
