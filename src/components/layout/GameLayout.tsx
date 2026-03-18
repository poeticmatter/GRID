import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Dispatch } from '../../engine/orchestrator';
import { Board } from '../game/Board';
import { MenuTitle } from '../game/MenuTitle';
import { TraceBar } from '../game/TraceBar';
import { Hand } from '../game/Hand';
import { NetworkMap } from '../game/NetworkMap';
import { Console } from '../game/Console';
import { AudioController } from '../audio/AudioController';
import { PlaybackController } from '../game/PlaybackController';
import { LogController } from '../game/LogController';
import { ActionLog } from '../game/ActionLog';
import { gameEventBus } from '../../engine/eventBus';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisualQueueStore } from '../../store/useVisualQueueStore';
import { Menu } from 'lucide-react';
import { useGameInput } from '../../hooks/useGameInput';
import { useViewModelManager } from '../../hooks/useViewModel';
import { useUIStore } from '../../store/useUIStore';
import { twMerge } from 'tailwind-merge';

export const GameLayout = () => {
    const gameState = useGameStore(state => state.gameState);
    const credits = usePlayerStore(state => state.playerStats.credits);
    const isMenuOpen = useUIStore(state => state.isMenuOpen);
    const setIsMenuOpen = useUIStore(state => state.setIsMenuOpen);
    const setIsTopologyOpen = useUIStore(state => state.setIsTopologyOpen);
    const [isShaking, setIsShaking] = useState(false);
    const [showVignette, setShowVignette] = useState(false);

    useGameInput();
    useViewModelManager();

    useEffect(() => {
        const handler = (payload: any) => {
            if (payload?.type === 'NET_DAMAGE' || payload?.type === 'HARDWARE_DAMAGE') {
                setIsShaking(true);
                setShowVignette(true);
                setTimeout(() => setIsShaking(false), 320);
                setTimeout(() => setShowVignette(false), 500);
            }
        };
        gameEventBus.on('VISUAL_COUNTERMEASURE', handler);
        return () => gameEventBus.off('VISUAL_COUNTERMEASURE', handler);
    }, []);

    const handleStart = () => {
        gameEventBus.emit('AUDIO_INIT');
        Dispatch({ type: 'INITIALIZE_GAME' });
        setIsMenuOpen(false);
        setIsTopologyOpen(true);
    };

    const handleMenu = () => {
        useVisualQueueStore.setState({ queue: [], isPlaying: false });
        setIsMenuOpen(true);
    };

    return (
        <div
            onClick={() => { if (gameState === 'EFFECT_ORDERING') Dispatch({ type: 'CANCEL_CARD' }); }}
            className={twMerge(
                "h-dvh w-screen max-w-[100vw] overflow-x-hidden bg-black text-white overflow-hidden grid grid-cols-1 grid-rows-[auto_1fr_auto] relative font-sans",
                isShaking && "animate-shake"
            )}
        >
            <PlaybackController />
            <AudioController />
            <LogController />
            <ActionLog />
            {/* Red damage vignette */}
            {showVignette && (
                <div
                    className="absolute inset-0 z-[300] pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.45) 100%)',
                        animation: 'glitch-flash 0.5s ease-out'
                    }}
                />
            )}
            {/* Background Ambience & Widescreen Gutters */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0d1f0d] via-[#020f02] to-black opacity-90 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#39ff7a08_1px,transparent_1px),linear-gradient(to_bottom,#39ff7a08_1px,transparent_1px)] bg-[size:4vw_4vw] pointer-events-none" style={{ WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 100%)' }} />



            {/* Floating Menu Button */}
            {!isMenuOpen && (
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
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 h-full max-h-[45vh] sm:max-h-full max-w-full pointer-events-auto">
                    <TraceBar />
                    <div className="h-full aspect-square">
                        <Board />
                    </div>
                </div>
            </div>

            {/* Bottom Hand Zone */}
            <div className="relative w-full z-50 pointer-events-none">
                <Hand />
            </div>

            <Console />

            {/* Overlays */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="absolute inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
                        style={{ background: '#020f02' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        {/* Dot grid */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: 'radial-gradient(circle, #0a1f0a 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                        }} />
                        {/* Sub-pixel horizontal lines */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 7px, #0a1f0a 7px, #0a1f0a 8px)',
                        }} />
                        {/* Scanning beam */}
                        <div className="menu-scan-beam absolute inset-0 pointer-events-none" style={{
                            background: 'linear-gradient(to bottom, transparent, rgba(57,255,122,0.08) 40%, rgba(57,255,122,0.18) 50%, rgba(57,255,122,0.08) 60%, transparent)',
                        }} />
                        {/* Interlace */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
                        }} />
                        {/* CRT vignette */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
                        }} />
                        {/* Corner chrome */}
                        <div className="absolute top-4 left-4 w-10 h-10 pointer-events-none" style={{ borderTop: '1px solid #22c55e', borderLeft: '1px solid #22c55e', opacity: 0.35 }} />
                        <div className="absolute top-4 right-4 w-10 h-10 pointer-events-none" style={{ borderTop: '1px solid #22c55e', borderRight: '1px solid #22c55e', opacity: 0.35 }} />
                        <div className="absolute bottom-4 left-4 w-10 h-10 pointer-events-none" style={{ borderBottom: '1px solid #22c55e', borderLeft: '1px solid #22c55e', opacity: 0.35 }} />
                        <div className="absolute bottom-4 right-4 w-10 h-10 pointer-events-none" style={{ borderBottom: '1px solid #22c55e', borderRight: '1px solid #22c55e', opacity: 0.35 }} />

                        {/* Title + menu */}
                        <div className="relative z-10 flex flex-col items-center">
                            <MenuTitle />
                            {/* Subtitle with emphasized initials */}
                            <p style={{
                                fontFamily: "'VT323', 'Courier New', monospace",
                                color: '#22c55e',
                                letterSpacing: '0.25em',
                                lineHeight: 1,
                                marginTop: '0.1em',
                                marginBottom: '0',
                                opacity: 0.7,
                                fontSize: 'clamp(0.75rem, 2vw, 1.05rem)',
                            }}>
                                <span style={{ fontSize: '1.6em', color: '#39ff7a', opacity: 1, textShadow: '0 0 6px rgba(57,255,122,0.7)' }}>G</span>OVERNMENT{' '}
                                <span style={{ fontSize: '1.6em', color: '#39ff7a', opacity: 1, textShadow: '0 0 6px rgba(57,255,122,0.7)' }}>R</span>UNTIME{' '}
                                <span style={{ fontSize: '1.6em', color: '#39ff7a', opacity: 1, textShadow: '0 0 6px rgba(57,255,122,0.7)' }}>I</span>NJECTION{' '}
                                <span style={{ fontSize: '1.6em', color: '#39ff7a', opacity: 1, textShadow: '0 0 6px rgba(57,255,122,0.7)' }}>D</span>AEMON
                            </p>
                            <div className="flex flex-col gap-3 mt-10 w-full">
                                <button
                                    style={{
                                        fontFamily: "'VT323', 'Courier New', monospace",
                                        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                        color: '#39ff7a',
                                        letterSpacing: '0.2em',
                                        border: '1px solid rgba(57,255,122,0.5)',
                                        textShadow: '0 0 8px rgba(57,255,122,0.6)',
                                        boxShadow: '0 0 12px rgba(57,255,122,0.08) inset',
                                        background: 'transparent',
                                        padding: '0.4em 2em',
                                        transition: 'background 0.15s, box-shadow 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(57,255,122,0.08)';
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(57,255,122,0.2) inset';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(57,255,122,0.08) inset';
                                    }}
                                    onClick={handleStart}
                                >
                                    &gt; NEW RUN
                                </button>
                                {gameState !== 'MENU' && (
                                    <button
                                        style={{
                                            fontFamily: "'VT323', 'Courier New', monospace",
                                            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                                            color: '#22c55e',
                                            letterSpacing: '0.2em',
                                            border: '1px solid rgba(34,197,94,0.4)',
                                            textShadow: '0 0 8px rgba(34,197,94,0.4)',
                                            boxShadow: '0 0 12px rgba(34,197,94,0.06) inset',
                                            background: 'transparent',
                                            padding: '0.4em 2em',
                                            transition: 'background 0.15s, box-shadow 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(34,197,94,0.08)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(34,197,94,0.15) inset';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(34,197,94,0.06) inset';
                                        }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        &gt; CONTINUE
                                    </button>
                                )}
                            </div>
                        </div>

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
                        className="absolute inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <h1 className="text-6xl font-black text-green-400 mb-4 tracking-tighter">ROOT ACCESS GRANTED</h1>
                        <div className="text-xl text-white/70 mb-8 font-mono">PAYLOAD DELIVERED. CREDITS: {credits}</div>
                        <button
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-xl shadow-lg transition-all hover:scale-105"
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
