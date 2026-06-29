using Raylib_cs;

namespace Grid.Render;

public static class Palette
{
    public static readonly Color Cyan = new(0x00, 0xC8, 0xFF, 0xFF);
    public static readonly Color Pink = new(0xFF, 0x2D, 0x78, 0xFF);
    public static readonly Color Amber = new(0xFF, 0xB3, 0x00, 0xFF);
    public static readonly Color Violet = new(0x9B, 0x30, 0xFF, 0xFF);

    public static readonly Color SymbolOnCyan = new(0x0A, 0x0A, 0x0A, 0xFF); // Black
    public static readonly Color SymbolOnPink = new(0x0A, 0x0A, 0x0A, 0xFF); // Black
    public static readonly Color SymbolOnAmber = new(0x0A, 0x0A, 0x0A, 0xFF); // Black
    public static readonly Color SymbolOnViolet = new(0xF0, 0xF0, 0xF0, 0xFF); // White

    public static readonly Color Background = new(0x11, 0x11, 0x11, 0xFF);
    public static readonly Color UIElement = new(0x33, 0x33, 0x33, 0xFF);
    public static readonly Color Text = new(0xEE, 0xEE, 0xEE, 0xFF);
    public static readonly Color Corrupt = new(0x55, 0x55, 0x55, 0xFF);
}
