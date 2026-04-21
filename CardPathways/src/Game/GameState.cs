using System.Collections.Generic;
using CardPathways.Data;

namespace CardPathways.Game;

public class GameState
{
    public MapTile[,] Map { get; init; } = new MapTile[5, 5];
    public List<CardDefinition> Deck { get; init; } = new();
    public List<CardDefinition> Hand { get; init; } = new();
    public List<CardDefinition> Discard { get; init; } = new();
    public MapCoord CurrentCell { get; set; }
    public Direction EntryEdge { get; set; }
    public SubCell[,] ActiveCardGrid { get; set; } = new SubCell[9, 9];
    public HashSet<SubCoord> Reachable { get; set; } = new();
    public GameStatus Status { get; set; } = GameStatus.Playing;

    // Store active card def to know hand size & ID for discarding
    public CardDefinition ActiveCardDef { get; set; } = null!;
}
