namespace Grid.Core;

public class TraceCountermeasure : ICountermeasure
{
    public string Name => "Trace Spike";
    public string Description => $"Increases trace by {Amount}.";
    public int Amount { get; }

    public TraceCountermeasure(int amount) => Amount = amount;

    public void Trigger(Mission mission)
    {
        mission.AddTrace(Amount);
    }
}
