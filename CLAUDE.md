# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:5555)
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

No test runner is configured.

## Architecture

GRID is a cyberpunk deck-building hacking game (React 19 + TypeScript + Zustand + Vite). Players use cards to manipulate a 6×6 grid of colored cells to hack network servers.

### Monorepo Structure

- `src/` — Main React app
- `apps/editor/` — Visual editor for creating cards and nodes (dev server on port 5174: `cd apps/editor && npm run dev`)
- `packages/shared/src/` — Shared types (`CellColor`, `CellSymbol`, `Effect`, `Countermeasure`) imported as `@grid/shared`
- `public/data/` — JSON data files edited via the editor app (`cards.json`, `nodes.json`)

### Core Data Flow

All game actions flow through a single synchronous pipeline in `src/engine/orchestrator.ts`:

1. **`Dispatch(action)`** — sole entry point for all game logic
2. **`buildSnapshot()`** — reads all Zustand stores into a unified `GameSnapshot`
3. **Handler** — routes the action (e.g., `PLAY_CARD`, `RESOLVE_RUN`, `RESOLVE_REPROGRAM`)
4. **`evaluateQueue()`** (`orchestrator/fsm.ts`) — FSM that processes the effect queue, calling registered mechanics
5. **`systemsPipeline()`** — post-effect systems: server progression, countermeasure evaluation
6. **`commitLogicalState()`** — synchronously writes final `StateDeltas` back to all Zustand stores
7. **`buildPlaybackEvents()`** — converts deltas into `PlaybackEvent[]` for animations
8. **`enqueueVisualQueue()`** — feeds animation queue; consumed asynchronously by `PlaybackController`

**Key principle**: Logical state (game rules) commits synchronously; visual state (animations) plays back asynchronously. UI reads from logical stores; `PlaybackController` drives VFX independently.

### State Management

Six Zustand stores in `src/store/`:
- `useGameStore` — phase, effect queue, turn tracking
- `useGridStore` — 6×6 grid of `Cell` objects
- `useServerStore` — network nodes and their layer progress
- `useDeckStore` — hand, deck, discard, trash
- `usePlayerStore` — health, trace, credits
- `useUIStore` — selected card, rotation, spatial metrics
- `useVisualQueueStore` — animation playback queue

### Engine Subdirectories

- `orchestrator/mechanics/` — Effect implementations: `runMechanic`, `reprogramMechanic`, `systemResetMechanic`, `finishCardResolution`
- `orchestrator/handlers/` — Action handlers: initialize, select card, rotate, resolve effects
- `orchestrator/` — `fsm.ts` (effect queue FSM), `systemsPipeline.ts`, `countermeasureExecutor.ts`, `deltaHelpers.ts`
- `registry/` — `CardRegistry`, `NodeRegistry` (loaded from JSON via `loader.ts`)

### Game Mechanics

**Effects (card abilities):**
- **RUN** — Fit a pattern onto the grid; break matching cells, harvesting their `CellColor` to feed server layers and triggering `CellSymbol` countermeasures
- **REPROGRAM** — Swap/move cell properties between cells (orthogonal or diagonal)
- **SYSTEM_RESET** — Clear viruses from the grid

**Countermeasures** (triggered by symbols when running):
`TRACE`, `HARDWARE_DAMAGE`, `NET_DAMAGE`, `VIRUS`, `CORRUPTION`, `SCRAMBLE`, `NOISE`

**Game phases** (`GamePhase`): `MENU` → `PLAYING` → `EFFECT_ORDERING` → `EFFECT_RESOLUTION` → `RESOLVING_NET_DAMAGE` → `VICTORY` / `GAME_OVER`

### Editor App (`apps/editor/`)

A schema-driven visual editor used to author `cards.json` and `nodes.json`. It persists to `localStorage` and exports JSON that gets placed in `public/data/`.

The editor renders form fields dynamically from runtime metadata defined in `packages/shared/src/types.ts`:
- **`EFFECT_METADATA`** — `Record<Effect['type'], Blueprint>` — drives the card effect UI
- **`COUNTERMEASURE_METADATA`** — `Blueprint` — drives the countermeasure UI

Each `Blueprint` has `fields: Record<string, BlueprintField>` where `BlueprintField.type` controls which input component renders (`number`, `select`, `coordinate_array`, `symbol_array`, etc.). `BlueprintRenderer` in `App.tsx` switches on this type.

Import validation uses Zod schemas from `packages/shared/src/schema.ts` (`CardPoolSchema`, `NodePoolsSchema`).

### Adding New Effects or Countermeasures

When adding a new `Effect` type or `Countermeasure` type, **all of these must be updated together**:

1. **`packages/shared/src/types.ts`** — Add the new type to `Effect` or `Countermeasure` union; add an entry to `EFFECT_METADATA` or update `COUNTERMEASURE_METADATA` so the editor renders it
2. **`packages/shared/src/schema.ts`** — Add the new Zod schema variant (`EffectXxxSchema`) and include it in the discriminated union (`EffectSchema`) or enum
3. **`src/engine/orchestrator/countermeasureExecutor.ts`** — Handle the new countermeasure in `applyCountermeasure()`; or register a new mechanic in `orchestrator/mechanicsInit.ts` for new effects
4. **`public/data/cards.json` / `nodes.json`** — Add data using the editor app
