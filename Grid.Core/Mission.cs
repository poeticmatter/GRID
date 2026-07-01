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
    Lost,
    Abandoned
}

public class Layer
{
    public LayerRequirement Requirement { get; }
    public bool IsBypassed { get; internal set; }
    public bool IsProbed { get; internal set; }
    public ICountermeasure Countermeasure { get; }
    public IConsequence Consequence { get; }

    public Layer(LayerRequirement requirement, ICountermeasure? countermeasure = null, IConsequence? consequence = null)
    {
        Requirement = requirement;
        Countermeasure = countermeasure ?? new EmptyCountermeasure();
        Consequence = consequence ?? new HaltConsequence();
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

    private readonly Dictionary<CellSymbol, SoftwareBase?> _softwareSlots = new()
    {
        { CellSymbol.Circle, null },
        { CellSymbol.Square, null },
        { CellSymbol.Triangle, null },
        { CellSymbol.Diamond, null }
    };
    public IReadOnlyDictionary<CellSymbol, SoftwareBase?> SoftwareSlots => _softwareSlots;

    private readonly List<IHardware> _hardware = new();
    public IReadOnlyList<IHardware> Hardware => _hardware.AsReadOnly();

    private List<CellColor> _currentProgramColors = new();
    private readonly Dictionary<CellSymbol, int> _currentProgramSymbols = new();
    private bool _endFlowFired;

    private readonly IRandom _rng;

    public Mission(IRandom rng, IEnumerable<Layer>? layers = null)
    {
        _rng = rng;
        Trace = new Trace();
        Compute = new Compute();
        Pool = new Pool();
        Grid = new GridData();
        State = MissionState.Idle;

        foreach (CellSymbol symbol in Enum.GetValues<CellSymbol>())
        {
            _currentProgramSymbols[symbol] = 0;
        }

        Grid.Refill(Pool, _rng);

        if (layers != null)
        {
            _layers = new List<Layer>(layers);
        }
        else
        {
            _layers = new List<Layer>
            {
                new Layer(new LayerRequirement(1, CellColor.Cyan, CellColor.Cyan)),
                new Layer(new LayerRequirement(0, CellColor.Pink))
            };
        }
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
        var cell = Grid.GetCell(x, y);
        if (cell == null || cell.IsCorrupt) return;

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
        foreach (CellSymbol symbol in Enum.GetValues<CellSymbol>())
        {
            _currentProgramSymbols[symbol] = 0;
        }

        foreach (var (x, y) in _selectedCells)
        {
            var cell = Grid.GetCell(x, y);
            if (cell != null)
            {
                _currentProgramColors.Add(cell.Color);
                _currentProgramSymbols[cell.Symbol]++;
                Grid.RemoveCell(x, y);
            }
        }

        _selectedCells.Clear();
        _endFlowFired = false;
        Trace.Increase(GameConstants.ExecutionTraceCost);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            TriggerEndFlow(won: false);
            return;
        }

        foreach (var layer in _layers)
            layer.IsBypassed = false;

        State = MissionState.ExecutionFlowing;
        CurrentLayerIndex = 0;

        // Trigger OnLaunch hook
        FireSoftwareHook((sw, count) => sw.OnLaunch(this, count));

        Flow(_currentProgramColors);
    }

    private void Flow(List<CellColor> programColors)
    {
        while (CurrentLayerIndex < _layers.Count)
        {
            if (State == MissionState.Lost) return;

            var layer = _layers[CurrentLayerIndex];
            layer.IsProbed = true;

            if (MatchingEngine.CanBypass(programColors, layer.Requirement))
            {
                layer.IsBypassed = true;
                layer.Countermeasure.Trigger(this);

                // Early return if countermeasure maxed trace
                if (State == MissionState.Lost) return;

                // Trigger OnPostLayer hook for bypass (attack = true)
                FireSoftwareHook((sw, count) => sw.OnPostLayer(this, count, bypassedByAttack: true));

                CurrentLayerIndex++;
            }
            else
            {
                State = MissionState.Prompt;

                // Trigger OnPrompt hook
                FireSoftwareHook((sw, count) => sw.OnPrompt(this, count));

                return;
            }
        }

        if (State != MissionState.Lost)
        {
            State = MissionState.Won;

            // Trigger OnEndFlow hook
            TriggerEndFlow(won: true);
        }
    }

