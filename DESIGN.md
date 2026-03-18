# GRID — Game Design Document

> **Purpose:** This document describes the current implemented rules of GRID as a reference for design discussion. It is derived from the source code and is the authoritative description of how the game behaves. Update this document whenever a mechanic changes.

---

## Overview

GRID is a single-player cyberpunk deck-building hacking game. The player is a hacker attempting to breach a corporate network by manipulating a 6×6 grid of coloured data cells using a hand of program cards. The network is defended by ICE nodes that punish mistakes with countermeasures. The objective is to hack through to the Mainframe before being traced, destroyed, or running out of programs to execute.

---

## The Grid

The play area is a **6×6 grid of cells**. Each cell has four properties:

| Property | Values |
|---|---|
| **Color** | `ORANGE`, `SKY`, `EMERALD`, `LIME`, `FUCHSIA` |
| **Symbol** | `CUBE`, `TRIANGLE`, `NESTED`, `STAR`, `ORBIT`, `NONE` |
| **State** | `PRIMED`, `BROKEN`, `CORRUPTED` |
| **Virus flag** | present or absent |

- `PRIMED` cells are available for targeting — this is the normal state of every cell.
- `BROKEN` cells have been consumed by a RUN and cannot be targeted again.
- `CORRUPTED` cells have been corrupted by a countermeasure; they cannot be targeted and display visual noise.
- Cells with the **virus flag** have a visible infection marker and impose restrictions (details under VIRUS countermeasure).

At the start of each turn the grid resets to a fresh state via **System Reset**, or persists between card plays within a turn.

---

## Player Resources

The player has three tracked resources:

### Hardware Health
- Represents the physical integrity of the player's rig.
- Reduced by `HARDWARE_DAMAGE` countermeasures.
- Reaching **0** is an immediate **Game Over**.

### Trace
- Represents how closely corporate security is tracking the player.
- Maximum is **15** (default).
- Increased by `TRACE` countermeasures and System Reset penalties.
- Reaching **maximum Trace** is an immediate **Game Over**.

### Credits
- Earned by hacking nodes: **difficulty × 10** per node hacked.
- Currently tracked but not spent — reserved for future mechanics.

---

## Cards & the Deck

Cards are the player's primary tool. Each card has:
- A **name**.
- One or more **effects** (see Effects section).
- A **memory** cost (currently tracked, not yet spent).
- A **weight** (used by the procedural card pool for deck building).

### Piles

| Pile | Description |
|---|---|
| **Hand** | Cards available to play this turn. |
| **Deck** | Face-down draw pile. Shuffled when exhausted. |
| **Discard** | Played or spent cards waiting to be recycled. |
| **Trash** | Permanently removed cards. Cannot be recovered. |

### The Starting Deck

The default starting deck contains these cards (all marked `isStartingCard`):

| Card | Effect | Notes |
|---|---|---|
| **Fidget** | RUN — 3-cell L-shape | Compact pattern for tight spaces |
| **Creeper** | RUN — 3-cell vertical line | Good for column harvesting |
| **Buster** | RUN — 4-cell T-shape | Wider area coverage |
| **Data Miner** | REPROGRAM ×3 | Allows 3 cell swaps |
| **System Reset** | SYSTEM_RESET | Last resort / recovery card |

### Playing Cards

During the `PLAYING` phase the player selects a card. This immediately plays it: effects are queued and the game moves to `EFFECT_ORDERING` (if multiple effects) or directly to `EFFECT_RESOLUTION`. There is no separate "confirm play" step for single-effect cards.

After all effects resolve, the card moves to the **discard pile** and the turn advances. The deck is shuffled into a new draw pile when the deck runs dry.

---

## Effects

### RUN

The core offensive action. The player places a **pattern** of cells onto the grid at a chosen anchor point and rotation. All cells under the pattern are **broken** (consumed), and their properties are harvested.

**Harvesting:**
- Each broken cell contributes its **colour** to the server progress tally.
- Each broken cell contributes its **symbol** to the countermeasure neutralisation tally.

**Pattern placement rules:**
- The pattern can be rotated before placement (90° increments).
- `CORRUPTED` cells block pattern placement — a pattern cannot be placed if any cell it covers is `CORRUPTED`. `BROKEN` cells do not block; they can be included in a pattern but contribute nothing to harvesting.
- The pattern must fit within the 6×6 boundary.

