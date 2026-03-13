import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Dispatch } from '../../engine/orchestrator';
import { Board } from '../game/Board';
import { Hand } from '../game/Hand';
import { NetworkMap } from '../game/NetworkMap';
import { ActiveEffectStack } from '../game/ActiveEffectStack';
import { AudioController } from '../audio/AudioController';
import { PlaybackController } from '../game/PlaybackController';
import { gameEventBus } from '../../engine/eventBus';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualQueueStore } from '../../store/useVisualQueueStore';
import { Menu } from 'lucide-react';

export const GameLayout = () => {
    const gameState = useGameStore(state => state.gameState);
    const setGameState = useGameStore(state => state.setGameState);
    const credits = usePlayerStore(state => state.playerStats.credits);

    const handleStart = () => {
        gameEventBus.emit('AUDIO_INIT');
        Dispatch({ type: 'INITIALIZE_GAME' });
    };

    const handleMenu = () => {
        useVisualQueueStore.setState({ queue: [], isPlaying: false });
        setGameState('MENU');
    };

    useEffect(() => {
        // Only initialize if in MENU or just mounted?
        // Actually, initializeGame sets state to PLAYING.
        // If we want a start screen, we should wait for user input.
        // But for MVP, let's just show menu overlay.
    }, []);

    return (
        <div
            onClick={() => { if (gameState === 'EFFECT_ORDERING') Dispatch({ type: 'CANCEL_CARD' }); }}
            className="h-dvh w-screen max-w-[100vw] overflow-x-hidden bg-slate-900 text-white overflow-hidden grid grid-cols-1 grid-rows-[auto_1fr_auto] relative font-sans"
        >
            <PlaybackController />
            <AudioController />
            {/* Background Ambience & Widescreen Gutters */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4vw_4vw] pointer-events-none mask-image-[radial-gradient(ellipse_at_center,transparent_20%,black_80%)]" style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 100%)' }} />

            {/* Floating Menu Button */}
            {gameState !== 'MENU' && (
                <div className="absolute top-2 left-2 z-[120] scale-75 origin-top-left sm:scale-100 sm:top-4 sm:left-4">
                    <button
                        onClick={handleMenu}
                        className="bg-black/50 hover:bg-black/80 p-2 rounded border border-white/10 backdrop-blur-sm text-white/70 hover:text-white transition-colors flex items-center gap-2 shadow-lg"
                        title="Return to Menu"
                    >
                        <Menu className="w-5 h-5" />
                        <span className="text-xs font-mono font-bold tracking-wider">SYSTEM_MENU</span>
                    </button>
                </div>
            )}

            {/* Top Header / Network Map Zone */}
            <div className="relative w-full min-w-0 z-[60] pointer-events-none">
                <NetworkMap />
            </div>

            {/* Center Play Area */}
            <div className="relative w-full h-full min-w-0 z-10 grid place-items-center overflow-hidden min-h-0 pointer-events-none py-4">
                <div className="h-full max-h-[45vh] sm:max-h-full max-w-full aspect-square pointer-events-auto">
                    <Board />
                </div>
            </div>

            {/* Bottom Hand Zone */}
            <div className="relative w-full z-50 pointer-events-none">
                <Hand />
            </div>

            <ActiveEffectStack />

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
                        <div className="text-xl text-white/70 mb-8 font-mono">PAYLOAD DELIVERED. CREDITS: {credits}</div>
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
