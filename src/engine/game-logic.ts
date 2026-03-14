import { produce } from 'immer';
import type { NetworkNode, Cell, CellColor, CellSymbol, Card, CountermeasurePayload } from './types';
import { cardRegistry } from './registry/CardRegistry';

export const calculateServerProgress = (server: NetworkNode, cutCells: Cell[]): {
  updatedServer: NetworkNode,
  hacked: boolean,
  pushedCountermeasures: CountermeasurePayload[]
} => {
  // Initialize Tallies & Flags
  const harvestedSymbols = {} as Record<CellSymbol, number>;
  cutCells.forEach(cell => {
    if (cell.state !== 'BROKEN' && cell.symbol !== 'NONE') {
      harvestedSymbols[cell.symbol] = (harvestedSymbols[cell.symbol] || 0) + 1;
    }
  });

  const codeColors = {} as Record<CellColor, number>;
  cutCells.forEach(cell => {
    if (cell.state !== 'BROKEN') {
      codeColors[cell.color] = (codeColors[cell.color] || 0) + 1;
    }
  });

  const pushedCountermeasures: CountermeasurePayload[] = [];
  let hacked = true;
  let didAlterNode = false;

  const updatedServer = produce(server, (draft) => {
    // 1. Evaluate Layer Progress
    for (const [colorStr, requirements] of Object.entries(draft.layers)) {
      const color = colorStr as CellColor;
      if (!requirements || requirements.length === 0) continue;

      const progressLane = draft.progress[color] || new Array(requirements.length).fill(false);
      const firstActiveIndex = progressLane.findIndex(p => !p);

      if (firstActiveIndex !== -1) {
        const harvested = codeColors[color] || 0;

        if (harvested > 0) {
          let harvested_accumulator = harvested;

          for (let i = firstActiveIndex; i < requirements.length; i++) {
            if (!progressLane[i]) {
              const requirement = requirements[i];
              if (harvested_accumulator >= requirement) {
                progressLane[i] = true;
                harvested_accumulator -= requirement;
                didAlterNode = true; // Flag identifying the node was altered
              } else {
                break;
              }
            }
          }
        }
      }

      // Re-verify if this specific lane is fully completed
      if (progressLane.some(p => !p) || progressLane.length < requirements.length) {
        hacked = false;
      }

      draft.progress[color] = progressLane;
    }

    if (hacked) {
      draft.status = 'HACKED';
    }

    // 2. Evaluate Countermeasures
    if (didAlterNode && draft.countermeasures) {
      for (const cm of draft.countermeasures) {
        let activated = false;

        const requiredTally = {} as Record<CellSymbol, number>;
        for (const sym of cm.requiredSymbols) {
          if (sym !== 'NONE') {
            requiredTally[sym] = (requiredTally[sym] || 0) + 1;
          }
        }

        // Activation check: Trigger if harvested count is strictly less than required count
        // If requiredSymbols is empty, activated remains false.
        for (const symStr of Object.keys(requiredTally)) {
          const sym = symStr as CellSymbol;
          const needed = requiredTally[sym];
          const harvested = harvestedSymbols[sym] || 0;

          if (harvested < needed) {
            activated = true;
            break;
          }
        }

        if (activated) {
          pushedCountermeasures.push({ type: cm.type, value: cm.value });
        }
      }
    }
  });

  return {
    updatedServer: updatedServer as NetworkNode,
    hacked,
    pushedCountermeasures
  };
};

export const createStartingDeck = (): Card[] => {
  const deck = cardRegistry.getStartingCards();

  // Shuffle using produce for a clean copy
  return produce(deck, (draft) => {
    for (let i = draft.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [draft[i], draft[j]] = [draft[j], draft[i]];
    }
  });
};
