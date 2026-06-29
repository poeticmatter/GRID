namespace Grid.Core;

public record Cell(CellColor Color, CellSymbol Symbol, bool IsCorrupt = false);
