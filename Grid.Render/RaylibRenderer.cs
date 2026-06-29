using Raylib_cs;
using Grid.Core;

namespace Grid.Render;

public class RaylibRenderer : IRenderer
{
    private RenderTexture2D _target;

    public void Initialize()
    {
        Raylib.InitWindow(Layout.InternalWidth * 2, Layout.InternalHeight * 2, "GRID");
        Raylib.SetTargetFPS(60);

        _target = Raylib.LoadRenderTexture(Layout.InternalWidth, Layout.InternalHeight);
        Raylib.SetTextureFilter(_target.Texture, TextureFilter.Point);
    }

    public void BeginFrame()
    {
        Raylib.BeginTextureMode(_target);
        Raylib.ClearBackground(Palette.Background);
    }

    public void RenderMission(Mission mission)
    {
        DrawResourceBar(mission);
        DrawServerConsole(mission);
        DrawGridConsole(mission);
        DrawActionBar(mission);

        if (mission.State == MissionState.Prompt)
        {
            DrawPrompt(mission);
        }
    }

    private void DrawResourceBar(Mission mission)
    {
        Raylib.DrawRectangle(0, 0, Layout.InternalWidth, Layout.ResourceBarHeight, Palette.UIElement);
        Raylib.DrawText($"Trace: {mission.Trace.Value}/{mission.Trace.Max}  Compute: {mission.Compute.Value}/{mission.Compute.Max}  Credits: {mission.Credits}", 4, 2, 10, Palette.Text);
    }

    private void DrawServerConsole(Mission mission)
    {
        int totalHeight = (Layout.LayerVisibleRows * Layout.LayerRowHeight) + ((Layout.LayerVisibleRows - 1) * Layout.LayerRowGap) + (2 * Layout.LayerConsolePad) + (2 * Layout.ConsoleBorder);
        int totalWidth = Layout.LayerConsoleWidth;

        int startY = Layout.ResourceBarHeight + 10;
        int startX = (Layout.InternalWidth - totalWidth) / 2;

        Raylib.DrawRectangleLines(startX, startY, totalWidth, totalHeight, Palette.UIElement);

        int rowY = startY + Layout.ConsoleBorder + Layout.LayerConsolePad;

        for (int i = 0; i < mission.Layers.Count; i++)
        {
            if (i >= Layout.LayerVisibleRows) break; // Simplified scrolling for now
            var layer = mission.Layers[i];

            string reqText = string.Join(", ", layer.Requirement.RequiredColors);
            if (layer.Requirement.WildcardCount > 0)
                reqText += $" (+{layer.Requirement.WildcardCount} wild)";

            string state = layer.IsBypassed ? "[Bypassed]" : (layer.IsProbed ? "[Probed]" : "[Unprobed]");
            string text = $"Layer {i + 1}: {reqText} {state}";

            if (i == mission.CurrentLayerIndex && mission.State != MissionState.Idle)
            {
                text = "-> " + text;
            }

            Raylib.DrawText(text, startX + Layout.ConsoleBorder + Layout.LayerConsolePad, rowY, 10, Palette.Text);
            rowY += Layout.LayerRowHeight + Layout.LayerRowGap;
        }
    }

