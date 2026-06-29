namespace Grid.Core;

public class BackupBatteryHardware : IHardware
{
    private readonly Mission _mission;

    public string Name => "Backup Battery";
    public string Description => "Gives +5 max compute once built.";
    public bool IsBuilt { get; private set; }

    public BackupBatteryHardware(Mission mission)
    {
        _mission = mission;
        IsBuilt = false;
    }

    public void Build()
    {
        if (IsBuilt) return;
        IsBuilt = true;
        _mission.IncreaseMaxCompute(5);
    }
}
