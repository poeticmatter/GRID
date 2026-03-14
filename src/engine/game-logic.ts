import { produce } from 'immer';
import type { NetworkNode, Cell, CellColor, CellSymbol, Card, CountermeasurePayload } from './types';
import { cardRegistry } from './registry/CardRegistry';

export const calculateServerProgress = (server: NetworkNode, cutCells: Cell[]): {
  updatedServer: NetworkNode,
  hacked: boolean,
  pushedCountermeasures: CountermeasurePayload[]
} => {
  const codeColors = {} as Record<CellColor, number>;
  cutCells.forEach(cell => {
    codeColors[cell.color] = (codeColors[cell.color] || 0) + 1;
  });

  const pushedCountermeasures: CountermeasurePayload[] = [];
  let hacked = true;
  let didAlterNode = false;

  const updatedServer = produce(server, (draft) => {
    // Iterate over only the Layer lanes matching the node's definition
    for (const [colorStr, requirements] of Object.entries(draft.layers)) {
      const color = colorStr as CellColor;
      if (!requirements || requirements.length === 0) continue;

      const progressLane = draft.progress[color] || new Array(requirements.length).fill(false);
      const firstActiveIndex = progressLane.findIndex(p => !p);

      if (firstActiveIndex !== -1) {
        const harvested = codeColors[color] || 0;

        if (harvested > 0) {
          let harvested_accumulator = harvested;

          // Sequential progression
          for (let i = firstActiveIndex; i < requirements.length; i++) {
            if (!progressLane[i]) {
              const requirement = requirements[i];
              if (harvested_accumulator >= requirement) {
                progressLane[i] = true;
                harvested_accumulator -= requirement;
                didAlterNode = true;
              } else {
                break;
              }
            }
          }
        }
      }

      // Re-check hacked status for this lane
      if (progressLane.some(p => !p) || progressLane.length < requirements.length) {
        hacked = false;
      }

      draft.progress[color] = progressLane;
    }

    if (hacked) {
      draft.status = 'HACKED';
    }
  });

  // Evaluate countermeasures: only if the run altered node progress
  if (didAlterNode) {
    // Tally all CellSymbols harvested from the run
    const symbolTally = {} as Record<CellSymbol, number>;
    for (const cell of cutCells) {
      if (cell.symbol !== 'NONE') {
        symbolTally[cell.symbol] = (symbolTally[cell.symbol] || 0) + 1;
      }
    }

    for (const cm of server.countermeasures) {
      // Tally required symbols for this countermeasure
      const requiredTally = {} as Record<CellSymbol, number>;
      for (const sym of cm.requiredSymbols) {
        requiredTally[sym] = (requiredTally[sym] || 0) + 1;
      }

      // Check if the run's harvest satisfies ALL required symbols
      let satisfied = true;
      for (const [sym, needed] of Object.entries(requiredTally)) {
        if ((symbolTally[sym as CellSymbol] || 0) < needed) {
          satisfied = false;
          break;
        }
      }

      // If NOT satisfied → countermeasure activates
      if (!satisfied) {
        pushedCountermeasures.push({ type: cm.type, value: cm.value });
      }
    }
  }

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
