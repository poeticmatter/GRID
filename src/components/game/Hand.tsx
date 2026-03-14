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
    const { gameState, pendingNetDamage } = useGameStore();

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
        <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full min-w-0 max-w-full flex flex-col justify-center items-center gap-4 pb-4 z-50 pointer-events-auto transition-transform"
        >
            <div className="flex items-end justify-start sm:justify-center w-full max-w-full overflow-x-auto sm:overflow-visible px-6 sm:px-0 gap-4 sm:gap-0 sm:-space-x-4 sm:hover:space-x-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <AnimatePresence>
                    {hand.map((card) => (
                        <motion.div
                            key={card.id}
                            className="shrink-0 snap-center flex justify-center"
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
                                        Dispatch({ type: 'PLAY_CARD', payload: { cardId: card.id, effects: card.effects } });
                                    } else if (gameState === 'EFFECT_ORDERING' && selectedCardId === card.id) {
                                        Dispatch({ type: 'CANCEL_CARD' });
                                    } else if (gameState === 'RESOLVING_NET_DAMAGE') {
                                        Dispatch({ type: 'DISCARD_FOR_NET_DAMAGE', payload: { cardId: card.id } });
                                    }
                                }}
                                rotation={selectedCardId === card.id ? rotation : 0}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {gameState === 'RESOLVING_NET_DAMAGE' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-16 bg-red-950/90 border border-red-500/50 px-6 py-2 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)] backdrop-blur-md z-[60] flex flex-col items-center gap-1"
                >
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        <span className="text-red-400 font-black tracking-[0.2em] text-xs uppercase">Net Damage Detected</span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-white font-mono text-[10px] uppercase opacity-80">
                        Discard <span className="text-red-400 font-bold text-sm mx-1">{pendingNetDamage}</span> cards to stabilize
                    </span>
                    <div className="text-[9px] text-red-500/60 font-mono mt-1 animate-pulse">
                        Warning: Trashing Core Systems will cause fatal crash
                    </div>
                </motion.div>
            )}
        </div>
    );
};
