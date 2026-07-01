namespace Grid.Core;

public record LayerRequirement(IReadOnlyList<CellColor> RequiredColors, int WildcardCount)
{
    public LayerRequirement(params CellColor[] requiredColors) : this(requiredColors.ToList(), 0)
    {
    }

    public LayerRequirement(int wildcardCount, params CellColor[] requiredColors) : this(requiredColors.ToList(), wildcardCount)
    {
    }
}