After the RUN resolves, harvested colours are applied to all currently active server nodes (see Network section), and countermeasures are evaluated.

---

### REPROGRAM

A cell manipulation effect. The player performs a number of **swaps** up to the card's `amount`.

**Rules:**
- Each swap moves the **colour and symbol** of one cell onto an orthogonally adjacent cell (up, down, left, right — not diagonal).
- If the destination cell is `BROKEN`, the source cell's properties move into it and the source cell becomes `BROKEN` — effectively sliding a live cell into a broken slot.
- If both cells are `BROKEN`, the swap is invalid.
- The player can stop early; unused swaps are forfeited.
- The card is marked as committed after the first successful swap, meaning it cannot be cancelled mid-chain.

REPROGRAM does not harvest colours or trigger countermeasures.

---

### SYSTEM_RESET

An emergency recovery card. Playing it enters a **confirmation state** — the player must explicitly confirm before the reset executes. This gives the player time to review the incoming penalties.

On confirmation, the following happen in order:

1. **Grid wipe.** The entire 6×6 grid is regenerated fresh. All broken, corrupted, and virus-infected cells are cleared.
2. **Card recovery.** The active card and the entire discard pile are returned to hand. The hand is then topped up to `maxHandSize` by drawing from the deck (shuffling the discard into a new deck if necessary).
3. **Local countermeasures fire.** Every countermeasure on every currently **active** node fires unconditionally (see Countermeasures section). These are the standard node defences.
4. **Global countermeasures fire.** Every **global countermeasure** on any `SERVER` or `MAINFRAME` node in the entire network dictionary fires unconditionally — regardless of whether that node is currently active or has been hacked (see Global Countermeasures section).
5. **Turn advances** by 1.

**Fatal crash:** If the System Reset card is ever sent to the **trash pile** (e.g. via Net Damage discarding), the game ends immediately with a **Game Over**. The card must survive to be useful — losing it is catastrophic.

The Console UI warns the player of all incoming countermeasures before they confirm. The Trace Bar displays a ghost projection of the Trace increase so the player can evaluate the risk.

---

## The Network

The player is attacking a **network graph** of nodes. Nodes form a tree: the root is a `HOME` node and the ultimate target is a `MAINFRAME`.

### Node Types

| Type | Role |
|---|---|
| `ICE` | Frontline defensive node. Blocking the path to servers. |
| `SERVER` | Mid-tier target. Guards the path to the Mainframe. Can have global countermeasures. |
| `MAINFRAME` | The final target. Hacking this wins the game. Can have global countermeasures. |
| `HOME` | The player's entry point. Not a target. |

### Node Properties

Each node has:
- **Layers** — a set of colour requirements the player must fill by harvesting (e.g. `ORANGE: [2, 3]` means two lanes: one needs 2 orange cells harvested, one needs 3).
- **Progress** — which lanes are completed. A node is `HACKED` when all lanes of all colours are filled.
- **Countermeasures** — defences that fire under specific conditions during a RUN.
- **Global Countermeasures** (`SERVER`/`MAINFRAME` only) — defences that fire unconditionally on System Reset.
- **Reset Trace** — a per-node trace penalty on reset (currently tracked in data; execution pipeline is a candidate for future wiring).
- **Status** — `ACTIVE`, `HACKED`, `LOCKED`, `BYPASSED`.
- **Visibility** — `HIDDEN` or `REVEALED`.
- **Horizontal connection flag** — cosmetic layout hint for the network graph renderer.

### Node Activation & Progression

- The player can only interact with **active** nodes.
- Initially only the frontline ICE nodes are active.
- When a node is **hacked**, its direct children become `REVEALED` (visible but not active).
- The player must manually **access** a revealed node (`ACCESS_NODE` action) to make it active and begin attacking it.
- If a node's entire subtree becomes irrelevant (all paths lead to hacked nodes), it is marked `BYPASSED`.

### Layer Filling

When a RUN resolves, harvested colours are applied to all currently active nodes simultaneously. Colour progress fills lanes sequentially — surplus harvested colour carries over to the next unfilled lane within the same colour. Colour harvested beyond a node's requirements is wasted.

A node becomes `HACKED` when every lane of every colour is fully complete. The player earns **difficulty × 10 credits** per hacked node.

---

## Countermeasures

