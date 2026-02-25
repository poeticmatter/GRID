import type { Grid, Cell, CellColor, CellSymbol, Coordinate } from './types';

const COLORS: CellColor[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
const SYMBOLS: CellSymbol[] = ['SHIELD', 'EYE', 'SKULL', 'NONE']; // 'NONE' is common

export const createGrid = (rows: number, cols: number): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < rows; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push(createRandomCell(x, y));
    }
    grid.push(row);
  }
  return grid;
};

export const createRandomCell = (x: number, y: number): Cell => {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  // 30% chance of having a symbol
  const hasSymbol = Math.random() < 0.3;
  const symbol = hasSymbol
    ? SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))] // Exclude NONE from random pick if hasSymbol is true
    : 'NONE';

  return {
    id: `${x}-${y}-${Date.now()}-${Math.random()}`,
    x,
    y,
    color,
    symbol: symbol as CellSymbol,
    state: 'LOCKED',
  };
};

export const isValidCoordinate = (grid: Grid, x: number, y: number): boolean => {
  if (!grid || grid.length === 0) return false;
  const rows = grid.length;
  const cols = grid[0].length;
  return y >= 0 && y < rows && x >= 0 && x < cols;
};

export const checkPatternFit = (grid: Grid, pattern: Coordinate[], centerX: number, centerY: number): boolean => {
  // Check if all relative coordinates land on valid grid cells that are NOT BROKEN
  return pattern.every(({ x: dx, y: dy }) => {
    const targetX = centerX + dx;
    const targetY = centerY + dy;

    if (!isValidCoordinate(grid, targetX, targetY)) {
      return false; // Out of bounds
    }

    const cell = grid[targetY][targetX];
    return cell.state !== 'BROKEN'; // Can't cut empty space
  });
};

export const getAffectedCells = (grid: Grid, pattern: Coordinate[], centerX: number, centerY: number): Cell[] => {
  const affected: Cell[] = [];

  pattern.forEach(({ x: dx, y: dy }) => {
    const targetX = centerX + dx;
    const targetY = centerY + dy;

    if (isValidCoordinate(grid, targetX, targetY)) {
      affected.push(grid[targetY][targetX]);
    }
  });

  return affected;
};

export const refillGrid = (grid: Grid, amount: number): Grid => {
  // Deep clone grid to avoid mutation
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  let filledCount = 0;
  const emptyCells: Coordinate[] = [];

  // Find all BROKEN cells
  for (let y = 0; y < newGrid.length; y++) {
    for (let x = 0; x < newGrid[0].length; x++) {
      if (newGrid[y][x].state === 'BROKEN') {
        emptyCells.push({ x, y });
      }
    }
  }

  // Shuffle empty cells to fill randomly
  for (let i = emptyCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
  }

  // Fill up to 'amount'
  for (let i = 0; i < Math.min(amount, emptyCells.length); i++) {
    const { x, y } = emptyCells[i];
    newGrid[y][x] = createRandomCell(x, y);
    filledCount++;
  }

  return newGrid;
};
