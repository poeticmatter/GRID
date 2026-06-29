using System;
using System.Collections.Generic;
using System.Linq;

namespace Grid.Core;

public enum MissionState
{
    Idle,
    ExecutionFlowing,
    Prompt,
    Halted,
    Won,
    Lost
}

public class Layer
{
    public LayerRequirement Requirement { get; }
    public bool IsBypassed { get; set; } // Temporary state within an execution
    public bool IsProbed { get; set; }

    public Layer(LayerRequirement requirement)
    {
        Requirement = requirement;
    }
}

public class Mission
{
    public MissionState State { get; private set; }
    public Trace Trace { get; }
    public Compute Compute { get; }
    public Pool Pool { get; }
    public GridData Grid { get; }
    public int Credits { get; private set; }
    public int Passcodes { get; private set; }

    public IReadOnlyList<Layer> Layers => _layers.AsReadOnly();
    private readonly List<Layer> _layers;

    public int CurrentLayerIndex { get; private set; }
    public HashSet<(int x, int y)> SelectedCells { get; } = new();

    private readonly IRandom _rng;

    public Mission(IRandom rng)
    {
        _rng = rng;
        Trace = new Trace();
        Compute = new Compute();
        Pool = new Pool();
        Grid = new GridData();
        _layers = new List<Layer>();
        State = MissionState.Idle;

        // TBD exact initialization from outside
        Grid.Refill(Pool, _rng);

        // Dummy server setup
        _layers.Add(new Layer(new LayerRequirement(1, CellColor.Cyan, CellColor.Cyan))); // cyan, cyan, any
        _layers.Add(new Layer(new LayerRequirement(0, CellColor.Pink))); // pink
    }

    public void SelectCell(int x, int y)
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;

        // Must be contiguous, implemented loosely here for brevity (should check orthogonal adjacency)
        if (Grid.GetCell(x, y) == null) return;

        var pos = (x, y);
        if (SelectedCells.Contains(pos))
        {
            SelectedCells.Remove(pos);
        }
        else
        {
            // Simple contiguity check: must be adjacent to at least one already selected cell if any exist
            if (SelectedCells.Count > 0)
            {
                bool isAdjacent = SelectedCells.Any(c => Math.Abs(c.x - x) + Math.Abs(c.y - y) == 1);
                if (!isAdjacent) return; // Reject if not contiguous
            }
            SelectedCells.Add(pos);
        }
    }

    public void Execute()
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;
        if (SelectedCells.Count == 0) return;

        int cost = Compute.CalculateCost(SelectedCells.Count);
        if (Compute.Value < cost) return;

        Compute.Spend(cost);

        var programColors = new List<CellColor>();
        foreach (var (x, y) in SelectedCells)
        {
            var cell = Grid.GetCell(x, y);
            if (cell != null)
            {
                programColors.Add(cell.Color);
                Grid.RemoveCell(x, y);
            }
        }

        SelectedCells.Clear();
        Trace.Increase(1);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            return;
        }

        // Reset bypassed states for new execution
        foreach (var layer in _layers)
        {
            layer.IsBypassed = false;
        }

        State = MissionState.ExecutionFlowing;
        CurrentLayerIndex = 0;

        Flow(programColors);
    }

    private void Flow(List<CellColor> programColors)
    {
        while (CurrentLayerIndex < _layers.Count)
        {
            var layer = _layers[CurrentLayerIndex];
            layer.IsProbed = true; // Intel is gained by reaching it

            if (MatchingEngine.CanBypass(programColors, layer.Requirement))
            {
                layer.IsBypassed = true;
                // Countermeasure would trigger here
                CurrentLayerIndex++;
            }
            else
            {
                State = MissionState.Prompt;
                return; // Wait for player decision
            }
        }

        // Past final layer
        State = MissionState.Won;
    }

    public void BruteForce()
    {
        if (State != MissionState.Prompt) return;

        const int BruteForceCost = 2;
        if (Compute.Value < BruteForceCost) return;

        Compute.Spend(BruteForceCost);

        // 50% chance to brute force for now (TBD scaling)
        bool success = _rng.Next(100) < 50;

        if (success)
        {
            _layers[CurrentLayerIndex].IsBypassed = true;
            CurrentLayerIndex++;
            State = MissionState.ExecutionFlowing;

            // Re-flow with empty program as we've already bypassed the problematic layer,
            // but in reality we should keep the original program colors to test subsequent layers.
            // Simplified for now: just trigger next prompt.
            Flow(new List<CellColor>());
        }
        // If fails, stays in Prompt state
    }

    public void UsePasscode()
    {
         if (State != MissionState.Prompt) return;
         if (Passcodes <= 0) return;

         Passcodes--;
         _layers[CurrentLayerIndex].IsBypassed = true;
         CurrentLayerIndex++;
         State = MissionState.ExecutionFlowing;
         Flow(new List<CellColor>()); // Simplified
    }

    public void TakeConsequence()
    {
        if (State != MissionState.Prompt) return;

        // Apply consequence (halt for now)
        State = MissionState.Halted;
        CurrentLayerIndex = 0;
    }

    public void HardReset()
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;

        const int TraceCost = 3;
        Trace.Increase(TraceCost);
        if (Trace.IsMaxedOut)
        {
             State = MissionState.Lost;
             return;
        }

        Grid.Refill(Pool, _rng);
        Compute.Refresh();
        SelectedCells.Clear();
        State = MissionState.Idle;
    }

    public void SoftReset(bool refillGrid)
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;

        const int TraceCost = 2;
        Trace.Increase(TraceCost);
        if (Trace.IsMaxedOut)
        {
             State = MissionState.Lost;
             return;
        }

        if (refillGrid)
        {
             Grid.Refill(Pool, _rng);
             SelectedCells.Clear();
        }
        else
        {
             Compute.Refresh();
        }

        State = MissionState.Idle;
    }
}
