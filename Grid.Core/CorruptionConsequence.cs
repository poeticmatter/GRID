namespace Grid.Core;

public class CorruptionConsequence : IConsequence
{
    public string Name => "Data Corruption & Halt";
    public string Description => "Adds a corrupt cell to the pool and halts execution.";

    public void Trigger(Mission mission)
    {
        mission.AddCorruptCellToPool();
        mission.HaltExecution();
    }
}
