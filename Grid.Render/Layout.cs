namespace Grid.Render;

public static class Layout
{
    public const int InternalWidth = 480;
    public const int InternalHeight = 270;

    public const int ResourceBarHeight = 14;
    public const int ActionBarHeight = 18;
    // MiddleZoneHeight = InternalHeight - ResourceBarHeight - ActionBarHeight = 238

    public const int CellSize = 20;
    public const int CellGap = 2;
    public const int GridCols = 4;
    public const int GridRows = 4;
    // GridContentSize = (GridCols * CellSize) + ((GridCols - 1) * CellGap) = 86
    public const int GridConsolePad = 8;
    public const int ConsoleBorder = 2;
    // GridConsoleSize = GridContentSize + (2 * GridConsolePad) + (2 * ConsoleBorder) = 106

    public const int LayerRowHeight = 14;
    public const int LayerRowGap = 2;
    public const int LayerVisibleRows = 5;
    // LayerContentHeight = (LayerVisibleRows * LayerRowHeight) + ((LayerVisibleRows - 1) * LayerRowGap) = 78
    public const int LayerConsolePad = 6;
    // LayerConsoleHeight = LayerContentHeight + (2 * LayerConsolePad) + (2 * ConsoleBorder) = 98
    // LayerConsoleWidth = TBD
    public const int LayerConsoleWidth = 200; // Locked in for now until layer card content designed

    public const int ConsoleSeparatorGap = 6;
}
