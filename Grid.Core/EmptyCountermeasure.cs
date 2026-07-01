namespace Grid.Core;

public class EmptyCountermeasure : ICountermeasure
{
    public string Name => "None";
    public string Description => "No countermeasure.";
    public void Trigger(Mission mission) { }
}
