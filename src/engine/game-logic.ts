import type { NetworkNode, Cell, CellColor, CellSymbol, NodeRequirements, Card, Coordinate } from './types';

export const calculateServerProgress = (server: NetworkNode, cutCells: Cell[]): {
  updatedServer: NetworkNode,
  hacked: boolean,
  penaltyTriggered: boolean
} => {
  // Deep copy server progress
  const newProgress: NodeRequirements = {
    colors: { ...server.progress.colors },
    symbols: { ...(server.progress.symbols || {}) }
  };

  // Tally cut cells
  const cutColors: Record<string, number> = {};
  const cutSymbols: Record<string, number> = {};

  cutCells.forEach(cell => {
    cutColors[cell.color] = (cutColors[cell.color] || 0) + 1;
    if (cell.symbol !== 'NONE') {
      cutSymbols[cell.symbol] = (cutSymbols[cell.symbol] || 0) + 1;
    }
  });

  // Update progress
  let hacked = true;

  // Check Color Requirements
  const reqColors = server.requirements.colors;
  if (reqColors) {
    (Object.entries(reqColors) as [CellColor, number][]).forEach(([color, reqAmount]) => {
      if (!reqAmount) return;
      const current = newProgress.colors[color] || 0;
      const added = cutColors[color] || 0;

      // Update progress
      const total = current + added;
      newProgress.colors[color] = Math.min(reqAmount, total);

      // Check if this specific requirement is met
      if (total < reqAmount) {
        hacked = false;
      }
    });
  } else {
    // Should not happen, but if no requirements, assume hacked?
    hacked = true;
  }

  // Check Countermeasures (Symbols)
  let penaltyTriggered = false;
  const reqSymbols = server.requirements.symbols || {};

  if (reqSymbols) {
    (Object.entries(reqSymbols) as [CellSymbol, number][]).forEach(([symbol, reqAmount]) => {
      if (!reqAmount) return;
      // Check if this cut provides the symbol
      if ((cutSymbols[symbol] || 0) < reqAmount) {
        penaltyTriggered = true;
      }
    });
  }

  return {
    updatedServer: {
      ...server,
      progress: newProgress,
      status: hacked ? 'HACKED' : 'ACTIVE' // Only updates status if hacked.
      // If it was already HACKED, it should stay HACKED, but this function is likely called on ACTIVE servers.
    },
    hacked,
    penaltyTriggered
  };
};

export const createStartingDeck = (): Card[] => {
  const basicPatterns: { name: string, pattern: Coordinate[], color: CellColor }[] = [
    { name: 'Line H', pattern: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }], color: 'BLUE' },
    { name: 'Line V', pattern: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }], color: 'RED' },
    { name: 'Square', pattern: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], color: 'GREEN' },
    { name: 'T-Shape', pattern: [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }], color: 'YELLOW' },
    { name: 'L-Shape', pattern: [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }], color: 'PURPLE' },
  ];

  // Create exactly 4 cut cards
  const deck: Card[] = [];
  let id = 0;

  for (let i = 0; i < 4; i++) {
    const p = basicPatterns[i];
    deck.push({
      id: `card-${id++}`,
      name: p.name,
      visualColor: p.color,
      effects: [
        { type: 'CUT', pattern: p.pattern },
        { type: 'REPROGRAM', amount: 2 }
      ]
    });
  }

  // Add 1 Reset Card
  deck.push({
    id: `card-${id++}`,
    name: 'SYS/RESET',
    visualColor: 'RED',
    effects: [
      { type: 'SYSTEM_RESET' },
      { type: 'REPROGRAM', amount: 2 }
    ]
  });

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};
