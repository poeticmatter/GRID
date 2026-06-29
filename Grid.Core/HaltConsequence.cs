namespace Grid.Core;

public class HaltConsequence : IConsequence
{
    public string Name => "Halt";
    public string Description => "Halts program execution.";

    public void Trigger(Mission mission)
    {
        mission.HaltExecution();
    }
}
