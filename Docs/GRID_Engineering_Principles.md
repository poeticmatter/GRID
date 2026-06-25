# GRID — Engineering Principles & Architecture

**Audience:** the coding agent (Claude / Gemini). You are assumed competent; these are constraints, not a tutorial.
**Status:** This is a production codebase, not a prototype. Violations are defects.

---

## 0. Stack (fixed)

- **Language:** C# / .NET 9+. Nullable reference types **on**. `TreatWarningsAsErrors` **on**.
- **Rendering:** Raylib-cs, native desktop. Accessed **only** through the render interface (§3) — that boundary exists for headless testability, not portability. No `Raylib.*` call exists outside the rendering backend project.
- **Tests:** xUnit. The core ships with tests from the first commit.
- **Build:** `dotnet build` / `dotnet run` / `dotnet test`. No engine, no editor, no content pipeline.
- **No networking.** Solo game. Do not add a transport, socket, or realtime library. Persistence is local files; any future backend is `HttpClient` behind an interface.

---

## 1. The one rule that matters most

**Game rules live in a pure core that knows nothing about rendering, input, Raylib, or wall-clock time.**

The core is the single source of truth for all of GRID's mechanics: grid/data state, program building & color-multiset matching, layer bypass/brute-force/passcode resolution, prompts, halts, resets, trace/compute/credits, win/loss. It is plain C# that runs headless in a unit test with no window open.

Everything else — Raylib, input hit-testing, animation, sound, files — is an outer ring that **observes and drives** the core. The outer ring may call into the core; the core may never call out.

If a game rule is implemented inside a UI or rendering class, that is a defect regardless of whether it "works."

---

## 2. Project structure (enforced by reference direction)

```
Grid.Core         // pure rules + state. References: nothing game-specific. NO Raylib.
Grid.Core.Tests   // xUnit. References: Grid.Core.
Grid.App          // composition root: window, loop, wiring. References: Core + Render + Input.
Grid.Render       // Raylib backend. Implements IRenderer. References: Raylib-cs.
Grid.Input        // input → intents. References: Raylib-cs (or abstracted).
Grid.Persistence  // save/load. References: Core. Local files only.
```

**Dependencies point inward.** `Grid.Core` depends on nothing in this list. If you ever need to add a `using` for Raylib inside `Grid.Core`, stop — the design is wrong, not the compiler.

---

## 3. Rendering & input cross the boundary as data, not calls

