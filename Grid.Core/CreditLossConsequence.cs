namespace Grid.Core;

public class CreditLossConsequence : IConsequence
{
    public string Name => "Credit Loss & Halt";
    public string Description => $"Deducts {Amount} credits and halts execution.";
    public int Amount { get; }

    public CreditLossConsequence(int amount) => Amount = amount;

    public void Trigger(Mission mission)
    {
        mission.LoseCredits(Amount);
        mission.HaltExecution();
    }
}
