import type { NetworkNode, Cell, CellColor, CellSymbol, Card, Coordinate, CountermeasurePayload } from './types';

export const calculateServerProgress = (server: NetworkNode, cutCells: Cell[]): {
  updatedServer: NetworkNode,
  hacked: boolean,
  pushedCountermeasures: CountermeasurePayload[]
} => {
  // Pool of available resources
  const availableColors: Partial<Record<CellColor, number>> = {};
  const availableSymbols: Partial<Record<CellSymbol, number>> = {};

  cutCells.forEach(cell => {
    availableColors[cell.color] = (availableColors[cell.color] || 0) + 1;
    if (cell.symbol !== 'NONE') {
      availableSymbols[cell.symbol] = (availableSymbols[cell.symbol] || 0) + 1;
    }
  });

  const newProgress = [...server.progress];
  const pushedCountermeasures: CountermeasurePayload[] = [];

  for (let i = 0; i < server.requirements.length; i++) {
    if (newProgress[i]) continue; // Already cleared

    const slot = server.requirements[i];

    // Check if we have the color
    if ((availableColors[slot.color] || 0) > 0) {
      // Consume color and mark cleared
      availableColors[slot.color]! -= 1;
      newProgress[i] = true;

      // Crucial Logic: If the cleared slot contains a symbol, check if the program's pool also contains that symbol.
      if (slot.symbol !== 'NONE') {
        if ((availableSymbols[slot.symbol] || 0) > 0) {
          // Consume symbol
          availableSymbols[slot.symbol]! -= 1;
        } else {
          // Did not have symbol, push countermeasure
          const cm = server.countermeasures[slot.symbol];
          if (cm) {
            pushedCountermeasures.push({ ...cm }); // copy it to be safe
          }
        }
      }
    }
  }

  const hacked = newProgress.every(p => p) && newProgress.length === server.requirements.length;

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
