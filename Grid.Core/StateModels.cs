using System;
using System.Collections.Generic;

namespace Grid.Core;

public class Trace
{
    public int Value { get; private set; }
    public int Max { get; }

    public Trace(int max = 10) // default max TBD
    {
        Max = max;
    }

    public void Increase(int amount)
    {
        Value = Math.Min(Value + amount, Max);
    }

    public bool IsMaxedOut => Value >= Max;
}

public class Compute
{
    public int Value { get; private set; }
    public int Max { get; private set; } // May be increased by hardware

    public Compute(int startingCompute = 10) // default starting compute TBD
    {
        Max = startingCompute;
        Value = Max;
    }

    public void Spend(int amount)
    {
        if (amount > Value) throw new InvalidOperationException("Not enough compute.");
        Value -= amount;
    }

    public void Drain(int amount)
    {
        Value = Math.Max(0, Value - amount);
    }

    public void Refresh()
    {
        Value = Max;
    }

    public static int CalculateCost(int numberOfCells)
    {
        // Costs 1 + 2 + 3 + 4...
        // Sum of first N integers is n * (n + 1) / 2
        return (numberOfCells * (numberOfCells + 1)) / 2;
    }
}

public class Pool
{
    private readonly List<Cell> _cells = new();

    public Pool()
    {
        // 16 base cells
        foreach (CellColor color in Enum.GetValues<CellColor>())
        {
            foreach (CellSymbol symbol in Enum.GetValues<CellSymbol>())
            {
                _cells.Add(new Cell(color, symbol));
            }
        }
    }

    public IReadOnlyList<Cell> GetCells() => _cells.AsReadOnly();

    public void AddCorruptCell()
    {
        _cells.Add(new Cell(CellColor.Cyan, CellSymbol.Circle, IsCorrupt: true));
    }
}

public class GridData
{
    public const int Cols = 4;
    public const int Rows = 4;

    private readonly Cell?[,] _cells = new Cell?[Cols, Rows];

    public void Refill(Pool pool, IRandom rng)
    {
        var poolCells = new List<Cell>(pool.GetCells());

        // Shuffle
        int n = poolCells.Count;
        while (n > 1)
        {
            n--;
            int k = rng.Next(n + 1);
            (poolCells[k], poolCells[n]) = (poolCells[n], poolCells[k]);
        }

        // Fill grid (assuming pool size >= 16)
        int idx = 0;
        for (int y = 0; y < Rows; y++)
        {
            for (int x = 0; x < Cols; x++)
            {
                if (idx < poolCells.Count)
                {
                    _cells[x, y] = poolCells[idx++];
                }
                else
                {
                    _cells[x, y] = null;
                }
            }
        }
    }

    public Cell? GetCell(int x, int y) => _cells[x, y];

    public void RemoveCell(int x, int y)
    {
        _cells[x, y] = null;
    }
}

public interface IRandom
{
    int Next(int maxValue);
}

public class SeededRandom : IRandom
{
    private readonly Random _random;

    public SeededRandom(int seed)
    {
        _random = new Random(seed);
    }

    public int Next(int maxValue) => _random.Next(maxValue);
}
