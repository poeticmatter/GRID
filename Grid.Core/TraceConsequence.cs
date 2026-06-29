namespace Grid.Core;

public class TraceConsequence : IConsequence
{
    public string Name => "Trace Spike & Halt";
    public string Description => $"Increases trace by {Amount} and halts execution.";
    public int Amount { get; }

    public TraceConsequence(int amount) => Amount = amount;

    public void Trigger(Mission mission)
    {
        mission.AddTrace(Amount);
        mission.HaltExecution();
    }
}
