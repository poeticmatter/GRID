using System.Collections.Generic;
using System.Linq;
using Grid.Core;

namespace Grid.Core.Tests;

public class MissionTests
{
    // With FixedRandom(0) the Fisher-Yates shuffle always picks index 0, producing a
    // deterministic grid. Cell layout (x, y):
    //   (0,0)=Cyan/Square   (1,0)=Cyan/Triangle  (2,0)=Cyan/Diamond  (3,0)=Pink/Circle
    //   (0,1)=Pink/Square   (1,1)=Pink/Triangle   (2,1)=Pink/Diamond  (3,1)=Amber/Circle
    //   (0,2)=Amber/Square  (1,2)=Amber/Triangle  (2,2)=Amber/Diamond (3,2)=Violet/Circle
    //   (0,3)=Violet/Square (1,3)=Violet/Triangle (2,3)=Violet/Diamond (3,3)=Cyan/Circle
    //
    // Server layers (hardcoded in Mission constructor):
    //   Layer 0: cyan, cyan, wildcard  (LayerRequirement(1, Cyan, Cyan))
    //   Layer 1: pink                   (LayerRequirement(0, Pink))

    private sealed class FixedRandom : IRandom
    {
        private readonly int _value;
        public FixedRandom(int value) => _value = value;
        public int Next(int maxValue) => _value;
    }

    // Supplies a fixed sequence; callers must provide enough values for the shuffle
    // (15 calls) plus any subsequent RNG use.
    private sealed class SequenceRandom : IRandom
    {
        private readonly Queue<int> _values;
        public SequenceRandom(IEnumerable<int> values) => _values = new Queue<int>(values);
        public int Next(int maxValue) => _values.Dequeue();
    }

    // ── Execution ──────────────────────────────────────────────────────────────

    [Fact]
    public void Execute_IncreasesTraceByExecutionCost()
    {
        var mission = new Mission(new FixedRandom(0));
        int before = mission.Trace.Value;

        mission.SelectCell(0, 1); // Pink cell — hits Prompt at layer 0
        mission.Execute();

        Assert.Equal(before + GameConstants.ExecutionTraceCost, mission.Trace.Value);
    }

    [Fact]
    public void Execute_WithNoSelectedCells_DoesNothing()
    {
        var mission = new Mission(new FixedRandom(0));
        mission.Execute();
        Assert.Equal(MissionState.Idle, mission.State);
        Assert.Equal(0, mission.Trace.Value);
    }

    [Fact]
    public void Execute_WithInsufficientCompute_DoesNothing()
    {
        var mission = new Mission(new FixedRandom(0));

        // Spend all compute via repeated executions (each single-cell costs 1 compute).
        for (int i = 0; i < mission.Compute.Max && mission.State != MissionState.Lost; i++)
        {
            mission.SelectCell(i % 4, i / 4);
            mission.Execute();
            if (mission.State == MissionState.Prompt) mission.TakeConsequence();
        }

        // Now compute is 0. Select a cell and attempt execution.
        int traceBefore = mission.Trace.Value;
        mission.SelectCell(0, 3);
        mission.Execute();

        Assert.Equal(traceBefore, mission.Trace.Value); // no trace spent
    }

    [Fact]
    public void Execute_WhenTraceMaxed_SetsLostState()
    {
        var mission = new Mission(new FixedRandom(0));

        // Single-cell executions each cost 1 trace. Trace.Max executions saturate the meter.
        for (int i = 0; i < mission.Trace.Max; i++)
        {
            mission.SelectCell(i % 4, i / 4);
            mission.Execute();
            if (mission.State == MissionState.Lost) break;
            if (mission.State == MissionState.Prompt) mission.TakeConsequence();
        }

        Assert.Equal(MissionState.Lost, mission.State);
        Assert.True(mission.Trace.IsMaxedOut);
    }