Countermeasures are defensive penalties on nodes. There are two kinds.

### Local Countermeasures (triggered during RUN)

Each node has a list of countermeasures. Each countermeasure has:
- `requiredSymbols[]` — a list of symbols the player must harvest to **neutralise** it.
- `type` — the penalty type.
- `value` — the severity.

**Activation logic:** A countermeasure fires if, and only if, **both** of the following are true:
1. The RUN **advanced the node's progress** (at least one lane ticked forward).
2. The player harvested **fewer** of one or more `requiredSymbols` than required.

This means players can neutralise countermeasures by ensuring their run pattern breaks enough cells with the matching symbols. If `requiredSymbols` is empty, the countermeasure never fires via this path.

### Global Countermeasures (triggered on System Reset)

Attached exclusively to `SERVER` and `MAINFRAME` nodes. They have the same `type`/`value` structure as local countermeasures but **no `requiredSymbols`** — they always fire when System Reset is confirmed. They fire across the entire node dictionary, not just active nodes.

### Countermeasure Types

| Type | Effect |
|---|---|
| `TRACE` | Adds `value` to the player's Trace. |
| `HARDWARE_DAMAGE` | Subtracts `value` from Hardware Health. |
| `NET_DAMAGE` | Adds `value` to a pending net damage tally. After all CMs resolve, the player must **discard** that many cards from hand to stabilise. Cards discarded this way go to trash, not discard — permanent loss. |
| `VIRUS` | Infects `value` random `PRIMED` cells with a virus marker. |
| `CORRUPT` | Corrupts `value` random `PRIMED` cells, setting their state to `CORRUPTED`. Corrupted cells cannot be targeted. |
| `NOISE` | Adds a new lane requirement to a random active node, increasing its hacking cost. |

---

## Win & Loss Conditions

### Victory
Hack the **Mainframe** node. The game transitions to `VICTORY`.

### Game Over — any of the following:
| Condition | Trigger |
|---|---|
| **Hardware destroyed** | Hardware Health reaches 0 |
| **Fully traced** | Trace reaches its maximum (15) |
| **No programs left** | Hand and deck are both empty simultaneously |
| **Fatal crash** | The System Reset card is sent to the trash pile |

---

## Game Flow (Phases)

```
MENU
  └─► PLAYING          Player selects a card to play
        └─► EFFECT_ORDERING     (only if card has multiple effects)
                                Player queues effects in desired order
              └─► EFFECT_RESOLUTION
                        Effects execute one at a time:
                        - RUN: player places pattern, confirms
                        - REPROGRAM: player swaps cells up to amount
                        - SYSTEM_RESET: player confirms wipe
                              └─► RESOLVING_NET_DAMAGE  (if net damage tally > 0)
                                        Player discards cards to absorb damage
                                              └─► PLAYING  (next turn)
  └─► VICTORY          Mainframe hacked
  └─► GAME_OVER        Any loss condition met
```

**Multi-effect cards:** A single card can carry multiple effects (e.g. RUN + REPROGRAM). The player orders them during `EFFECT_ORDERING`, then they resolve sequentially in `EFFECT_RESOLUTION`.

---

## Design Notes & Open Questions

The following are areas with intentional design space or known loose ends as of this document version.

- **Credits** are tracked and awarded but have no spend mechanic yet. This is reserved for a future shop, upgrade, or bypass system.
- **Reset Trace** (`resetTrace` field on nodes) is stored in node data but the execution pipeline does not yet apply it on System Reset. It may replace or augment the current countermeasure-on-reset model.
- **Countermeasure neutralisation** is currently an inverse check (fire if you harvest *fewer* symbols than required). This creates the interesting design where players must strategically break specific symbols. Whether the threshold should be exact or a minimum is an open question.
- **Net Damage cap:** The net damage tally is capped to the current hand size to prevent a soft-lock where the player cannot satisfy the discard requirement.
- **System Reset scope:** Currently, global CMs fire from all SERVER/MAINFRAME nodes in the entire network dictionary, including already-hacked ones. Whether this is intentional "residual ICE" or should be restricted to non-hacked nodes is an open question.
- **Bypassed nodes** do not award credits. Whether bypassed nodes should partially reward (or penalise) the player is unresolved.
- **Node access** is currently a free action. Whether accessing a revealed node should cost resources is an open design decision.
