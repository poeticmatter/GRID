import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogStore } from '../../store/useLogStore';
import type { LogEntry } from '../../store/useLogStore';

const TYPE_STYLE: Record<LogEntry['type'], string> = {
    info:    'text-green-500/60',
    warning: 'text-yellow-400/80',
    danger:  'text-red-400',
};

const TYPE_PREFIX: Record<LogEntry['type'], string> = {
    info:    '>_',
    warning: '!!',
    danger:  '##',
};

export const ActionLog = () => {
    const entries = useLogStore(state => state.entries);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries.length]);

    return (
        <div className="fixed bottom-4 left-2 sm:left-4 z-[55] w-[clamp(160px,22vw,240px)] pointer-events-none select-none">
            <div className="flex flex-col gap-0.5 max-h-[clamp(80px,18vh,140px)] overflow-hidden">
                <AnimatePresence initial={false}>
                    {entries.slice(-10).map((entry, idx, arr) => {
                        // Fade older entries progressively
                        const age = arr.length - 1 - idx;
                        const opacity = Math.max(0.15, 1 - age * 0.12);
                        return (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.15 }}
                                className={`flex items-start gap-1 font-mono text-[9px] leading-tight ${TYPE_STYLE[entry.type]}`}
                            >
                                <span className="shrink-0 font-bold opacity-70">{TYPE_PREFIX[entry.type]}</span>
                                <span className="break-all">{entry.message}</span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
