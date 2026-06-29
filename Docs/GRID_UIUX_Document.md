# GRID — UI/UX Document

**Scope:** This document covers the user-facing experience of a single mission: screen layout, on-screen arrangement, pixel dimensions, and user flows. It assumes the mechanics defined in *GRID — Mission Design Specification*. The map/node screen is sketched only where it bookends a mission. Concrete color and symbol art direction is specified here.

---

## 1. Platform Strategy

Desktop only. Internal resolution 480×270, rendered to a `RenderTexture2D` and scaled to the window with nearest-neighbor filtering. Integer scale targets: ×2 = 540p, ×3 = 810p, ×4 = 1080p, ×5 = 1350p.

No mobile target. No web export. No wasm constraints on core.

---

## 2. The Spatial Metaphor

The whole mission screen is organized around a single readable idea: **the program descends through a vertical stack of layers.**

```
        [ TOP BAR: Trace ▮▮▮▯▯  Compute ⚡12  Credits ¤340 ]

        ┌───────────── SERVER (layer stack) ─────────────┐
        │  Layer 1   ● ● ◇    [bypassed]                 │
        │  Layer 2   ● ● ○    ◀ program is here          │
        │  Layer 3   ▩ locked / unprobed                 │
        │  …unknown depth…                                │
        └────────────────────────────────────────────────┘

                    ▼ program flows downward ▼

        ┌──────────────── THE GRID (data) ───────────────┐
        │   [▲C] [■P] [●A] [◆V]                          │
        │   [●C] [■P] [▲V] [●A]    ← tap to select       │
        │   [◆A] [▲C] [■V] [●P]                          │
        │   [■C] [◆P] [●A] [▲V]                          │
        └────────────────────────────────────────────────┘

   [ HARDWARE ]   [ ⚡ EXECUTE ]   [ RESET ▸ ]   [ SOFTWARE ]
```

- **Top:** resources (always visible).
- **Middle-upper:** the server as a vertical layer stack the program moves *down* through.
- **Middle-lower:** the grid, the player's primary interaction zone.
- **Bottom:** the action bar.

Reading top-to-bottom mirrors the fiction: you assemble data at the bottom, fire it into the server, and it works **down** the stack toward server access.

---

## 3. Screen Layout — Pixel Dimensions

All values are at internal resolution (480×270). Final rendered size = internal × integer scale factor.

### 3.1 Vertical zones

| Zone              | Height | Y origin |
|-------------------|--------|----------|
| Resource bar      | 14px   | 0        |
| Middle zone       | 238px  | 14       |
| Action bar        | 18px   | 252      |

### 3.2 Grid console

| Element              | Value                                     |
|----------------------|-------------------------------------------|
| Cell size            | 20×20px                                   |
| Cell gap             | 2px                                       |
| Grid content area    | 86×86px  (4×20 + 3×2)                     |
| Console padding      | 8px each side                             |
| Console border       | 2px                                       |
| Grid console total   | 106×106px                                 |
| Horizontal position  | Centered in middle zone                   |

### 3.3 Layer console

| Element              | Value                                                         |
|----------------------|---------------------------------------------------------------|
| Layer row height     | 14px                                                          |
| Layer row gap        | 2px                                                           |
| Visible rows         | 5                                                             |
| Layer content height | 78px  (5×14 + 4×2)                                           |
| Console padding      | 6px each side                                                 |
| Console border       | 2px                                                           |
| Console total height | 98px                                                          |
| Console width        | **[TBD — wider than 106px; lock when layer card content is designed]** |
| Horizontal position  | Centered in middle zone                                       |

### 3.4 Vertical stacking (middle zone)

| Element          | Height |
|------------------|--------|
| Layer console    | 98px   |
| Gap              | 6px    |
| Grid console     | 106px  |
| **Total**        | **210px** |
| Available        | 238px  |
| Headroom         | 28px   |

The 28px of headroom is distributed as top and bottom margin around the two consoles. If console content grows (e.g., layer console width forces layout changes), this is the first budget to draw from.

### 3.5 Side panels

Left and right of the centered consoles: hardware, software, and secondary information. Sizes **[TBD — deferred until content is designed].**

---

## 4. Visual Language: Colors & Symbols

Color is never the only identification channel — every cell also carries a symbol, which provides full redundancy for colorblind players. Symbol render color is fixed per cell color to maximize contrast without introducing additional information channels.

