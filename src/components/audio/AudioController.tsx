import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { initAudio, playSfx } from '../../engine/audio';

export const AudioController = () => {
  const { gameState, turn } = useGameStore();
  const prevGameState = useRef(gameState);
  const prevTurn = useRef(turn);

  useEffect(() => {
    // Game State Changes
    if (gameState === 'PLAYING' && (prevGameState.current === 'MENU' || prevGameState.current === 'GAME_OVER' || prevGameState.current === 'VICTORY')) {
      // Start Game
      initAudio();
    } else if (gameState === 'GAME_OVER') {
      playSfx('game_over');
      // stopAudio is called inside playSfx for game_over, but explicit call is safer if needed
    } else if (gameState === 'VICTORY') {
      playSfx('victory');
    }

    prevGameState.current = gameState;
  }, [gameState]);

  useEffect(() => {
    // Turn Change SFX
    if (turn > prevTurn.current) {
       // New Turn
       // playSfx('turn_start'); // Not implemented yet
    }
    prevTurn.current = turn;
  }, [turn]);

  // We can add more specific listeners here if needed

  return null; // Invisible component
};
