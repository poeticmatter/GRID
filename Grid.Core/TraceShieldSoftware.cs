namespace Grid.Core;

public class TraceShieldSoftware : SoftwareBase
{
    public override string Name => "Trace Shield";
    public override string Description => "Circle slot. Reduces trace by 1 per symbol count at end of execution.";
    public override CellSymbol TargetSlot => CellSymbol.Circle;

    public override void OnEndFlow(Mission mission, int symbolCount, bool won)
    {
        mission.ReduceTrace(symbolCount);
    }
}
