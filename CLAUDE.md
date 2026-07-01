# GRID

A solo roguelite (C# / .NET, Raylib for rendering). The player is a hacker breaching servers
defended by stacked **layers**; a **program** built from a 4×4 grid of colored/symboled data
cells flows down the stack, bypassing layers whose color requirements it satisfies.

The authoritative design lives in [`Docs/`](Docs) — read these before changing mechanics:
- [`GRID_Mission_Design_Spec.md`](Docs/GRID_Mission_Design_Spec.md) — full mechanics (the contract for `Grid.Core`).
- [`GRID_Engineering_Principles.md`](Docs/GRID_Engineering_Principles.md) — architecture rules. **Violations are defects.**
- [`GRID_UIUX_Document.md`](Docs/GRID_UIUX_Document.md) — screen layout, pixel dimensions, palette.

## The one rule that matters most

**Game rules live in a pure core (`Grid.Core`) that knows nothing about rendering, input,
Raylib, or wall-clock time.** Dependencies point inward; the core calls out to nothing.
If you need `using Raylib_cs;` inside `Grid.Core`, the design is wrong — stop.

## Project structure

| Project            | Role                                                      | References          |
|--------------------|----------------------------------------------------------|---------------------|
| `Grid.Core`        | Pure rules + state (matching, resources, layer flow).    | nothing game-specific |
| `Grid.Core.Tests`  | xUnit. The core is non-negotiably covered.               | `Grid.Core`         |
| `Grid.App`         | Composition root: window, loop, manual DI wiring.        | Core + Render + Input |
| `Grid.Render`      | Raylib backend (`IRenderer`) + `Palette`/`Layout`.       | Raylib-cs, Core     |
| `Grid.Input`       | Raw input → core commands. Inverse-scales mouse coords.  | Raylib-cs, Render, Core |
| `Grid.Persistence` | Save/load stub (local files only).                       | Core                |

## Build & test

```sh
dotnet build Grid.slnx        # whole solution; TreatWarningsAsErrors is ON
dotnet test  Grid.Core.Tests  # the suite that must stay green
dotnet run --project Grid.App # launch the game window
```

Nullable reference types are on everywhere. The build must be **0 warnings**.

## Conventions (enforced)

- **State as a machine, not booleans.** `MissionState` drives the mission
  (`Idle → ExecutionFlowing → Prompt → Halted | Won | Lost | Abandoned`). Don't add parallel
  `isX` flags for mission-level state.
- **Randomness is injected.** Everything random in the core flows through `IRandom`
  (`SeededRandom`). No `new Random()` / `Random.Shared` / `DateTime.Now` in `Grid.Core` — runs
  must be reproducible from a seed (and unit-testable with a fixed/sequence RNG).
- **Costs are data.** Tunable values (compute curve, reset/brute-force/probe costs, success %)
  live in [`Grid.Core/GameConstants.cs`](Grid.Core/GameConstants.cs), never inlined.
- **No magic pixels or hex.** All layout geometry derives from
  [`Grid.Render/Layout.cs`](Grid.Render/Layout.cs); all colors from
  [`Grid.Render/Palette.cs`](Grid.Render/Palette.cs). The grid cell rectangle has one source of
  truth (`Layout.CellOrigin`) shared by the renderer and the input hit-tester so they can't drift.
- **Internal resolution is 480×270**, drawn to a `RenderTexture2D` and nearest-neighbor scaled.
  No component sees window-space coordinates; input inverse-scales to internal space first.
- **`[TBD]` / `[Open design space]` are seams, not blockers.** Where the spec is open
  (countermeasure/consequence/software/hardware effects, probe cost, abandon penalty), build a
  small interface + one default implementation + a `TODO` referencing the spec section. Don't
  invent mechanics the spec doesn't state.

## Core extension points

- **Layer effects:** implement `ICountermeasure` (fires on attack: bypass/brute-force) or
  `IConsequence` (fires on decline at a prompt). Mutate the mission only through its `internal`
  command methods — never expose public setters on core state.
- **Software:** subclass `SoftwareBase` and override the relevant hook (`OnLaunch`, `OnPrompt`,
  `OnPostLayer`, `OnEndFlow`). Activates when the executed program contains the slot's symbol.
- **Hardware:** implement `IHardware` (passive/triggered, built from a schematic).
- **Matching** is one pure, total function: `MatchingEngine.CanBypass(colors, requirement)`.
  The spec's worked example (§5.3) is a literal test case.

## Not yet implemented (open seams)

- Probe (`Mission.Probe`) and Abandon (`Mission.Abandon`) exist as core commands with default
  cost/penalty constants flagged `[TBD]`.
- Pre-mission temporary-compute purchase (spec §3.4).
- Map/node layer, megacorps, meta-progression — out of single-mission scope (spec §12).
