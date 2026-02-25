import type { ServerNode, Cell, CellColor, CellSymbol, ServerRequirements, Card, Coordinate } from './types';

const SERVER_NAMES = [
  'Node-Alpha', 'Proxy-Beta', 'Firewall-Gamma', 'Gateway-Delta',
  'Core-Epsilon', 'Data-Zeta', 'Link-Eta', 'Root-Theta'
];

export const generateServerNode = (difficulty: number, idOffset: number): ServerNode => {
  const colorReqs: Partial<Record<CellColor, number>> = {};
  const colors: CellColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];

  // Randomly pick 1-2 colors for requirements
  const numColors = Math.random() < 0.7 ? 1 : 2;
  for (let i = 0; i < numColors; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    // Base requirement scales with difficulty
    const amount = Math.floor(2 + difficulty * 1.5);
    colorReqs[color] = (colorReqs[color] || 0) + amount;
  }

  // Random countermeasure (symbol requirement)
  const symbolReqs: Partial<Record<CellSymbol, number>> = {};
  if (difficulty > 2 && Math.random() < 0.4) {
    const symbols: CellSymbol[] = ['SHIELD', 'EYE', 'SKULL'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    symbolReqs[symbol] = 1; // Require 1 symbol to avoid penalty
  }

  const penaltyType = Math.random() < 0.33 ? 'TRACE' : (Math.random() < 0.5 ? 'HARDWARE_DAMAGE' : 'NET_DAMAGE');

  return {
    id: `server-${idOffset}`,
    name: SERVER_NAMES[idOffset % SERVER_NAMES.length] + `-${difficulty}`,
    difficulty,
    requirements: { colors: colorReqs, symbols: symbolReqs },
    progress: { colors: {}, symbols: {} },
    penaltyType: penaltyType as 'TRACE' | 'HARDWARE_DAMAGE' | 'NET_DAMAGE',
    penaltyValue: Math.floor(10 + difficulty * 5),
    status: 'ACTIVE',
  };
};

export const calculateServerProgress = (server: ServerNode, cutCells: Cell[]): {
  updatedServer: ServerNode,
  hacked: boolean,
  penaltyTriggered: boolean
} => {
  // Deep copy server progress
  const newProgress: ServerRequirements = {
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

  // Create 15 cards (3 of each)
  const deck: Card[] = [];
  let id = 0;

  for (let i = 0; i < 3; i++) {
    basicPatterns.forEach(p => {
      deck.push({
        id: `card-${id++}`,
        name: p.name,
        pattern: p.pattern,
        visualColor: p.color,
        action: 'CUT'
      });
    });
  }

  // Add 2 Reset Cards
  deck.push({
    id: `card-${id++}`,
    name: 'SYS/RESET',
    pattern: [],
    visualColor: 'RED',
    action: 'RESET'
  });
  deck.push({
    id: `card-${id++}`,
    name: 'SYS/RESET',
    pattern: [],
    visualColor: 'RED',
    action: 'RESET'
  });

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};
