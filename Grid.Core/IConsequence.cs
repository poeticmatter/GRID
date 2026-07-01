namespace Grid.Core;

public interface IConsequence
{
    string Name { get; }
    string Description { get; }
    void Trigger(Mission mission);
}
