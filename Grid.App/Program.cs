using System;
using Raylib_cs;
using Grid.Core;
using Grid.Render;
using Grid.Input;

namespace Grid.App;

public static class Program
{
    public static void Main(string[] args)
    {
        // Setup Dependency Injection (manual)
        IRandom rng = new SeededRandom(Guid.NewGuid().GetHashCode());
        var mission = new Mission(rng);
        var uiState = new UIState();

        IRenderer renderer = new RaylibRenderer();
        var inputHandler = new InputHandler(mission, uiState);

        renderer.Initialize();

        while (!Raylib.WindowShouldClose())
        {
            // Update
            inputHandler.ProcessInput();

            // Render
            renderer.BeginFrame();
            renderer.RenderMission(mission, uiState);
            renderer.EndFrame();
        }

        renderer.Cleanup();
    }
}
