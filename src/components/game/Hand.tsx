import { useGameStore } from '../../store/useGameStore';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Power } from 'lucide-react';

export const Hand = () => {
  const { hand, selectedCardId, selectCard, rotateCard, playCard, rotation } = useGameStore();

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    rotateCard();
  };

  const handleExecuteReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCardId) {
      playCard(selectedCardId, 0, 0); // x, y are ignored for RESET
    }
  };

  const selectedCard = hand.find(c => c.id === selectedCardId);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {selectedCard && (
          <motion.div
            key={selectedCard.action || 'CUT'}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            className="flex gap-2 items-center justify-center bg-black/60 p-2 rounded-full backdrop-blur-md border border-white/10"
          >
            {selectedCard.action === 'RESET' ? (
              <button
                onClick={handleExecuteReset}
                className="flex items-center gap-2 bg-rose-600/80 hover:bg-rose-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-rose-900/50 transition-all hover:scale-105"
              >
                <Power className="w-5 h-5" />
                EXECUTE RESET
              </button>
            ) : (
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
                onClick={() => selectCard(selectedCardId === card.id ? null : card.id)}
                rotation={selectedCardId === card.id ? rotation : 0}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
