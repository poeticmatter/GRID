import type { NetworkNode, Cell, CellColor, CellSymbol, Card, CountermeasurePayload } from './types';
import { cardRegistry } from './registry/CardRegistry';

export const calculateServerProgress = (server: NetworkNode, cutCells: Cell[]): {
  updatedServer: NetworkNode,
  hacked: boolean,
  pushedCountermeasures: CountermeasurePayload[]
} => {
  // Tally harvested Code
  const codeColors = {} as Record<CellColor, number>;
  const codeSymbols = {} as Record<CellSymbol, number>;

  cutCells.forEach(cell => {
    codeColors[cell.color] = (codeColors[cell.color] || 0) + 1;
    if (cell.symbol !== 'NONE') {
      codeSymbols[cell.symbol] = (codeSymbols[cell.symbol] || 0) + 1;
    }
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

    const progressLane = newProgress[color] || [];

    for (let i = 0; i < requirements.length; i++) {
      if (progressLane[i]) continue; // Already cleared

      const slot = requirements[i];

      // Check if we have Code of this color available
      if ((codeColors[color] || 0) > 0) {
        // Consume one color Code and mark cleared
        codeColors[color]! -= 1;
        progressLane[i] = true;

        if (slot.symbol !== 'NONE') {
          if ((codeSymbols[slot.symbol] || 0) > 0) {
            codeSymbols[slot.symbol]! -= 1;
          } else {
            const cm = server.countermeasures[slot.symbol];
            if (cm) {
              pushedCountermeasures.push({ ...cm });
            }
          }
        }
      } else {
        // Out of Code for this color lane, break and move to the next color lane
        break;
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
