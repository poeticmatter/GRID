import { useEffect } from 'react';
import { initAudio, playSfx } from '../../engine/audio';
import { gameEventBus } from '../../engine/eventBus';

export const AudioController = () => {
  useEffect(() => {
    const handleSfx = (sfx: string) => playSfx(sfx as any);
    const handleInit = () => initAudio();

    gameEventBus.on('AUDIO_PLAY_SFX', handleSfx);
    gameEventBus.on('AUDIO_INIT', handleInit);

    return () => {
      gameEventBus.off('AUDIO_PLAY_SFX', handleSfx);
      gameEventBus.off('AUDIO_INIT', handleInit);
    };
  }, []);

  return null; // Invisible side-effect component
};
