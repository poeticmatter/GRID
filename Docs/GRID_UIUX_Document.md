# GRID — UI/UX Document

**Scope:** This document covers the user-facing experience of a single mission: screen layout, on-screen arrangement, and user flows. It assumes the mechanics defined in *GRID — Mission Design Specification*. The map/node screen is sketched only where it bookends a mission. Concrete color and symbol art direction is proposed here because the mechanics spec deferred it to UI/UX.

---

## 1. Platform Strategy (mobile + desktop)

The honest answer to "will mobile make it too limited?": **no, if the mission screen is designed mobile-first around the grid, and desktop is treated as the same layout given room to breathe.** GRID's core interaction is tapping a small number of cells in a 4×4 (or 4×5) grid and pressing execute — this is a fundamentally touch-friendly, low-input-density loop, closer to a card-battler than to a twitch game. Slay the Spire, Balatro, and Luck be a Landlord all ship the same core on phone and desktop successfully; GRID's loop is in that family.

The constraint mobile imposes is **information density**, not input. The risk areas are: many layers stacked vertically, software/hardware lists, the reward screen, and probe/intel readouts. The strategy below keeps the *action surface* (grid + execute) identical across platforms and makes only the *information surfaces* responsive.

**Recommended approach: one layout, two densities.**

| Aspect | Mobile (portrait, ~390pt wide) | Desktop (landscape) |
|--------|-------------------------------|---------------------|
| Grid | Center of screen, large tap targets (min 44pt). | Same grid, centered, with side panels for persistent info. |
| Server / layers | Vertical stack **above** the grid, scrollable; only the **active + next** layer fully detailed, others collapsed. | Layers shown as a fuller vertical "stack" with more detail visible at once; no scrolling needed for typical depth. |
| Software / hardware | Collapsed into a tappable tray/drawer; badges show what's active during an execution. | Persistent left rail (hardware) and right rail (software) always visible. |
| Resource readout (trace, compute, credits) | Fixed top bar, compact. | Top bar, with room for labels and secondary detail. |
| Prompt (stuck layer) | Modal sheet sliding up from bottom; thumb-reachable buttons. | Centered modal; same options, mouse or keyboard. |

**Decision to confirm:** lock to **portrait** on mobile (recommended — the layer stack reads naturally as a vertical column the program "descends" through), or support landscape. Landscape on mobile would fight the vertical-stack metaphor. **[Confirm portrait-only on mobile.]**

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
        │   [▲g] [■b] [●r] [◆y]                           │
        │   [●b] [■b] [▲p] [●g]    ← tap to select        │
        │   [◆r] [▲b] [■y] [●p]                           │
        │   [■g] [◆b] [●b] [▲r]                           │
        └────────────────────────────────────────────────┘

   [ SOFTWARE tray ]   [ ⚡ EXECUTE ]   [ RESET ▸ ]   [ HARDWARE tray ]
