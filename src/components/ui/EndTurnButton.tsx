import { Dispatch } from '../../engine/orchestrator';

export const EndTurnButton = () => {
    return (
        <button
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded shadow-lg transition-colors border-2 border-rose-800"
            onClick={() => Dispatch({ type: 'END_TURN' })}
        >
            END CYCLE
        </button>
    );
};