### 4.1 Colors

| ID | Name   | Hex       | Symbol render color | Notes                        |
|----|--------|-----------|---------------------|------------------------------|
| C1 | Cyan   | `#00C8FF` | Black `#0A0A0A`     | Cool; high contrast on dark backgrounds |
| C2 | Pink   | `#FF2D78` | Black `#0A0A0A`     | Warm; readable at small size |
| C3 | Amber  | `#FFB300` | Black `#0A0A0A`     | Warm; distinct from pink in hue and value |
| C4 | Violet | `#9B30FF` | White `#F0F0F0`     | Cool; distinct from cyan in hue and darkness |

Cyan and Violet are both cool-toned but differ enough in hue and lightness to be distinguishable under most colorblindness types. Pink and Amber are both warm but differ in hue. The symbol render color doubles as a contrast guarantee — the player can always read the symbol regardless of the cell color.

### 4.2 Symbols

| ID | Name     | Shape description                     |
|----|----------|---------------------------------------|
| S1 | Circle   | Filled circle                         |
| S2 | Square   | Filled square, axis-aligned           |
| S3 | Triangle | Filled equilateral triangle, point up |
| S4 | Diamond  | Filled square rotated 45°             |

Symbols are chosen for maximum silhouette distinction at 20×20px. No two symbols share a dominant axis or outline shape.

### 4.3 Cell palette (all 16 base cells)

Every row is a color; every column is a symbol. All 16 cells are always present in a fresh pool; the base grid always contains all 16.

|                     | Circle (S1) | Square (S2) | Triangle (S3) | Diamond (S4) |
|---------------------|-------------|-------------|---------------|--------------|
| **Cyan (C1)**       | C1·S1       | C1·S2       | C1·S3         | C1·S4        |
| **Pink (C2)**       | C2·S1       | C2·S2       | C2·S3         | C2·S4        |
| **Amber (C3)**      | C3·S1       | C3·S2       | C3·S3         | C3·S4        |
| **Violet (C4)**     | C4·S1       | C4·S2       | C4·S3         | C4·S4        |

### 4.4 Special cell rendering

| Cell type    | Visual treatment                                                        |
|--------------|-------------------------------------------------------------------------|
| Base cell    | Color background, symbol in fixed render color, 1px contrast border     |
| Selected     | Glow + lift (additive overlay); compute cost updates live               |
| Corrupt      | Desaturated / static-noise treatment; unmistakably dead weight          |
| Wild         | **[TBD — design pending]**                                              |

---

## 5. Mission Screen — Component Inventory

1. **Resource bar (top, persistent, 480×14px)**
   - **Trace meter:** segmented bar; the dominant, always-visible threat. Animates on increase; warns near max.
   - **Compute:** current value; shows spend preview when cells are selected.
   - **Credits:** current value.

2. **Server / layer console (upper, 98px tall)**
   - Each layer row (14px) shows: requirement color chips, state (unprobed / probed / bypassed-this-execution), and discoverable tags for countermeasure/consequence once known.
   - **Unprobed layers** are obscured. **Probed** layers reveal their requirement. **Bypassed** layers show a passed state but visibly **refresh** between executions.
   - A persistent **"program position" indicator** shows how far the current execution has reached.
   - A **wildcard** slot renders as a distinct neutral chip (e.g., "?" slot) — "cyan, cyan, any" visibly reads as three chips.
   - Layers beyond the 5 visible rows are collapsed; they expand upward as the program descends.

3. **The grid console (lower, 106×106px)**
   - 4×4 of 20×20px cells with 2px gaps. Tap/click to add or remove from current selection.
   - **Selection feedback:** highlighted cells, live readout of the program's **color multiset**, **symbol multiset**, and **compute cost**.
   - **Contiguity feedback:** a cell that would break contiguity is rejected with a clear visual cue.
   - **Software preview:** software slots light up during selection when the program contains the matching symbol.

4. **Action bar (bottom, 480×18px)**
   - **Execute** (primary): disabled until a valid program is selected; shows compute cost.
   - **Reset** control: opens a chooser — **Hard (−3 trace)** or **Soft (−2 trace)**; soft then asks **refill grid** or **refresh compute**.
   - **Software tray:** 4 symbol slots; active-state badges during execution.
   - **Hardware tray:** passive/triggered items; informational, triggered items flagged.
   - **Probe** control: reveals layers ahead. **[Cost/placement TBD.]**
   - **Abandon mission:** tucked away, requires confirm.