```

- **Top:** resources (always visible).
- **Middle-upper:** the server as a vertical layer stack the program moves *down* through.
- **Middle-lower:** the grid, the player's primary interaction zone.
- **Bottom:** the action bar — execute, reset, and the software/hardware trays (rails on desktop).

Reading top-to-bottom mirrors the fiction: you assemble data at the bottom, fire it up/into the server, and it works **down** the stack toward server access.

---

## 3. Visual Language: Colors & Symbols

The mechanics spec defers the concrete identities; here is a proposed starting set chosen for **maximum mutual distinguishability** and **colorblind safety** (color is never the only channel — every cell also carries a symbol, which doubles as redundancy).

**5 colors** (proposed): a cool blue, a warm amber, a magenta/pink, a green, and a violet. Avoid red+green as the only differentiator anywhere; rely on the paired symbol for accessibility. **[Final palette TBD with art.]**

**5 symbols** (proposed): distinct silhouettes readable at small size — e.g., circle, square, triangle, diamond, hex. Symbols must be legible at ~32pt on mobile. **[Final glyphs TBD with art.]**

**Cell rendering:** each cell shows symbol (foreground) on a color field (background), with a high-contrast border. Selected cells get a clear active state (glow + lift). Corrupt cells get an unmistakable "broken/static" treatment so the player reads them instantly as dead weight.

**Layer requirement rendering:** a layer shows its required colors as a row of color chips; a **wildcard** ("any") renders as a distinct neutral chip (e.g., a "?" slot) so "blue, blue, any" visibly reads as three chips, two colored and one wild.

---

## 4. Mission Screen — Component Inventory

1. **Resource bar (top, persistent)**
   - **Trace meter:** segmented bar; the dominant, always-visible threat. Animates on increase; warns near max.
   - **Compute:** current value with a bolt icon; shows spend preview when cells are selected.
   - **Credits:** current value.

2. **Server / layer stack (upper)**
   - Each layer card shows: requirement chips, state (unprobed / probed / bypassed-this-execution), and discoverable tags for countermeasure/consequence once known.
   - **Unprobed layers** are obscured (depth unknown). **Probed** layers reveal their requirement. **Bypassed** layers (within the current execution) show a passed state but visibly **refresh** between executions (per mechanics §9.5).
   - A persistent **"program position" indicator** shows how far the current execution has reached.

3. **The grid (lower, primary interaction)**
   - 4×4 (or 4×5) of cells. Tap to add/remove from the current selection.
   - **Selection feedback:** highlighted cells, a live readout of the program's **color multiset** and **symbol multiset**, and the **compute cost** of executing at the current size.
   - **Contiguity feedback:** if a tapped cell isn't contiguous with the current selection, it's rejected with a clear visual cue. *(Contiguity rule itself is [TBD] in the spec.)*

4. **Action bar (bottom)**
   - **Execute** (primary button): disabled until a valid program is selected; shows compute cost.
   - **Reset** control: opens a small chooser — **Hard (−3 trace)** or **Soft (−2 trace)**; soft then asks **refill grid** or **refresh compute**.
   - **Software tray:** shows the 5 symbol slots; during selection, slots whose symbol is present in the program **light up** to preview what will activate.
   - **Hardware tray:** passive/triggered items; informational, with triggered items flagged.
   - **Probe** control: reveals layer(s) ahead. **[Cost/placement TBD.]**
   - **Abandon mission** control: tucked away (low-frequency, requires confirm).

5. **Prompt (modal, appears at a stuck layer)**
   - States the layer's requirement and what the program is missing.
   - Offers: **Brute-force (−2 compute, chance)**, **Use passcode**, **Use software** (if applicable), **Take consequence** (which halts).
   - Brute-force shows running compute spent and lets the player **try again (−2)** or **stop** after each failure.
   - Clearly distinguishes that **passcode = no countermeasure**, **brute-force = triggers countermeasure**.

---

## 5. Core User Flow — One Execution

```
SELECT cells ──▶ (live preview: colors, symbols, compute cost, software lighting up)
   │
   ▼
EXECUTE ──▶ compute spent, cells consumed
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

## 6. Mission-Level Flow (bookends)

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

## 7. Reward Screen

- Presents the **reward bundle** as a small set of cards (credits, software, schematic, special data cell, run-progress).
- Schematics are flagged as **"must be built"** so the player understands they aren't immediately active.
- Special data cells (wild / multi-symbol) get distinct rendering consistent with their grid appearance.
- One clear **continue** action returns to the map. **[Whether any reward involves a choice/draft is TBD.]**

---

## 8. Feedback, Juice & Readability Priorities

Ordered by importance to comprehension:

1. **Trace** must always be felt — it is the run's life. Persistent, animated on change, alarmed near max.
2. **Compute preview on selection** — the player must see the cost *before* committing.
3. **What will activate** — software slots lighting up during selection teaches the symbol system without a tutorial.
4. **Bypass vs. brute-force vs. passcode distinction** — countermeasure-triggering vs. not must be visually obvious at the prompt, because it's the key strategic decision.
5. **Layer refresh on halt** — the player must clearly see that bypassed layers came back, or the re-attempt loop will feel buggy rather than intended.
6. **Corrupt cells** — instantly readable as dead weight.

---

## 9. Mobile-Specific Risk Mitigations

- **Layer stack depth:** collapse all but the active and next layer; the rest become compact chips. Tap to expand any probed layer.
- **Software/hardware:** drawers with active-state badges rather than always-on rails.
- **Prompt as bottom sheet:** keeps decision buttons in the thumb zone.
- **Selection on small grids:** generous hit targets, drag-to-select as an option in addition to tapping. **[Confirm whether drag-select is desired given the contiguity rule.]**
- **No hover:** every hover-only affordance on desktop (e.g., layer detail, software tooltip) must have a tap-to-inspect equivalent on mobile.

---

## 10. Open UI/UX Questions

1. Mobile orientation: confirm **portrait-only** (recommended).
2. Final color palette and symbol glyph set (with art; must stay colorblind-safe).
3. Probe placement and cost surface in the UI.
4. Drag-to-select vs. tap-only on the grid (depends on contiguity rule).
5. Whether the reward screen ever presents a **draft/choice** vs. a fixed bundle.
6. How much intel persists **visually** across executions within a mission vs. across missions (history/notebook view?).
7. Abandon-mission confirmation flow and any penalty display.
8. Tutorial/onboarding approach — relying on "software lights up" and live previews to teach, vs. explicit tutorial missions.
