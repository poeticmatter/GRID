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

    public void RenderMission(Mission mission, UIState uiState)
    {
        DrawResourceBar(mission);
        DrawSidePanels(mission);
        DrawServerConsole(mission);
        DrawGridConsole(mission);
        DrawActionBar(mission, uiState);

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

    private void DrawSidePanels(Mission mission)
    {
        // Left side: Hardware
        Raylib.DrawText("HARDWARE:", 10, Layout.ResourceBarHeight + 10, 10, Palette.Text);
        int y = Layout.ResourceBarHeight + 25;
        if (mission.Hardware.Count == 0)
        {
            Raylib.DrawText("None", 10, y, 10, Palette.Corrupt);
        }
        else
        {
            foreach (var hw in mission.Hardware)
            {
                string status = hw.IsBuilt ? "" : " (Schematic)";
                Color color = hw.IsBuilt ? Palette.Text : Palette.Corrupt;
                Raylib.DrawText($"- {hw.Name}{status}", 10, y, 10, color);
                y += 12;
            }
        }

        // Right side: Software
        Raylib.DrawText("SOFTWARE:", 350, Layout.ResourceBarHeight + 10, 10, Palette.Text);
        y = Layout.ResourceBarHeight + 25;
        foreach (var slot in mission.SoftwareSlots)
        {
            string slotName = slot.Key.ToString();
            string swName = slot.Value != null ? slot.Value.Name : "[Empty]";
            
            bool isHighlighted = slot.Value != null && (mission.State == MissionState.Idle || mission.State == MissionState.Halted) && mission.SelectedCells.Any(pos => mission.Grid.GetCell(pos.x, pos.y)?.Symbol == slot.Key);
            
            Color color;
            if (isHighlighted)
            {
                color = Palette.Cyan;
                swName += " [ACTIVE]";
            }
            else
            {
                color = slot.Value != null ? Palette.Text : Palette.Corrupt;
            }
            
            Raylib.DrawText($"{slotName}: {swName}", 350, y, 10, color);
            y += 12;
        }
    }

    private void DrawServerConsole(Mission mission)
    {
        int totalHeight = (Layout.LayerVisibleRows * Layout.LayerRowHeight) + ((Layout.LayerVisibleRows - 1) * Layout.LayerRowGap) + (2 * Layout.LayerConsolePad) + (2 * Layout.ConsoleBorder);
        int totalWidth = Layout.LayerConsoleWidth;

        int startY = Layout.ResourceBarHeight + 10;
        int startX = (Layout.InternalWidth - totalWidth) / 2;

        Raylib.DrawRectangleLines(startX, startY, totalWidth, totalHeight, Palette.UIElement);

        int rowY = startY + Layout.ConsoleBorder + Layout.LayerConsolePad;

        int visibleRows = Layout.LayerVisibleRows;
        int currentIdx = mission.CurrentLayerIndex;
        int totalLayers = mission.Layers.Count;

        int startIndex = 0;
        if (totalLayers > visibleRows)
        {
            startIndex = currentIdx - (visibleRows / 2);
            if (startIndex < 0) startIndex = 0;
            if (startIndex + visibleRows > totalLayers) startIndex = totalLayers - visibleRows;
        }
        int endIndex = Math.Min(startIndex + visibleRows, totalLayers);

        for (int i = startIndex; i < endIndex; i++)
        {
            var layer = mission.Layers[i];

            string reqColorsText = string.Join(", ", layer.Requirement.RequiredColors);
            string reqText = reqColorsText;
            if (layer.Requirement.WildcardCount > 0)
            {
                if (!string.IsNullOrEmpty(reqColorsText)) reqText += ", ";
                reqText += string.Join(", ", Enumerable.Repeat("?", layer.Requirement.WildcardCount));
            }

            string state = layer.IsBypassed ? "[Bypassed]" : (layer.IsProbed ? "[Probed]" : "[Unprobed]");
            string text = $"L{i + 1}: [{reqText}] {state}";

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

                if (cell.IsCorrupt)
                {
                    bgColor = Palette.Corrupt;
                    symbolColor = Palette.Background;
                }

                Raylib.DrawRectangle(cellX, cellY, Layout.CellSize, Layout.CellSize, bgColor);
                Raylib.DrawRectangleLines(cellX, cellY, Layout.CellSize, Layout.CellSize, Palette.Text); // Border

                // Draw Symbol as actual shapes
                int centerX = cellX + Layout.CellSize / 2;
                int centerY = cellY + Layout.CellSize / 2;
                int padding = 4;
                int size = Layout.CellSize - (padding * 2);

                if (cell.Symbol == CellSymbol.Circle)
                {
                    Raylib.DrawCircle(centerX, centerY, size / 2.0f, symbolColor);
                }
                else if (cell.Symbol == CellSymbol.Square)
                {
                    Raylib.DrawRectangle(cellX + padding, cellY + padding, size, size, symbolColor);
                }
                else if (cell.Symbol == CellSymbol.Triangle)
                {
                    System.Numerics.Vector2 v1 = new(centerX, cellY + padding);
                    System.Numerics.Vector2 v2 = new(cellX + padding, cellY + Layout.CellSize - padding);
                    System.Numerics.Vector2 v3 = new(cellX + Layout.CellSize - padding, cellY + Layout.CellSize - padding);
                    Raylib.DrawTriangle(v1, v2, v3, symbolColor);
                }
                else if (cell.Symbol == CellSymbol.Diamond)
                {
                    System.Numerics.Vector2 top = new(centerX, cellY + padding);
                    System.Numerics.Vector2 bottom = new(centerX, cellY + Layout.CellSize - padding);
                    System.Numerics.Vector2 left = new(cellX + padding, centerY);
                    System.Numerics.Vector2 right = new(cellX + Layout.CellSize - padding, centerY);
                    Raylib.DrawTriangle(top, left, right, symbolColor);
                    Raylib.DrawTriangle(bottom, right, left, symbolColor);
                }

                // Highlight if selected
                if (mission.SelectedCells.Contains((x, y)))
                {
                    Raylib.DrawRectangle(cellX, cellY, Layout.CellSize, Layout.CellSize, new Color(255, 255, 255, 100));
                }
            }
        }
    }

    private void DrawActionBar(Mission mission, UIState uiState)
    {
        Raylib.DrawRectangle(0, Layout.InternalHeight - Layout.ActionBarHeight, Layout.InternalWidth, Layout.ActionBarHeight, Palette.UIElement);
        string text = "";

        if (uiState.ResetState == ResetMenuState.None)
        {
            text = $"[E]xecute (Cost: {Compute.CalculateCost(mission.SelectedCells.Count)}) | [R]eset Menu | [B]uild Hardware";
        }
        else if (uiState.ResetState == ResetMenuState.ChoosingResetType)
        {
            text = "Reset: [H]ard (-3 Trace) | [S]oft (-2 Trace) | [C]ancel";
        }
        else if (uiState.ResetState == ResetMenuState.ChoosingSoftResetOption)
        {
            text = "Soft Reset Option: [F] Refill Grid | [C] Refresh Compute | [B]ack";
        }

        Raylib.DrawText(text, 4, Layout.InternalHeight - Layout.ActionBarHeight + 4, 10, Palette.Text);
    }

    private void DrawPrompt(Mission mission)
    {
        int w = 310, h = 120;
        int x = (Layout.InternalWidth - w) / 2;
        int y = (Layout.InternalHeight - h) / 2;

        Raylib.DrawRectangle(x, y, w, h, Palette.Background);
        Raylib.DrawRectangleLines(x, y, w, h, Palette.Text);

        var layer = mission.Layers[mission.CurrentLayerIndex];

        Raylib.DrawText("BLOCKED BY LAYER DEFENSES", x + 10, y + 10, 10, Palette.Pink);
        Raylib.DrawText($"Countermeasure: {layer.Countermeasure.Name} ({layer.Countermeasure.Description})", x + 10, y + 25, 9, Palette.Text);
        Raylib.DrawText($"Consequence: {layer.Consequence.Name} ({layer.Consequence.Description})", x + 10, y + 38, 9, Palette.Text);

        Raylib.DrawText("[B]rute-Force (-2 Compute, 50% success, triggers countermeasure)", x + 10, y + 55, 8, Palette.Text);
        Raylib.DrawText($"[P]asscode (Legitimate access, no countermeasure - {mission.Passcodes} left)", x + 10, y + 70, 8, Palette.Text);
        Raylib.DrawText("[C]onsequence (Accept consequence / Halt)", x + 10, y + 85, 8, Palette.Text);
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