5. **Prompt (modal, appears at a stuck layer)**
   - States the layer's requirement and what the program is missing.
   - Offers: **Brute-force (−2 compute, chance)**, **Use passcode**, **Use software** (if applicable), **Take consequence** (halts).
   - Brute-force shows running compute spent; lets the player **try again (−2)** or **stop** after each failure.
   - Clearly distinguishes **passcode = no countermeasure** vs. **brute-force = triggers countermeasure**.

---

## 6. Core User Flow — One Execution

```
SELECT cells ──▶ (live preview: colors, symbols, compute cost, software lighting up)
   │
   ▼
EXECUTE ──▶ compute spent, cells removed from grid
   │
   ▼
Program enters top layer ──▶ attempts BYPASS
   │
   ├── bypass success ──▶ countermeasure fires (if any) ──▶ next layer ──┐
   │                                                                      │
   │   ◀──────────────────────────────────────────────────────────────────┘
   │
   ├── reaches final layer & passes ──▶ MISSION WON ──▶ reward screen
   │
   └── cannot bypass a layer ──▶ PROMPT
                                   │
                                   ├── Brute-force (−2 compute, chance) ─┬─ success ▶ countermeasure ▶ continue
                                   │                                     └─ fail ▶ try again / stop
                                   ├── Passcode ▶ access (no countermeasure) ▶ continue
                                   ├── Software (if applicable) ▶ resolve ▶ continue
                                   └── Take consequence ▶ consequence fires ▶ HALTED
                                                                              │
                                                                              ▼
                                                          back to TOP of server;
                                                          reached layers now revealed;
                                                          (−1 trace for the execution)
```

After a halt, the player chooses among: **select a new program**, **reset**, **probe**, or **abandon**.

---

## 7. Mission-Level Flow (bookends)

```
[ MAP NODE selected ]  (out of scope here)
        │
        ▼
PRE-MISSION ──▶ optionally spend credits for temporary compute
        │
        ▼
MISSION ──▶ loop of executions / prompts / resets / probes
        │
        ├── trace hits max at any point ──▶ RUN LOST ──▶ fresh game
        │
        ├── player abandons ──▶ back to MAP (penalty [TBD])
        │
        └── final layer passed ──▶ MISSION WON
                                       │
                                       ▼
                              REWARD SCREEN (credits / software /
                              hardware schematics / data cells /
                              run progress) ──▶ back to MAP
```

---

## 8. Reward Screen

- Presents the **reward bundle** as a small set of cards (credits, software, schematic, special data cell, run-progress).
- Schematics are flagged as **"must be built"** so the player understands they aren't immediately active.
- Special data cells get distinct rendering consistent with their grid appearance.
- One clear **continue** action returns to the map. **[Whether any reward involves a choice/draft is TBD.]**

---

## 9. Feedback, Juice & Readability Priorities

Ordered by importance to comprehension:

1. **Trace** must always be felt — it is the run's life. Persistent, animated on change, alarmed near max.
2. **Compute preview on selection** — the player must see the cost *before* committing.
3. **What will activate** — software slots lighting up during selection teaches the symbol system without a tutorial.
4. **Bypass vs. brute-force vs. passcode distinction** — countermeasure-triggering vs. not must be visually obvious at the prompt.
5. **Layer refresh on halt** — the player must clearly see that bypassed layers came back.
6. **Corrupt cells** — instantly readable as dead weight.

---

## 10. Rendering Approach

- All UI is drawn procedurally via Raylib primitives — no art asset dependency to start.
- Glow is implemented as layered semi-transparent additive draws initially. Shader-based bloom is a future upgrade path, not a day-one requirement.
- Console frames are drawn procedurally to match the terminal aesthetic; may be replaced with AI-generated PNG textures in a later art pass without changing the layout contract.

---

## 11. Open UI/UX Questions

1. Layer console width — lock when layer card content is designed.
2. Side panel layout — hardware left, software right; sizes TBD when content is designed.
3. Final color palette confirmation with art pass (hex values in §4.1 are locked pending art review).
4. Probe placement and cost surface in the UI.
5. Whether the reward screen ever presents a **draft/choice** vs. a fixed bundle.
6. How much intel persists **visually** across executions within a mission vs. across missions.
7. Abandon-mission confirmation flow and any penalty display.
8. Tutorial/onboarding approach.
