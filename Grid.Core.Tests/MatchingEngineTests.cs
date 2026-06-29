using System.Collections.Generic;
using Xunit;
using Grid.Core;

namespace Grid.Core.Tests;

public class MatchingEngineTests
{
    [Fact]
    public void CanBypass_WorkedExampleFromSpec()
    {
        // Program colors = {cyan, pink, pink, amber}
        var programColors = new List<CellColor>
        {
            CellColor.Cyan,
            CellColor.Pink,
            CellColor.Pink,
            CellColor.Amber
        };

        // "pink, pink, any" — two pinks + one extra fills the wildcard.
        var req1 = new LayerRequirement(1, CellColor.Pink, CellColor.Pink);
        Assert.True(MatchingEngine.CanBypass(programColors, req1));

        // "cyan, any" — cyan + one extra.
        var req2 = new LayerRequirement(1, CellColor.Cyan);
        Assert.True(MatchingEngine.CanBypass(programColors, req2));

        // "amber, any, any" — amber + two extras.
        var req3 = new LayerRequirement(2, CellColor.Amber);
        Assert.True(MatchingEngine.CanBypass(programColors, req3));

        // "cyan, pink" — both present.
        var req4 = new LayerRequirement(0, CellColor.Cyan, CellColor.Pink);
        Assert.True(MatchingEngine.CanBypass(programColors, req4));

        // "cyan, cyan, any" — only one cyan available (should fail).
        var reqFail = new LayerRequirement(1, CellColor.Cyan, CellColor.Cyan);
        Assert.False(MatchingEngine.CanBypass(programColors, reqFail));
    }

    [Fact]
    public void CanBypass_ExactMatch_Succeeds()
    {
        var program = new[] { CellColor.Violet, CellColor.Violet };
        var req = new LayerRequirement(0, CellColor.Violet, CellColor.Violet);
        Assert.True(MatchingEngine.CanBypass(program, req));
    }

    [Fact]
    public void CanBypass_MissingColor_Fails()
    {
        var program = new[] { CellColor.Cyan, CellColor.Pink };
        var req = new LayerRequirement(0, CellColor.Cyan, CellColor.Amber);
        Assert.False(MatchingEngine.CanBypass(program, req));
    }

    [Fact]
    public void CanBypass_NotEnoughOfSpecificColor_Fails()
    {
        var program = new[] { CellColor.Cyan, CellColor.Pink };
        var req = new LayerRequirement(0, CellColor.Cyan, CellColor.Cyan);
        Assert.False(MatchingEngine.CanBypass(program, req));
    }
}
