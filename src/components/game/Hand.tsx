import { useGameStore } from '../../store/useGameStore';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export const Hand = () => {
  const { hand, selectedCardId, selectCard } = useGameStore();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
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
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
