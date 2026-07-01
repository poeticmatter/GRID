namespace Grid.Core;

public interface ISoftware
{
    string Name { get; }
    string Description { get; }
    CellSymbol TargetSlot { get; }
}
