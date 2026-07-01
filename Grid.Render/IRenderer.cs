using Grid.Core;

namespace Grid.Render;

public interface IRenderer
{
    void Initialize();
    void BeginFrame();
    void RenderMission(Mission mission, UIState uiState);
    void EndFrame();
    void Cleanup();
}
