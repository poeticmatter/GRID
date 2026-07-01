namespace Grid.Core;

public interface IHardware
{
    string Name { get; }
    string Description { get; }
    bool IsBuilt { get; }
    void Build();
}
