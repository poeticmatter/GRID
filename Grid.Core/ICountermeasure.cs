namespace Grid.Core;

public interface ICountermeasure
{
    string Name { get; }
    string Description { get; }
    void Trigger(Mission mission);
}
