using Grid.Core;

namespace Grid.Render;

public interface IRenderer
{
    void Initialize();
    void BeginFrame();
    void RenderMission(Mission mission);
    void EndFrame();
    void Cleanup();
}
