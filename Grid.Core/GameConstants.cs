namespace Grid.Core;

public static class GameConstants
{
    public const int ExecutionTraceCost = 1;
    public const int HardResetTraceCost = 3;
    public const int SoftResetTraceCost = 2;
    public const int BruteForceCost = 2;
    public const int BruteForceSuccessPercent = 50;

    // Probe — reveals layers ahead before they are attempted (spec §9.6).
    // Cost and reveal count are [TBD]; these defaults make the seam tunable in one place.
    public const int ProbeRevealCount = 1;
    public const int ProbeTraceCost = 0;
}
