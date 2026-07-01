using System.Collections.Generic;
using System.Linq;

namespace Grid.Core;

public static class MatchingEngine
{
    public static bool CanBypass(IEnumerable<CellColor> programColors, LayerRequirement requirement)
    {
        var programColorCounts = programColors
            .GroupBy(c => c)
            .ToDictionary(g => g.Key, g => g.Count());

        var requiredColorCounts = requirement.RequiredColors
            .GroupBy(c => c)
            .ToDictionary(g => g.Key, g => g.Count());

        int availableWildcards = 0;

        foreach (var kvp in programColorCounts)
        {
            var color = kvp.Key;
            var count = kvp.Value;

            if (requiredColorCounts.TryGetValue(color, out var requiredCount))
            {
                if (count < requiredCount)
                {
                    return false; // Missing specific required colors
                }
                availableWildcards += count - requiredCount;
            }
            else
            {
                availableWildcards += count;
            }
        }

        // Check if any specific colors are completely missing from the program
        foreach (var kvp in requiredColorCounts)
        {
             if (!programColorCounts.ContainsKey(kvp.Key) && kvp.Value > 0)
             {
                 return false;
             }
        }

        return availableWildcards >= requirement.WildcardCount;
    }
}