    public void BruteForce()
    {
        if (State != MissionState.Prompt) return;
        if (Compute.Value < GameConstants.BruteForceCost) return;

        Compute.Spend(GameConstants.BruteForceCost);

        bool success = _rng.Next(100) < GameConstants.BruteForceSuccessPercent;
        if (success)
        {
            var layer = _layers[CurrentLayerIndex];
            layer.IsBypassed = true;
            layer.Countermeasure.Trigger(this);

            // Early return if countermeasure maxed trace
            if (State == MissionState.Lost) return;

            // Trigger OnPostLayer hook for brute-force (attack = true)
            FireSoftwareHook((sw, count) => sw.OnPostLayer(this, count, bypassedByAttack: true));

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
        var layer = _layers[CurrentLayerIndex];
        layer.IsBypassed = true;

        // Trigger OnPostLayer hook for passcode (attack = false)
        FireSoftwareHook((sw, count) => sw.OnPostLayer(this, count, bypassedByAttack: false));

        CurrentLayerIndex++;
        State = MissionState.ExecutionFlowing;
        Flow(_currentProgramColors);
    }

    public void TakeConsequence()
    {
        if (State != MissionState.Prompt) return;
        var layer = _layers[CurrentLayerIndex];
        layer.Consequence.Trigger(this);
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

    /// <summary>
    /// Reveals the next unprobed layers ahead so the player can plan before attempting
    /// them (spec §9.6). Available between executions. Cost and reveal count are [TBD]
    /// and live in <see cref="GameConstants"/>.
    /// </summary>
    public void Probe()
    {
        if (State != MissionState.Idle && State != MissionState.Halted) return;

        Trace.Increase(GameConstants.ProbeTraceCost);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            return;
        }

        int revealed = 0;
        foreach (var layer in _layers)
        {
            if (revealed >= GameConstants.ProbeRevealCount) break;
            if (!layer.IsProbed)
            {
                layer.IsProbed = true;
                revealed++;
            }
        }
    }

    /// <summary>
    /// Leaves the server entirely (spec §9.5). The return-to-map transition and any
    /// abandon penalty are outer-ring/meta concerns and are [TBD].
    /// </summary>
    public void Abandon()
    {
        if (State != MissionState.Idle && State != MissionState.Halted && State != MissionState.Prompt) return;
        State = MissionState.Abandoned;
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

    // These methods are called only by ICountermeasure/IConsequence implementations
    // that live in Grid.Core. Internal access prevents the outer ring from bypassing
    // the guarded command methods to mutate mission state directly.

    private void FireSoftwareHook(Action<SoftwareBase, int> hook)
    {
        foreach (var (symbol, software) in _softwareSlots)
        {
            if (software != null && _currentProgramSymbols[symbol] > 0)
                hook(software, _currentProgramSymbols[symbol]);
        }
    }

    private void TriggerEndFlow(bool won)
    {
        if (_endFlowFired) return;
        _endFlowFired = true;

        FireSoftwareHook((sw, count) => sw.OnEndFlow(this, count, won));
    }

    internal void AddTrace(int amount)
    {
        Trace.Increase(amount);
        if (Trace.IsMaxedOut)
        {
            State = MissionState.Lost;
            TriggerEndFlow(won: false);
        }
    }

    internal void SpendCompute(int amount)
    {
        Compute.Drain(amount);
    }

    internal void HaltExecution()
    {
        State = MissionState.Halted;
        CurrentLayerIndex = 0;
        TriggerEndFlow(won: false);
    }

    internal void ReduceTrace(int amount)
    {
        Trace.Decrease(amount);
    }

    internal void IncreaseMaxCompute(int amount)
    {
        Compute.IncreaseMax(amount);
    }

    internal void AddCorruptCellToPool()
    {
        Pool.AddCorruptCell();
    }

    internal void LoseCredits(int amount)
    {
        Credits = Math.Max(0, Credits - amount);
    }

    public void InstallSoftware(SoftwareBase software)
    {
        _softwareSlots[software.TargetSlot] = software;
    }

    public void InstallHardware(IHardware hardware)
    {
        _hardware.Add(hardware);
    }
}
