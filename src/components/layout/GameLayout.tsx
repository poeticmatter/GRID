import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Board } from '../game/Board';
import { Hand } from '../game/Hand';
import { ServerRow } from '../game/ServerRow';
import { EndTurnButton } from '../ui/EndTurnButton';
import { AudioController } from '../audio/AudioController';
import { initAudio } from '../../engine/audio';
import { motion, AnimatePresence } from 'framer-motion';

export const GameLayout = () => {
  const { initializeGame, playerStats, turn, gameState } = useGameStore();

  const handleStart = async () => {
    await initAudio();
    initializeGame();
  };

  useEffect(() => {
    // Only initialize if in MENU or just mounted?
    // Actually, initializeGame sets state to PLAYING.
    // If we want a start screen, we should wait for user input.
    // But for MVP, let's just show menu overlay.
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-900 text-white overflow-hidden relative font-sans">
      <AudioController />
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80" />

      {/* HUD Layer (Top) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 p-2 rounded border border-white/10 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-cyan-400 tracking-tighter">CYBER//DECK</h1>
          <div className="text-xs text-white/50 font-mono">MVP BUILD v1.0</div>
        </div>

        {/* Stats */}
        <div className="bg-black/80 p-3 rounded border border-white/10 backdrop-blur-sm text-right font-mono text-xs shadow-lg min-w-[140px]">
            <div className="mb-1 text-white/50 border-b border-white/10 pb-1">CYCLE: {turn}</div>

            <div className="flex justify-between">
                <span>HARDWARE:</span>
                <span>
                    {Array.from({ length: playerStats.maxHardwareHealth }).map((_, i) => (
                        <span key={i} className={i < playerStats.hardwareHealth ? "text-rose-500 drop-shadow-[0_0_2px_rgba(244,63,94,0.8)]" : "text-slate-700"}>▮</span>
                    ))}
                </span>
            </div>

            <div className="flex justify-between">
                <span>SANITY:</span>
                <span className="text-cyan-400">{playerStats.softwareHealth}</span>
            </div>

            <div className="flex justify-between">
                <span>TRACE:</span>
                <span className={playerStats.trace > 80 ? "text-red-500 animate-pulse font-bold" : "text-amber-400"}>
                    {playerStats.trace}%
                </span>
            </div>

            <div className="mt-1 pt-1 border-t border-white/10 flex justify-between text-yellow-400">
                <span>CREDIT:</span>
                <span>{playerStats.credits}</span>
            </div>
        </div>
      </div>

      {/* Server Row Layer */}
      <div className="absolute top-24 w-full z-30 pointer-events-none">
         <div className="pointer-events-auto">
             <ServerRow />
         </div>
      </div>

      {/* Main Game Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-48 pb-32 pointer-events-none">
        <div className="pointer-events-auto">
            <Board />
        </div>
      </div>

      {/* Controls Layer */}
      <div className="absolute bottom-40 right-8 z-50 pointer-events-auto">
          <EndTurnButton />
      </div>

      {/* Hand Layer */}
      <Hand />

      {/* Overlays */}
      <AnimatePresence>
        {gameState === 'MENU' && (
            <motion.div
                className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <h1 className="text-6xl font-black text-cyan-400 mb-8 tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">CYBER//DECK</h1>
                <button
                    className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                    onClick={handleStart}
                >
                    INITIALIZE LINK
                </button>
            </motion.div>
        )}

        {gameState === 'GAME_OVER' && (
            <motion.div
                className="absolute inset-0 z-[100] bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <h1 className="text-6xl font-black text-rose-500 mb-4 tracking-tighter">FLATLINED</h1>
                <div className="text-xl text-white/70 mb-8 font-mono">CONNECTION TERMINATED</div>
                <button
                    className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xl shadow-lg transition-all hover:scale-105"
                    onClick={handleStart}
                >
                    REBOOT SYSTEM
                </button>
            </motion.div>
        )}

        {gameState === 'VICTORY' && (
            <motion.div
                className="absolute inset-0 z-[100] bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <h1 className="text-6xl font-black text-emerald-400 mb-4 tracking-tighter">ROOT ACCESS GRANTED</h1>
                <div className="text-xl text-white/70 mb-8 font-mono">PAYLOAD DELIVERED. CREDITS: {playerStats.credits}</div>
                <button
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xl shadow-lg transition-all hover:scale-105"
                    onClick={handleStart}
                >
                    NEW TARGET
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
