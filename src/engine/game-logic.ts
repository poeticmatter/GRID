import type { NetworkNode, Cell, CellColor, Card, CountermeasurePayload } from './types';
import { cardRegistry } from './registry/CardRegistry';

export const calculateServerProgress = (server: NetworkNode, cutCells: Cell[]): {
  updatedServer: NetworkNode,
  hacked: boolean,
  pushedCountermeasures: CountermeasurePayload[]
} => {
  // Tally harvested Code
  const codeColors = {} as Record<CellColor, number>;

  cutCells.forEach(cell => {
    codeColors[cell.color] = (codeColors[cell.color] || 0) + 1;
  });

  // Deep copy the progress dictionaries
  const newProgress: Partial<Record<CellColor, boolean[]>> = {};
  for (const [colorStr, lanes] of Object.entries(server.progress)) {
    const color = colorStr as CellColor;
    if (lanes) {
      newProgress[color] = [...lanes];
    }
  }

  const pushedCountermeasures: CountermeasurePayload[] = [];
  let hacked = true;

  // Iterate over only the Layer lanes matching the node's definition
  for (const [colorStr, requirements] of Object.entries(server.layers)) {
    const color = colorStr as CellColor;
    if (!requirements || requirements.length === 0) continue;

    const progressLane = newProgress[color] || new Array(requirements.length).fill(false);

    const firstActiveIndex = progressLane.findIndex(p => !p);

    if (firstActiveIndex !== -1) {
      const harvested = codeColors[color] || 0;

      if (harvested > 0) {
        // Countermeasure Rule: Interacted with an active layer color, trigger countermeasure unconditionally exactly once
        const cm = server.countermeasures[color];
        if (cm) {
          pushedCountermeasures.push({ ...cm });
        }

        let harvested_accumulator = harvested;

        // The Cascading Threshold Rule
        for (let i = firstActiveIndex; i < requirements.length; i++) {
          if (!progressLane[i]) {
            const requirement = requirements[i];
            if (harvested_accumulator >= requirement) {
              progressLane[i] = true;
              harvested_accumulator -= requirement;
            } else {
              break; // Halt progression for this color immediately
            }
          }
        }
      }
    }

    // After attempting to clear, check if this lane is fully cleared
    if (progressLane.some(p => !p) || progressLane.length < requirements.length) {
      hacked = false;
    }

    newProgress[color] = progressLane;
  }

  return {
    updatedServer: {
      ...server,
      progress: newProgress,
      status: hacked ? 'HACKED' : server.status
    },
    hacked,
    pushedCountermeasures
  };
};

export const createStartingDeck = (): Card[] => {
  const deck = cardRegistry.getStartingCards();

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};
