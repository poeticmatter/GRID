namespace Grid.Core;

public class ComputeDrainCountermeasure : ICountermeasure
{
    public string Name => "Compute Drain";
    public string Description => $"Drains {Amount} compute.";
    public int Amount { get; }

    public ComputeDrainCountermeasure(int amount) => Amount = amount;

    public void Trigger(Mission mission)
    {
        mission.SpendCompute(Amount);
    }
}
