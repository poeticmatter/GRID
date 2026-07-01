using Grid.Core;

namespace Grid.Core.Tests;

public class ComputeTests
{
    [Theory]
    [InlineData(1, 1)]
    [InlineData(2, 3)]
    [InlineData(3, 6)]
    [InlineData(4, 10)]
    [InlineData(5, 15)]
    public void CalculateCost_MatchesTriangularNumberSequence(int cells, int expectedCost)
    {
        Assert.Equal(expectedCost, Compute.CalculateCost(cells));
    }

    [Fact]
    public void Spend_ReducesValueByAmount()
    {
        var compute = new Compute(10);
        compute.Spend(3);
        Assert.Equal(7, compute.Value);
    }

    [Fact]
    public void Spend_WhenInsufficientCompute_Throws()
    {
        var compute = new Compute(5);
        Assert.Throws<InvalidOperationException>(() => compute.Spend(6));
    }

    [Fact]
    public void Refresh_RestoresValueToMax()
    {
        var compute = new Compute(10);
        compute.Spend(7);
        compute.Refresh();
        Assert.Equal(10, compute.Value);
    }
}
