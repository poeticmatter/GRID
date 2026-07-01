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
    public const int GridConsolePad = 8;
    public const int ConsoleBorder = 2;

    public const int LayerRowHeight = 14;
    public const int LayerRowGap = 2;
    public const int LayerVisibleRows = 5;
    public const int LayerConsolePad = 6;
    // LayerConsoleWidth is TBD (UIUX §3.3 — lock when layer card content is designed).
    public const int LayerConsoleWidth = 200;

    public const int ConsoleSeparatorGap = 6;

    // Top margin above the stacked consoles. Drawn from the 28px middle-zone headroom
    // (UIUX §3.4); the remainder falls below as bottom margin.
    public const int ConsoleTopMargin = 10;

    // ── Derived console geometry (single source of truth for render + input) ─────
    // These are computed from the locked values above so the renderer and the input
    // hit-tester can never drift out of agreement.

    public const int GridContentSize = (GridCols * CellSize) + ((GridCols - 1) * CellGap);          // 86
    public const int GridConsoleSize = GridContentSize + (2 * GridConsolePad) + (2 * ConsoleBorder); // 106

    public const int LayerContentHeight = (LayerVisibleRows * LayerRowHeight) + ((LayerVisibleRows - 1) * LayerRowGap); // 78
    public const int LayerConsoleHeight = LayerContentHeight + (2 * LayerConsolePad) + (2 * ConsoleBorder);             // 98

    public const int ServerConsoleX = (InternalWidth - LayerConsoleWidth) / 2; // 140
    public const int ServerConsoleY = ResourceBarHeight + ConsoleTopMargin;    // 24

    public const int GridConsoleX = (InternalWidth - GridConsoleSize) / 2;                 // 187
    public const int GridConsoleY = ServerConsoleY + LayerConsoleHeight + ConsoleSeparatorGap; // 128

    public const int GridContentOriginX = GridConsoleX + ConsoleBorder + GridConsolePad; // 197
    public const int GridContentOriginY = GridConsoleY + ConsoleBorder + GridConsolePad; // 138

    /// <summary>Top-left corner of a grid cell in internal (480×270) space.</summary>
    public static (int X, int Y) CellOrigin(int col, int row) =>
        (GridContentOriginX + col * (CellSize + CellGap),
         GridContentOriginY + row * (CellSize + CellGap));

    // ── Provisional UI text / panel constants ───────────────────────────────────
    // Side-panel sizing is TBD (UIUX §3.5); these lock the current procedural layout
    // so no pixel or font-size literals live inside draw calls.

    public const int FontSizeSmall = 8;
    public const int FontSizeMedium = 9;
    public const int FontSizeNormal = 10;
    public const int TextPadding = 4;

    public const int CellSymbolPadding = 4;

    public const int HardwarePanelX = 10;
    public const int SoftwarePanelX = 350;
    public const int PanelHeaderY = ResourceBarHeight + 10;
    public const int PanelFirstRowY = ResourceBarHeight + 25;
    public const int PanelRowGap = 12;

    public const int PromptWidth = 310;
    public const int PromptHeight = 120;
    public const int PromptLineGap = 15;
}