    private void DrawGridConsole(Mission mission)
    {
        int gridContentSize = (Layout.GridCols * Layout.CellSize) + ((Layout.GridCols - 1) * Layout.CellGap);
        int totalSize = gridContentSize + (2 * Layout.GridConsolePad) + (2 * Layout.ConsoleBorder);

        int serverHeight = (Layout.LayerVisibleRows * Layout.LayerRowHeight) + ((Layout.LayerVisibleRows - 1) * Layout.LayerRowGap) + (2 * Layout.LayerConsolePad) + (2 * Layout.ConsoleBorder);
        int startY = Layout.ResourceBarHeight + 10 + serverHeight + Layout.ConsoleSeparatorGap;
        int startX = (Layout.InternalWidth - totalSize) / 2;

        Raylib.DrawRectangleLines(startX, startY, totalSize, totalSize, Palette.UIElement);

        int contentStartX = startX + Layout.ConsoleBorder + Layout.GridConsolePad;
        int contentStartY = startY + Layout.ConsoleBorder + Layout.GridConsolePad;

        for (int y = 0; y < Layout.GridRows; y++)
        {
            for (int x = 0; x < Layout.GridCols; x++)
            {
                var cell = mission.Grid.GetCell(x, y);
                if (cell == null) continue;

                int cellX = contentStartX + x * (Layout.CellSize + Layout.CellGap);
                int cellY = contentStartY + y * (Layout.CellSize + Layout.CellGap);

                Color bgColor = cell.Color switch
                {
                    CellColor.Cyan => Palette.Cyan,
                    CellColor.Pink => Palette.Pink,
                    CellColor.Amber => Palette.Amber,
                    CellColor.Violet => Palette.Violet,
                    _ => Palette.UIElement
                };

                Color symbolColor = cell.Color switch
                {
                    CellColor.Cyan => Palette.SymbolOnCyan,
                    CellColor.Pink => Palette.SymbolOnPink,
                    CellColor.Amber => Palette.SymbolOnAmber,
                    CellColor.Violet => Palette.SymbolOnViolet,
                    _ => Palette.Text
                };

                Raylib.DrawRectangle(cellX, cellY, Layout.CellSize, Layout.CellSize, bgColor);
                Raylib.DrawRectangleLines(cellX, cellY, Layout.CellSize, Layout.CellSize, Palette.Text); // Border

                // Draw Symbol (Simplified as text for now, should be shapes)
                string symbolChar = cell.Symbol switch
                {
                    CellSymbol.Circle => "O",
                    CellSymbol.Square => "[]",
                    CellSymbol.Triangle => "^",
                    CellSymbol.Diamond => "<>",
                    _ => "?"
                };

                int textW = Raylib.MeasureText(symbolChar, 10);
                Raylib.DrawText(symbolChar, cellX + (Layout.CellSize - textW) / 2, cellY + 5, 10, symbolColor);

                // Highlight if selected
                if (mission.SelectedCells.Contains((x, y)))
                {
                    Raylib.DrawRectangle(cellX, cellY, Layout.CellSize, Layout.CellSize, new Color(255, 255, 255, 100));
                }
            }
        }
    }

    private void DrawActionBar(Mission mission)
    {
        Raylib.DrawRectangle(0, Layout.InternalHeight - Layout.ActionBarHeight, Layout.InternalWidth, Layout.ActionBarHeight, Palette.UIElement);
        string text = $"[E]xecute (Cost: {Compute.CalculateCost(mission.SelectedCells.Count)}) | [H]ard Reset (-3 trace) | [S]oft Reset (-2 trace)";
        Raylib.DrawText(text, 4, Layout.InternalHeight - Layout.ActionBarHeight + 4, 10, Palette.Text);
    }

    private void DrawPrompt(Mission mission)
    {
        int w = 250, h = 100;
        int x = (Layout.InternalWidth - w) / 2;
        int y = (Layout.InternalHeight - h) / 2;

        Raylib.DrawRectangle(x, y, w, h, Palette.Background);
        Raylib.DrawRectangleLines(x, y, w, h, Palette.Text);

        Raylib.DrawText("PROMPT", x + 10, y + 10, 10, Palette.Text);
        Raylib.DrawText("Blocked by Layer", x + 10, y + 25, 10, Palette.Text);
        Raylib.DrawText("[B]rute Force (2 Compute)", x + 10, y + 45, 10, Palette.Text);
        Raylib.DrawText("[P]asscode", x + 10, y + 60, 10, Palette.Text);
        Raylib.DrawText("[C]onsequence (Halt)", x + 10, y + 75, 10, Palette.Text);
    }

    public void EndFrame()
    {
        Raylib.EndTextureMode();

        Raylib.BeginDrawing();
        Raylib.ClearBackground(Color.Black);

        float scale = System.Math.Min((float)Raylib.GetScreenWidth() / Layout.InternalWidth, (float)Raylib.GetScreenHeight() / Layout.InternalHeight);

        Rectangle sourceRec = new Rectangle(0.0f, 0.0f, (float)_target.Texture.Width, (float)-_target.Texture.Height);
        Rectangle destRec = new Rectangle((Raylib.GetScreenWidth() - ((float)Layout.InternalWidth * scale)) * 0.5f, (Raylib.GetScreenHeight() - ((float)Layout.InternalHeight * scale)) * 0.5f, (float)Layout.InternalWidth * scale, (float)Layout.InternalHeight * scale);

        Raylib.DrawTexturePro(_target.Texture, sourceRec, destRec, new System.Numerics.Vector2(0, 0), 0.0f, Color.White);

        Raylib.EndDrawing();
    }

    public void Cleanup()
    {
        Raylib.UnloadRenderTexture(_target);
        Raylib.CloseWindow();
    }
}
