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
        Raylib.DrawText($"Trace: {mission.Trace.Value}/{mission.Trace.Max}  Compute: {mission.Compute.Value}/{mission.Compute.Max}  Credits: {mission.Credits}", Layout.TextPadding, 2, Layout.FontSizeNormal, Palette.Text);
    }

    private void DrawSidePanels(Mission mission)
    {
        // Left side: Hardware
        Raylib.DrawText("HARDWARE:", Layout.HardwarePanelX, Layout.PanelHeaderY, Layout.FontSizeNormal, Palette.Text);
        int y = Layout.PanelFirstRowY;
        if (mission.Hardware.Count == 0)
        {
            Raylib.DrawText("None", Layout.HardwarePanelX, y, Layout.FontSizeNormal, Palette.Corrupt);
        }
        else
        {
            foreach (var hw in mission.Hardware)
            {
                string status = hw.IsBuilt ? "" : " (Schematic)";
                Color color = hw.IsBuilt ? Palette.Text : Palette.Corrupt;
                Raylib.DrawText($"- {hw.Name}{status}", Layout.HardwarePanelX, y, Layout.FontSizeNormal, color);
                y += Layout.PanelRowGap;
            }
        }

        // Right side: Software
        Raylib.DrawText("SOFTWARE:", Layout.SoftwarePanelX, Layout.PanelHeaderY, Layout.FontSizeNormal, Palette.Text);
        y = Layout.PanelFirstRowY;
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

            Raylib.DrawText($"{slotName}: {swName}", Layout.SoftwarePanelX, y, Layout.FontSizeNormal, color);
            y += Layout.PanelRowGap;
        }
    }

    private void DrawServerConsole(Mission mission)
    {
        int startX = Layout.ServerConsoleX;
        int startY = Layout.ServerConsoleY;

        Raylib.DrawRectangleLines(startX, startY, Layout.LayerConsoleWidth, Layout.LayerConsoleHeight, Palette.UIElement);

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

            Raylib.DrawText(text, startX + Layout.ConsoleBorder + Layout.LayerConsolePad, rowY, Layout.FontSizeNormal, Palette.Text);
            rowY += Layout.LayerRowHeight + Layout.LayerRowGap;
        }
    }

    private void DrawGridConsole(Mission mission)
    {
        Raylib.DrawRectangleLines(Layout.GridConsoleX, Layout.GridConsoleY, Layout.GridConsoleSize, Layout.GridConsoleSize, Palette.UIElement);

        for (int y = 0; y < Layout.GridRows; y++)
        {
            for (int x = 0; x < Layout.GridCols; x++)
            {
                var cell = mission.Grid.GetCell(x, y);
                if (cell == null) continue;

                var (cellX, cellY) = Layout.CellOrigin(x, y);

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
                int padding = Layout.CellSymbolPadding;
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
                    Raylib.DrawRectangle(cellX, cellY, Layout.CellSize, Layout.CellSize, Palette.SelectionOverlay);
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
            text = $"[E]xecute (Cost: {Compute.CalculateCost(mission.SelectedCells.Count)}) | [R]eset | [P]robe | [B]uild | [X] Abandon";
        }
        else if (uiState.ResetState == ResetMenuState.ChoosingResetType)
        {
            text = $"Reset: [H]ard (-{GameConstants.HardResetTraceCost} Trace) | [S]oft (-{GameConstants.SoftResetTraceCost} Trace) | [C]ancel";
        }
        else if (uiState.ResetState == ResetMenuState.ChoosingSoftResetOption)
        {
            text = "Soft Reset Option: [F] Refill Grid | [C] Refresh Compute | [B]ack";
        }

        Raylib.DrawText(text, Layout.TextPadding, Layout.InternalHeight - Layout.ActionBarHeight + Layout.TextPadding, Layout.FontSizeNormal, Palette.Text);
    }

    private void DrawPrompt(Mission mission)
    {
        int x = (Layout.InternalWidth - Layout.PromptWidth) / 2;
        int y = (Layout.InternalHeight - Layout.PromptHeight) / 2;

        Raylib.DrawRectangle(x, y, Layout.PromptWidth, Layout.PromptHeight, Palette.Background);
        Raylib.DrawRectangleLines(x, y, Layout.PromptWidth, Layout.PromptHeight, Palette.Text);

        var layer = mission.Layers[mission.CurrentLayerIndex];

        int textX = x + Layout.TextPadding * 2;
        int lineY = y + Layout.PromptLineGap;

        Raylib.DrawText("BLOCKED BY LAYER DEFENSES", textX, lineY, Layout.FontSizeNormal, Palette.Pink);
        lineY += Layout.PromptLineGap;
        Raylib.DrawText($"Countermeasure: {layer.Countermeasure.Name} ({layer.Countermeasure.Description})", textX, lineY, Layout.FontSizeMedium, Palette.Text);
        lineY += Layout.PromptLineGap;
        Raylib.DrawText($"Consequence: {layer.Consequence.Name} ({layer.Consequence.Description})", textX, lineY, Layout.FontSizeMedium, Palette.Text);
        lineY += Layout.PromptLineGap;
        Raylib.DrawText($"[B]rute-Force (-{GameConstants.BruteForceCost} Compute, {GameConstants.BruteForceSuccessPercent}% success, triggers countermeasure)", textX, lineY, Layout.FontSizeSmall, Palette.Text);
        lineY += Layout.PromptLineGap;
        Raylib.DrawText($"[P]asscode (Legitimate access, no countermeasure - {mission.Passcodes} left)", textX, lineY, Layout.FontSizeSmall, Palette.Text);
        lineY += Layout.PromptLineGap;
        Raylib.DrawText("[C]onsequence (Accept consequence / Halt)", textX, lineY, Layout.FontSizeSmall, Palette.Text);
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