- The UI/app layer produces **intent** (a frame's worth of "what to draw" — cells, layer cards, the prompt, resource bars) and hands it to an `IRenderer`. The Raylib backend is the one implementation; a headless/fake implementation exists for tests. The app never calls `Raylib.*` directly.
- Input enters as **semantic intents** (`SelectCell(x,y)`, `Execute`, `BruteForce`, `UsePasscode`, `Reset(kind)`, `Probe`, `Abandon`), never as raw mouse coordinates threaded into rules. Hit-testing (pixel → cell) happens in the input/UI layer and is translated to an intent before the core sees it.
- The core exposes **queries** (read state) and **commands** (apply an intent, get a result). It does not push pixels and is never handed a `Rectangle`.

This seam keeps rules separable from presentation and lets UI-driving logic be tested without a window. Keep it lean — one Raylib backend plus a headless fake for tests. Do not build a second real backend or abstract beyond what testing earns.

---

## 4. State, determinism, immutability

- **Model state explicitly.** A mission is a state machine: `Idle → ExecutionFlowing → Prompt → (Halted | Won)`, plus reset/probe transitions. Represent states as distinct types, not a pile of booleans (`isFlowing`, `isPrompt`, `isWon`…). Illegal states should be unrepresentable.
- **All randomness flows through one injected RNG** (`IRandom`/seeded). No `new Random()` and no `Random.Shared` anywhere in the core. Roguelite runs must be reproducible from a seed — for testing, for the "learnable per-target distribution," and for any future daily-seed mode.
- **No hidden time.** The core takes elapsed time as a parameter if it ever needs it; it never reads `DateTime.Now` or a Stopwatch. Animation timing lives in the render layer and must not affect rule outcomes.
- **Prefer immutable data for values** (a cell, a layer requirement, a program's color multiset are records). Mutate the aggregate root (the mission/grid) through intent-handling methods, not by reaching into fields from outside.
- **Encapsulate.** No public setters on core state for outside layers to poke. State changes only via commands that enforce the rules (e.g. you cannot select a non-contiguous cell, cannot execute with insufficient compute).

---

## 5. Separation of concerns — concrete lines for GRID

- **Matching logic is pure and isolated.** "Does this color multiset contain this requirement (named colors + wildcards)?" is a small, total, heavily-tested function. It does not know what a layer looks like on screen or that compute exists.
- **Resource accounting is one place.** Trace, compute, credits each have a single owner that enforces min/max and emits the loss condition. The UI reads these; it never computes them. Trace-max → run-lost is decided in the core, surfaced to the UI as an event/state.
- **Costs are data, not magic numbers.** Compute cost curve (`1+2+3+4…`), reset costs (hard −3, soft −2), brute-force cost (−2/attempt), execution cost (−1 trace) live in a config/constants module, not inlined across call sites. The spec marks several values `[TBD]`; that is exactly why they must be data you can tune in one place.
- **`[TBD]` and `[Open design space]` are extension points, not blockers.** Where the spec is open (countermeasure effects, consequence effects, software effects, hardware), design the seam now: a small interface or effect type, a default/empty implementation, and a TODO. Do not invent mechanics the spec doesn't state, and do not hard-code today's single behavior in a way that blocks tomorrow's variants (temporary layers, conditional layers, multi-symbol cells).

---

## 6. Anti-patterns — reject these

- **God objects.** No `MissionManager` / `GameManager` that holds everything and does everything. Split by responsibility (matching, resources, layer resolution, flow control).
- **Singletons / global mutable state.** No static mutable game state, no service locator. Dependencies are passed in (constructor injection — plain, no DI framework required).
- **Rules leaking into the view.** No bypass check, cost calculation, or win condition evaluated inside a draw method or input handler.
- **Primitive obsession.** A color is a `Color` enum/type, not a magic `int`; a requirement is a type, not a `List<string>`. Wildcards are modeled explicitly, not represented as a null/empty slot.
- **Boolean state explosions.** See §4 — use state types.
- **Stringly-typed logic.** No driving control flow off string names of colors/symbols/effects.
- **Premature generality.** Don't build a plugin system for one consequence type. Build the seam (§5) and one implementation. YAGNI applies to everything the spec hasn't asked for.
- **Swallowed errors.** No empty `catch`. Invalid commands return an explicit result (rejected + reason); they don't throw-and-ignore or silently no-op.

---

## 7. Smells — fix on sight

- A method that touches both rules and rendering.
- A `using Raylib_cs;` in `Grid.Core`.
- A literal `2`, `3`, `−1` for a cost outside the config module.
- `new Random()` / `DateTime.Now` in the core.
- A class over ~300 lines or a method over ~40 — likely doing too much.
- Duplicated matching/cost logic in two places — extract.
- A public field or setter on core state used by the UI to mutate game state.
- A comment explaining a confusing block — prefer renaming/extracting so the comment is unnecessary. Comment **why**, never **what**.

---

## 8. Testing (the payoff of the pure core)

- **Every rule has a unit test.** Matching (the §5.3 worked example from the spec is a literal test case), cost curves, reset effects, trace-max loss, prompt outcomes, countermeasure-triggers-on-attack vs. passcode-does-not.
- Tests run with **no window and no Raylib**. If a rule can't be tested headless, it's in the wrong layer.
- **Seeded RNG** makes "random" outcomes deterministic in tests. Test the distribution/branches, not luck.
- A test for each fixed bug, so it stays fixed.
- The render/input layers may stay light on tests; the **core is non-negotiably covered**.

---

## 9. Style & hygiene

- Standard .NET conventions; run `dotnet format`. Consistency over preference.
- Names say intent: `CanBypass`, `ColorMultiset`, `ResolvePrompt` — not `Check`, `data2`, `DoStuff`.
- Small, single-purpose methods. Pure functions where possible (input → output, no side effects) — they're the easiest to read and test.
- Nullable enabled; no `!` null-forgiveness to silence the compiler — fix the nullability instead.
- One public type per file, file named for the type.
- No dead code, no commented-out blocks — version control remembers.

---

## 10. Working agreement for the agent

1. **Respect the boundary (§1–§3) above all.** When unsure where code belongs, it belongs in the core if it's a rule, outside if it's presentation/IO.
2. **Don't invent mechanics.** Implement the spec. Where the spec says `[TBD]`, build the seam and a default, and flag it — do not guess gameplay.
3. **Keep the core pure.** No rendering, input, or wall-clock time in `Grid.Core`. Local file IO is fine in `Grid.Persistence`, not the core. Randomness and time are injected (§4), never reached for directly.
4. **When a change spans layers, state the plan first** (which project, which seam) before writing code.
5. **If a requested change forces a violation** (e.g. "just read the mouse position in the core"), say so and propose the correct seam instead.
