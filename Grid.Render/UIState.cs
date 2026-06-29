namespace Grid.Render;

public enum ResetMenuState
{
    None,
    ChoosingResetType, // Hard or Soft
    ChoosingSoftResetOption // Refill Grid or Refresh Compute
}

public class UIState
{
    public ResetMenuState ResetState { get; set; } = ResetMenuState.None;
}
