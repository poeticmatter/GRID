using Raylib_cs;
using Grid.Core;
using Grid.Render;

namespace Grid.Input;

public class InputHandler
{
    private readonly Mission _mission;

    public InputHandler(Mission mission)
    {
        _mission = mission;
    }

    public void ProcessInput()
    {
        if (_mission.State == MissionState.Idle || _mission.State == MissionState.Halted)
        {
            HandleGridInput();

            if (Raylib.IsKeyPressed(KeyboardKey.E))
            {
                _mission.Execute();
            }
            if (Raylib.IsKeyPressed(KeyboardKey.H))
            {
                _mission.HardReset();
            }
            if (Raylib.IsKeyPressed(KeyboardKey.S))
            {
                _mission.SoftReset(refillGrid: true); // Default to refill grid for now
            }
        }
        else if (_mission.State == MissionState.Prompt)
        {
            if (Raylib.IsKeyPressed(KeyboardKey.B))
            {
                _mission.BruteForce();
            }
            if (Raylib.IsKeyPressed(KeyboardKey.P))
            {
                _mission.UsePasscode();
            }
            if (Raylib.IsKeyPressed(KeyboardKey.C))
            {
                _mission.TakeConsequence();
            }
        }
    }

    private void HandleGridInput()
    {
        if (Raylib.IsMouseButtonPressed(MouseButton.Left))
        {
            var mousePos = Raylib.GetMousePosition();

            // Inverse scale from screen space to internal space
            float scale = System.Math.Min((float)Raylib.GetScreenWidth() / Layout.InternalWidth, (float)Raylib.GetScreenHeight() / Layout.InternalHeight);

            float offsetX = (Raylib.GetScreenWidth() - ((float)Layout.InternalWidth * scale)) * 0.5f;
            float offsetY = (Raylib.GetScreenHeight() - ((float)Layout.InternalHeight * scale)) * 0.5f;

            float internalX = (mousePos.X - offsetX) / scale;
            float internalY = (mousePos.Y - offsetY) / scale;

            // Hit test against grid console
            int gridContentSize = (Layout.GridCols * Layout.CellSize) + ((Layout.GridCols - 1) * Layout.CellGap);
            int totalSize = gridContentSize + (2 * Layout.GridConsolePad) + (2 * Layout.ConsoleBorder);
            int serverHeight = (Layout.LayerVisibleRows * Layout.LayerRowHeight) + ((Layout.LayerVisibleRows - 1) * Layout.LayerRowGap) + (2 * Layout.LayerConsolePad) + (2 * Layout.ConsoleBorder);

            int startY = Layout.ResourceBarHeight + 10 + serverHeight + Layout.ConsoleSeparatorGap;
            int startX = (Layout.InternalWidth - totalSize) / 2;

            int contentStartX = startX + Layout.ConsoleBorder + Layout.GridConsolePad;
            int contentStartY = startY + Layout.ConsoleBorder + Layout.GridConsolePad;

            for (int y = 0; y < Layout.GridRows; y++)
            {
                for (int x = 0; x < Layout.GridCols; x++)
                {
                    int cellX = contentStartX + x * (Layout.CellSize + Layout.CellGap);
                    int cellY = contentStartY + y * (Layout.CellSize + Layout.CellGap);

                    if (internalX >= cellX && internalX <= cellX + Layout.CellSize &&
                        internalY >= cellY && internalY <= cellY + Layout.CellSize)
                    {
                        _mission.SelectCell(x, y);
                        return; // Found the clicked cell
                    }
                }
            }
        }
    }
}
