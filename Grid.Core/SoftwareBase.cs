namespace Grid.Core;

public abstract class SoftwareBase : ISoftware
{
    public abstract string Name { get; }
    public abstract string Description { get; }
    public abstract CellSymbol TargetSlot { get; }

    public virtual void OnLaunch(Mission mission, int symbolCount) { }
    public virtual void OnPrompt(Mission mission, int symbolCount) { }
    public virtual void OnPostLayer(Mission mission, int symbolCount, bool bypassedByAttack) { }
    public virtual void OnEndFlow(Mission mission, int symbolCount, bool won) { }
}