    [Fact]
    public void Execute_ProgramBypassingAllLayers_SetsWonState()
    {
        // Program {Cyan, Cyan, Pink} satisfies layer 0 (cyan,cyan,wildcard) and layer 1 (pink).
        // Cyan cells at (0,0),(1,0) are adjacent; (3,0) is Pink and adjacent to (2,0)[Cyan].
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 0); // Cyan
        mission.SelectCell(1, 0); // Cyan (adjacent to (0,0))
        mission.SelectCell(2, 0); // Cyan (adjacent to (1,0))
        // (2,0) is adjacent to (3,0). Add Pink:
        mission.SelectCell(3, 0); // Pink

        mission.Execute();

        Assert.Equal(MissionState.Won, mission.State);
    }

    // ── Resets ─────────────────────────────────────────────────────────────────

    [Fact]
    public void HardReset_CostsHardResetTraceCost_RefreshesComputeAndGrid()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 1);
        mission.Execute();              // spends compute, hits Prompt
        mission.TakeConsequence();      // Halted

        int traceBefore = mission.Trace.Value;
        int computeMax = mission.Compute.Max;

        mission.HardReset();

        Assert.Equal(traceBefore + GameConstants.HardResetTraceCost, mission.Trace.Value);
        Assert.Equal(computeMax, mission.Compute.Value);
        Assert.Equal(MissionState.Idle, mission.State);
    }

    [Fact]
    public void SoftReset_RefillGrid_CostsSoftResetTraceCost_DoesNotRefreshCompute()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 1);
        mission.Execute();
        mission.TakeConsequence();

        int traceBefore = mission.Trace.Value;
        int computeAfterExecution = mission.Compute.Value;

        mission.SoftReset(refillGrid: true);

        Assert.Equal(traceBefore + GameConstants.SoftResetTraceCost, mission.Trace.Value);
        Assert.Equal(computeAfterExecution, mission.Compute.Value); // compute unchanged
        Assert.Equal(MissionState.Idle, mission.State);
    }

    [Fact]
    public void SoftReset_RefreshCompute_CostsSoftResetTraceCost_RefreshesCompute()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 1);
        mission.Execute();
        mission.TakeConsequence();

        int traceBefore = mission.Trace.Value;

        mission.SoftReset(refillGrid: false);

        Assert.Equal(traceBefore + GameConstants.SoftResetTraceCost, mission.Trace.Value);
        Assert.Equal(mission.Compute.Max, mission.Compute.Value); // compute refreshed
        Assert.Equal(MissionState.Idle, mission.State);
    }

    // ── Brute-force ────────────────────────────────────────────────────────────

    [Fact]
    public void BruteForce_OnSuccess_ContinuesFlowWithOriginalProgramColors()
    {
        // Program {Pink, Pink}: cannot bypass layer 0 (needs cyan), can bypass layer 1 (needs pink).
        // After a successful brute-force of layer 0 the flow must continue with the original
        // program colors — otherwise layer 1 would never be bypassed and state would stay Prompt.
        var mission = new Mission(new FixedRandom(0)); // RNG always 0 → brute-force succeeds

        mission.SelectCell(0, 1); // Pink
        mission.SelectCell(1, 1); // Pink (adjacent)
        mission.Execute();

        Assert.Equal(MissionState.Prompt, mission.State);

        mission.BruteForce(); // succeeds; continues with {Pink, Pink}

        Assert.Equal(MissionState.Won, mission.State);
    }

    [Fact]
    public void BruteForce_OnFailure_RemainsAtPrompt()
    {
        // 15 zeros for the grid shuffle, then 50 for the brute-force roll (50 ≥ 50 → fail).
        var rng = new SequenceRandom(Enumerable.Repeat(0, 15).Append(50));
        var mission = new Mission(rng);

        mission.SelectCell(0, 1);
        mission.Execute();

        Assert.Equal(MissionState.Prompt, mission.State);

        mission.BruteForce();

        Assert.Equal(MissionState.Prompt, mission.State);
    }

    [Fact]
    public void BruteForce_SpendsTwoCompute()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 1); // costs 1 compute (1 cell)
        mission.Execute();

        int computeAfterExecute = mission.Compute.Value;
        mission.BruteForce();

        Assert.Equal(computeAfterExecute - GameConstants.BruteForceCost, mission.Compute.Value);
    }

    [Fact]
    public void BruteForce_WithInsufficientCompute_DoesNothing()
    {
        var mission = new Mission(new FixedRandom(0));

        // 4 adjacent non-cyan cells: (0,1)Pink,(1,1)Pink,(2,1)Pink,(3,1)Amber.
        // Cost = 1+2+3+4 = 10 → drains all compute.
        // {Pink,Pink,Pink,Amber} has 0 cyan → cannot bypass layer 0 → Prompt.
        mission.SelectCell(0, 1);
        mission.SelectCell(1, 1);
        mission.SelectCell(2, 1);
        mission.SelectCell(3, 1);
        mission.Execute();

        Assert.Equal(MissionState.Prompt, mission.State);
        Assert.Equal(0, mission.Compute.Value);

        mission.BruteForce(); // rejected: insufficient compute

        Assert.Equal(MissionState.Prompt, mission.State);
    }

    // ── Passcode ───────────────────────────────────────────────────────────────

    [Fact]
    public void UsePasscode_PassesLayerAndContinuesWithOriginalProgramColors()
    {
        var mission = new Mission(new FixedRandom(0));
        mission.AddPasscode();

        mission.SelectCell(0, 1); // Pink
        mission.SelectCell(1, 1); // Pink
        mission.Execute();

        Assert.Equal(MissionState.Prompt, mission.State);

        mission.UsePasscode();

        Assert.Equal(MissionState.Won, mission.State);
        Assert.Equal(0, mission.Passcodes);
    }

    [Fact]
    public void UsePasscode_WithNoneAvailable_DoesNothing()
    {
        var mission = new Mission(new FixedRandom(0));
        // Passcodes = 0

        mission.SelectCell(0, 1);
        mission.Execute();

        Assert.Equal(MissionState.Prompt, mission.State);

        mission.UsePasscode();

        Assert.Equal(MissionState.Prompt, mission.State);
        Assert.Equal(0, mission.Passcodes);
    }

    // ── Consequence ────────────────────────────────────────────────────────────

    [Fact]
    public void TakeConsequence_SetsHaltedAndResetsLayerIndex()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 1);
        mission.Execute();

        Assert.Equal(MissionState.Prompt, mission.State);

        mission.TakeConsequence();

        Assert.Equal(MissionState.Halted, mission.State);
        Assert.Equal(0, mission.CurrentLayerIndex);
    }

    // ── Cell selection ─────────────────────────────────────────────────────────

    [Fact]
    public void SelectCell_NonAdjacentCell_IsRejected()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 0);
        mission.SelectCell(2, 2); // not adjacent to (0,0)

        Assert.Single(mission.SelectedCells);
        Assert.Contains((0, 0), mission.SelectedCells);
    }

    [Fact]
    public void SelectCell_AdjacentCells_AreAccepted()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 0);
        mission.SelectCell(1, 0); // adjacent
        mission.SelectCell(2, 0); // adjacent to (1,0)

        Assert.Equal(3, mission.SelectedCells.Count);
    }

    [Fact]
    public void SelectCell_Deselection_WhenRemovingBridgeCell_ClearsSelection()
    {
        // A - B - C in a row. Removing B disconnects A and C.
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 0); // A
        mission.SelectCell(1, 0); // B
        mission.SelectCell(2, 0); // C
        Assert.Equal(3, mission.SelectedCells.Count);

        mission.SelectCell(1, 0); // remove B → {A, C} are no longer contiguous

        Assert.Empty(mission.SelectedCells);
    }

    [Fact]
    public void SelectCell_Deselection_WhenRemovingEndCell_PreservesRemainder()
    {
        var mission = new Mission(new FixedRandom(0));

        mission.SelectCell(0, 0);
        mission.SelectCell(1, 0);
        mission.SelectCell(1, 0); // remove end cell (1,0)

        Assert.Single(mission.SelectedCells);
        Assert.Contains((0, 0), mission.SelectedCells);
    }

    [Fact]
    public void SelectCell_NullGridCell_IsRejected()
    {
        var mission = new Mission(new FixedRandom(0));

        // Execute a single cell to create a null slot in the grid
        mission.SelectCell(0, 0);
        mission.Execute(); // removes (0,0) from grid
        mission.TakeConsequence();

        mission.SelectCell(0, 0); // grid slot is now null

        Assert.Empty(mission.SelectedCells);
    }

    // ── Trace ──────────────────────────────────────────────────────────────────

    [Fact]
    public void Trace_Increase_CapsAtMax()
    {
        var trace = new Trace(5);
        trace.Increase(10);
        Assert.Equal(5, trace.Value);
        Assert.True(trace.IsMaxedOut);
    }

    // ── Gaps Resolution Tests ──────────────────────────────────────────────────

    [Fact]
    public void SelectCell_CorruptCell_IsRejected()
    {
        var mission = new Mission(new FixedRandom(0));
        
        // Let's add a corrupt cell to the pool and refill the grid.
        mission.Pool.AddCorruptCell();
        // Since FixedRandom always returns 0, the shuffle is deterministic and
        // the corrupt cell (which was added last) might be placed at a specific spot.
        // Let's force refill so the pool contains the corrupt cell.
        mission.Grid.Refill(mission.Pool, new FixedRandom(0));

        // Find the corrupt cell in the grid
        int corruptX = -1, corruptY = -1;
        for (int y = 0; y < 4; y++)
        {
            for (int x = 0; x < 4; x++)
            {
                var cell = mission.Grid.GetCell(x, y);
                if (cell != null && cell.IsCorrupt)
                {
                    corruptX = x;
                    corruptY = y;
                    break;
                }
            }
        }

        Assert.True(corruptX >= 0, "Corrupt cell should be placed in the grid.");

        // Attempt to select the corrupt cell
        mission.SelectCell(corruptX, corruptY);

        // Verify it was NOT added to selected cells
        Assert.DoesNotContain((corruptX, corruptY), mission.SelectedCells);
    }

    [Fact]
    public void Countermeasures_TriggerOnBypass()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new TraceCountermeasure(2), new HaltConsequence())
        };
        var mission = new Mission(new FixedRandom(0), layers);
        
        // Select adjacent Cyan cell
        // FixedRandom(0) grid: (0,0) is Cyan
        mission.SelectCell(0, 0);
        
        int traceBefore = mission.Trace.Value;
        mission.Execute();

        // 1 trace from execution cost + 2 trace from countermeasure = 3 trace
        Assert.Equal(traceBefore + GameConstants.ExecutionTraceCost + 2, mission.Trace.Value);
    }

    [Fact]
    public void Countermeasures_TriggerOnBruteForce()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new ComputeDrainCountermeasure(3), new HaltConsequence())
        };
        var mission = new Mission(new FixedRandom(0), layers); // rng returns 0 -> brute force success

        // Selected cell is at (0,1) which is Pink (fails color requirement, triggers Prompt)
        mission.SelectCell(0, 1);
        mission.Execute();
        Assert.Equal(MissionState.Prompt, mission.State);

        int computeBefore = mission.Compute.Value; // should be 9
        mission.BruteForce(); // costs 2 compute + drains 3 compute = 5 total spent/drained

        Assert.Equal(computeBefore - GameConstants.BruteForceCost - 3, mission.Compute.Value);
    }

    [Fact]
    public void Countermeasures_DoNotTriggerOnPasscode()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new TraceCountermeasure(3), new HaltConsequence())
        };
        var mission = new Mission(new FixedRandom(0), layers);
        mission.AddPasscode();

        // Select Pink cell to force Prompt
        mission.SelectCell(0, 1);
        mission.Execute();
        Assert.Equal(MissionState.Prompt, mission.State);

        int traceBefore = mission.Trace.Value; // should be 1 from execution
        mission.UsePasscode(); // bypasses without countermeasure

        // Trace should remain 1 (no spike from countermeasure)
        Assert.Equal(traceBefore, mission.Trace.Value);
    }

    [Fact]
    public void Consequences_TraceConsequence_TriggersOnDecline()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new EmptyCountermeasure(), new TraceConsequence(4))
        };
        var mission = new Mission(new FixedRandom(0), layers);

        // Select Pink cell to force Prompt
        mission.SelectCell(0, 1);
        mission.Execute();
        Assert.Equal(MissionState.Prompt, mission.State);

        int traceBefore = mission.Trace.Value; // should be 1
        mission.TakeConsequence();

        // Trace should increase by 4, state should become Halted, and layer index reset to 0
        Assert.Equal(traceBefore + 4, mission.Trace.Value);
        Assert.Equal(MissionState.Halted, mission.State);
    }

    [Fact]
    public void Consequences_CorruptionConsequence_AddsCorruptCellToPool()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new EmptyCountermeasure(), new CorruptionConsequence())
        };
        var mission = new Mission(new FixedRandom(0), layers);

        mission.SelectCell(0, 1);
        mission.Execute();
        
        int poolSizeBefore = mission.Pool.GetCells().Count;
        mission.TakeConsequence();

        Assert.Equal(poolSizeBefore + 1, mission.Pool.GetCells().Count);
        Assert.True(mission.Pool.GetCells().Last().IsCorrupt);
    }

    [Fact]
    public void Consequences_CreditLossConsequence_DeductsCredits()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new EmptyCountermeasure(), new CreditLossConsequence(30))
        };
        var mission = new Mission(new FixedRandom(0), layers);
        mission.AddCredits(100);

        mission.SelectCell(0, 1);
        mission.Execute();
        
        mission.TakeConsequence();

        Assert.Equal(70, mission.Credits);
    }

    [Fact]
    public void Software_TraceShield_ReducesTraceSpike()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new TraceCountermeasure(3), new HaltConsequence())
        };
        var mission = new Mission(new FixedRandom(0), layers);
        
        var software = new TraceShieldSoftware();
        mission.InstallSoftware(software);

        // FixedRandom(0) grid: (3,3) is Cyan/Circle, which has symbol Circle (Circle slot for Trace Shield)
        mission.SelectCell(3, 3);

        int traceBefore = mission.Trace.Value;
        mission.Execute();

        // 1 (execution) + 3 (countermeasure) - 1 (shield) = 3 trace
        Assert.Equal(traceBefore + GameConstants.ExecutionTraceCost + 3 - 1, mission.Trace.Value);
    }

    [Fact]
    public void Hardware_BackupBattery_IncreasesComputeOnceBuilt()
    {
        var mission = new Mission(new FixedRandom(0));
        var battery = new BackupBatteryHardware(mission);
        
        mission.InstallHardware(battery);
        
        Assert.False(battery.IsBuilt);
        int maxComputeBefore = mission.Compute.Max;

        battery.Build();

        Assert.True(battery.IsBuilt);
        Assert.Equal(maxComputeBefore + 5, mission.Compute.Max);
        Assert.Equal(maxComputeBefore + 5, mission.Compute.Value);
    }

    private class EndFlowCounterSoftware : SoftwareBase
    {
        public override string Name => "End Flow Counter";
        public override string Description => "";
        public override CellSymbol TargetSlot => CellSymbol.Circle;
        public int EndFlowCallCount { get; private set; }

        public override void OnEndFlow(Mission mission, int symbolCount, bool won)
        {
            EndFlowCallCount++;
        }
    }

    [Fact]
    public void Software_OnEndFlow_FiresExactlyOnceWhenHaltedWithTraceSpike()
    {
        var layers = new[]
        {
            new Layer(new LayerRequirement(0, CellColor.Cyan), new EmptyCountermeasure(), new TraceConsequence(5))
        };
        var mission = new Mission(new FixedRandom(0), layers);
        var software = new EndFlowCounterSoftware();
        mission.InstallSoftware(software);

        mission.SelectCell(3, 3);
        mission.Execute();

        mission.TakeConsequence();

        Assert.Equal(1, software.EndFlowCallCount);
    }
}
