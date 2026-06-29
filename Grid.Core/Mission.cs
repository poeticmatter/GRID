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
    public bool IsBypassed { get; internal set; }
    public bool IsProbed { get; internal set; }

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

    private readonly HashSet<(int x, int y)> _selectedCells = new();
    public IReadOnlySet<(int x, int y)> SelectedCells => _selectedCells;

    // Preserved for the duration of an execution so BruteForce/UsePasscode can resume Flow
    // with the original program's colors.
    private List<CellColor> _currentProgramColors = new();

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

        Grid.Refill(Pool, _rng);

        // TODO: replace with externally-supplied layer configuration
        _layers.Add(new Layer(new LayerRequirement(1, CellColor.Cyan, CellColor.Cyan)));
        _layers.Add(new Layer(new LayerRequirement(0, CellColor.Pink)));
    }

    public void AddPasscode(int count = 1)
    {
        Passcodes += count;
    }

    public void AddCredits(int amount)
    {
        Credits += amount;
    }

    public void SelectCell(int x, int y)
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;
        if (Grid.GetCell(x, y) == null) return;

        var pos = (x, y);
        if (_selectedCells.Contains(pos))
        {
            _selectedCells.Remove(pos);
            // If removing the cell splits the remaining selection into disconnected
            // islands, clear entirely rather than leave an invalid program.
            if (!AreAllContiguous(_selectedCells))
                _selectedCells.Clear();
        }
        else
        {
            if (_selectedCells.Count > 0)
            {
                bool isAdjacent = _selectedCells.Any(c => Math.Abs(c.x - x) + Math.Abs(c.y - y) == 1);
                if (!isAdjacent) return;
            }
            _selectedCells.Add(pos);
        }
    }

    public void Execute()
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;
        if (_selectedCells.Count == 0) return;

        int cost = Compute.CalculateCost(_selectedCells.Count);
        if (Compute.Value < cost) return;

        Compute.Spend(cost);

        _currentProgramColors = new List<CellColor>();
        foreach (var (x, y) in _selectedCells)
        {
            var cell = Grid.GetCell(x, y);
            if (cell != null)
            {
                _currentProgramColors.Add(cell.Color);
                Grid.RemoveCell(x, y);
            }
        }

        _selectedCells.Clear();
        Trace.Increase(GameConstants.ExecutionTraceCost);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            return;
        }

        foreach (var layer in _layers)
            layer.IsBypassed = false;

        State = MissionState.ExecutionFlowing;
        CurrentLayerIndex = 0;

        Flow(_currentProgramColors);
    }

    private void Flow(List<CellColor> programColors)
    {
        while (CurrentLayerIndex < _layers.Count)
        {
            var layer = _layers[CurrentLayerIndex];
            layer.IsProbed = true;

            if (MatchingEngine.CanBypass(programColors, layer.Requirement))
            {
                layer.IsBypassed = true;
                // TODO: trigger countermeasure here
                CurrentLayerIndex++;
            }
            else
            {
                State = MissionState.Prompt;
                return;
            }
        }

        State = MissionState.Won;
    }

    public void BruteForce()
    {
        if (State != MissionState.Prompt) return;
        if (Compute.Value < GameConstants.BruteForceCost) return;

        Compute.Spend(GameConstants.BruteForceCost);

        bool success = _rng.Next(100) < GameConstants.BruteForceSuccessPercent;
        if (success)
        {
            _layers[CurrentLayerIndex].IsBypassed = true;
            CurrentLayerIndex++;
            State = MissionState.ExecutionFlowing;
            Flow(_currentProgramColors);
        }
        // On failure, remain at Prompt so the player can try again or take consequence.
    }

    public void UsePasscode()
    {
        if (State != MissionState.Prompt) return;
        if (Passcodes <= 0) return;

        Passcodes--;
        _layers[CurrentLayerIndex].IsBypassed = true;
        CurrentLayerIndex++;
        State = MissionState.ExecutionFlowing;
        Flow(_currentProgramColors);
    }

    public void TakeConsequence()
    {
        if (State != MissionState.Prompt) return;
        // TODO: apply layer-specific consequence; halt is the common default
        State = MissionState.Halted;
        CurrentLayerIndex = 0;
    }

    public void HardReset()
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;

        Trace.Increase(GameConstants.HardResetTraceCost);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            return;
        }

        Grid.Refill(Pool, _rng);
        Compute.Refresh();
        _selectedCells.Clear();
        State = MissionState.Idle;
    }

    public void SoftReset(bool refillGrid)
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;

        Trace.Increase(GameConstants.SoftResetTraceCost);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            return;
        }

        if (refillGrid)
        {
            Grid.Refill(Pool, _rng);
            _selectedCells.Clear();
        }
        else
        {
            Compute.Refresh();
        }

        State = MissionState.Idle;
    }

    private static bool AreAllContiguous(HashSet<(int x, int y)> cells)
    {
        if (cells.Count <= 1) return true;

        var start = cells.First();
        var visited = new HashSet<(int x, int y)> { start };
        var queue = new Queue<(int x, int y)>();
        queue.Enqueue(start);

        while (queue.Count > 0)
        {
            var (cx, cy) = queue.Dequeue();
            foreach (var neighbor in new[] { (cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1) })
            {
                if (cells.Contains(neighbor) && visited.Add(neighbor))
                    queue.Enqueue(neighbor);
            }
        }

        return visited.Count == cells.Count;
    }
}
