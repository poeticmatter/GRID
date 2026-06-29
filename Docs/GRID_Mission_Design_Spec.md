# GRID — Mission Design Specification

**Scope:** This document specifies the single-mission core of GRID in full mechanical detail. The map/node layer, meta-progression, megacorp identities, and the concrete color/symbol art are referenced only as surrounding context and are explicitly out of scope here. Where a value is undefined, it is marked **[TBD]** and represents open design space, not an omission.

---

## 1. Concept & Framing

GRID is a solo roguelite. The player is a hacker-for-hire who gradually discovers that GRID — the **G**overnment **R**untime **I**njection **D**aemon — is a system built to stop hackers from finding the government control module that keeps the population docile. GRID permits hacking but subverts hackers into attacking the wrong servers.

A **run** is one entire game, from a fresh start until the player either wins or loses. The player progresses by completing missions; each mission is an encounter with a single server. This document defines what happens inside one mission.

---

## 2. Terminology

These terms are used precisely throughout this document. They are deliberately distinct to avoid the overloaded word "run."

| Term               | Meaning                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Run**            | One entire game, start to win/loss.                                                                                                                              |
| **Mission**        | The full encounter with an entity, usually one or more servers: all executions, resets, and prompts until the player wins, abandons, or loses the mission.       |
| **Execution**      | One program launched at a specific server. The player selects data cells, executes, and the program flows through the server's layers.                           |
| **Program**        | The set of data cells selected for a single execution.                                                                                                           |
| **Layer**          | One defensive tier of a server. Has a bypass requirement in the form of colors such as: cyan, cyan, any. A layer may have a countermeasure and/or a consequence. |
| **Bypass**         | Passing a layer using the program's colors (an attack).                                                                                                          |
| **Brute-force**    | Passing a layer by spending compute for a chance to break through (an attack).                                                                                   |
| **Passcode**       | A collectible that grants legitimate, one-time access through a layer.                                                                                           |
| **Access**         | Passing a layer via passcode (legitimate; not an attack).                                                                                                        |
| **Prompt**         | The decision point when a program reaches a layer it cannot bypass with its colors.                                                                              |
| **Halted**         | The outcome where the current execution ends and the player returns to the top of the server.                                                                    |
| **Countermeasure** | An effect that triggers when a layer is passed by an **attack** (bypass or brute-force).                                                                         |
| **Consequence**    | An effect that triggers when the player fails or declines a layer at a prompt.                                                                                   |
| **Probe**          | An action that reveals layers before the player attempts to pass them.                                                                                           |
| **Trace**          | The run-level loss meter.                                                                                                                                        |
| **Corruption**     | An effect that adds useless corrupt data cells to the player's pool, which then enter the grid and clog it.                                                      |
| **Pool**           | The persistent run-level collection of data cells the player owns. The grid is drawn from the pool at the start of a mission and on each reset.                 |

---

## 3. Resources

### 3.1 Trace (run-level)
- A single meter spanning the entire run.
- If trace reaches its maximum, the player **loses the run** and may start a fresh game.
- Trace is increased by executions, resets, and certain consequences (see below).
- Trace can be reduced by certain nodes/effects (e.g., a hideout), generally at the cost of other benefits. *(Node-level detail out of scope.)*

### 3.2 The Pool (run-level)
- The **pool** is the player's persistent collection of data cells, carried across the entire run.
- At the start of a mission and on each reset, the grid is filled by drawing from the pool.
- Cells removed from the grid during execution are held out temporarily — they return to the pool when the grid is refilled (on reset).
- **Cells are never permanently lost from the pool** unless a specific run effect explicitly removes them.
- Pool composition changes across the run:
  - **Added:** reward cells, special cells from mission rewards or effects.
  - **Added (bad):** corrupt cells injected by corruption consequences — these persist in the pool and reappear in future draws.
- The pool starts at 16 base cells (one of each (color, symbol) pair — see §4). Hardware may expand it. **[TBD — enlargement mechanic.]**

### 3.3 Data (per-mission, lives in the grid)
- **Data** is the contents of the grid at any moment: each cell is a unit of data with a color and a symbol.
- A program is built **out of data cells**. Selecting and executing a program **removes** those cells from the grid for the duration of the mission segment; they are returned to the pool when the grid is next refilled by a reset.
- Data is replenished only by a **reset** (see §6).
- **Corrupt data** are useless cells in the pool injected by corruption effects; when drawn into the grid they occupy grid space and cannot satisfy layer requirements or be included in a program.

### 3.4 Compute (per-mission energy)
- Compute is spent to execute programs and to brute-force.
- Each cell included in a program costs compute. The cost **scales non-linearly** with program size: 1 + 2 + 3 + 4 … for successive cells.
- Compute may also be spent mid-execution on other effects (e.g., boosting a program). **[Open design space]**
- Compute is replenished by a **reset** (see §6).
- Before a mission, the player may spend **credits** to buy **temporary compute** for that mission. **[Amount/exchange rate TBD]**

### 3.5 Credits (persist across the run)
- Earned as mission rewards and from certain nodes.
- Spent on software (§7), on pre-mission temporary compute (§3.4), and at shops. *(Shop detail out of scope.)*
- Credits do not persist across runs.

### 3.6 Passcodes (collectible)
- A passcode grants one-time **legitimate access** through a single layer at a prompt, **without** triggering that layer's countermeasure.
- Passcodes are collected as rewards/effects. **[Sourcing & stack limits TBD]**

---

## 4. The Grid & Cell Palette

- The grid is a **4×4** matrix of data cells (16 cells), drawn from the pool at the start of a mission or on reset. Hardware may enlarge it. **[TBD — confirm enlargement.]**
- There are **4 colors** and **4 symbols**. Every (color, symbol) pairing is unique, giving **16** possible distinct base cells.
- Because there are exactly 16 possible base cells and the grid holds exactly 16 cells, the base grid always contains **every cell** — composition variance comes from special cells in the pool (corrupt, wild, etc.), not from which base cells were drawn.
- Each cell carries **both** a color and a symbol.

### 4.1 Colors

| ID     | Name   | Hex       | Symbol render color | Notes                        |
|--------|--------|-----------|---------------------|------------------------------|
| C1     | Cyan   | `#00C8FF` | Black `#0A0A0A`     | Cool; high contrast on dark  |
| C2     | Pink   | `#FF2D78` | Black `#0A0A0A`     | Warm; readable at small size |
| C3     | Amber  | `#FFB300` | Black `#0A0A0A`     | Warm; distinct from pink     |
| C4     | Violet | `#9B30FF` | White `#F0F0F0`     | Cool; distinct from cyan     |

Cyan and Violet are both cool-toned but sufficiently separated in hue and lightness. Pink and Amber are both warm but differ in hue and value. The symbol render color is fixed per cell color to maximize foreground/background contrast without introducing a fifth channel of information.

### 4.2 Symbols

| ID | Name     | Shape description                        |
|----|----------|------------------------------------------|
| S1 | Circle   | Filled circle                            |
| S2 | Square   | Filled square, axis-aligned              |
| S3 | Triangle | Filled equilateral triangle, point up    |
| S4 | Diamond  | Filled square rotated 45°                |

Symbols are chosen for maximum silhouette distinction at 20×20px. No two symbols share a dominant axis or outline shape.

### 4.3 Cell palette (all 16 base cells)

Every row is a color; every column is a symbol. Each cell is the (color, symbol) pair at that intersection.

|        | Circle (S1) | Square (S2) | Triangle (S3) | Diamond (S4) |
|--------|-------------|-------------|---------------|--------------|
| **Cyan (C1)**   | C1·S1 | C1·S2 | C1·S3 | C1·S4 |
| **Pink (C2)**   | C2·S1 | C2·S2 | C2·S3 | C2·S4 |
| **Amber (C3)**  | C3·S1 | C3·S2 | C3·S3 | C3·S4 |
| **Violet (C4)** | C4·S1 | C4·S2 | C4·S3 | C4·S4 |

All 16 cells are present in a fresh pool. The grid at mission start (before any pool mutations) always contains all 16.

---

## 5. Programs & Matching

### 5.1 Building a program
- The player selects a set of orthogonally **contiguous** cells on the grid.
- Executing the program **removes** its cells from the grid (held out until the next reset refills the grid from the pool) and **spends compute** per §3.4.
- The program carries:
  - a **color multiset** (used to satisfy layer requirements), and
  - a **symbol multiset** (used to activate software, §7).

### 5.2 Layer requirements
- A layer's requirement is a **color multiset**, optionally including **wildcard** slots ("any").
- A **wildcard** is a slot that must be filled by **some** cell of any color. It is a real slot: "cyan, cyan, any" requires at least three cells (two cyan + one of anything), and is strictly more demanding than "cyan, cyan."

### 5.3 Bypass rule (minimum matching)
- A program **bypasses** a layer if its color multiset **contains** the layer's requirement: enough cells of each named color, plus at least one distinct cell per wildcard slot.
- Matching is **minimum, not exact**. Extra cells in the program beyond the requirement are simply **ignored for that layer**.
- The program is **not consumed** by passing a layer. Its full color multiset is **re-checked** against each subsequent layer.

**Worked example.** Program colors = {cyan, pink, pink, amber}. This program, in one execution, will pass in sequence:
- "pink, pink, any" — two pinks + one extra fills the wildcard.
- "cyan, any" — cyan + one extra.
- "amber, any, any" — amber + two extras.
- "cyan, pink" — both present.

It flows through all of these because each is contained in {cyan, pink, pink, amber}. It only stops when it reaches a layer it cannot satisfy (e.g., "cyan, cyan, any" — only one cyan available).

### 5.4 Corrupt data cells in matching
- Corrupt data cells clog the grid and **cannot satisfy** color requirements.
- A corrupt data cell cannot be included in a program.

---

## 6. Resets

When the player is low on data or compute, they may reset. Resets cost trace.

| Reset | Effect | Trace cost |
|-------|--------|-----------|
| **Hard reset** | Returns all held-out cells to the pool, refills the grid from the pool, **and** refreshes compute. | 3 |
| **Soft reset** | Does **one** of the two — either (return held-out cells + refill grid from pool) **or** (refresh compute) — **player's choice** each time. | 2 |

- After a reset the player continues the same mission from the top of the server.

---

## 7. Software (active during an execution)

- There are **4 software slots**, one per symbol (Circle, Square, Triangle, Diamond).
- Software is purchased with **credits** at shops or won at the end of a mission.
- A software piece **activates for the duration of an execution** if the executed program **contains its matching symbol**.
- **Multiple matching symbols** in the program may strengthen the effect, depending on the software (e.g., scaling with the count of that symbol).
- Effects fire at whatever moment is relevant within the execution: at launch (symbol-count scaling), at a prompt (e.g., brute-force discount), or at end-of-flow (e.g., "if at least X layers were passed").
- Some software **mitigates countermeasures**.
- The design space is broad: brute-force discounts, credit generation, conditional triggers on layers passed, program modification, countermeasure mitigation, and more. **[Open design space]**

---

## 8. Hardware (passive / triggered)

- Hardware grants **passive** or **triggered** benefits. Hardware is **never manually activated**.
- Examples: more compute, larger grid, pool expansion, and more. **[Open design space]**
- Hardware is **unlimited** for now (no fixed slot count). **[TBD — may be bounded later.]**
- Hardware is obtained as **schematics** from mission rewards and must be **built** before it takes effect. **[TBD — build cost/process.]**

---

## 9. Mission Flow (the core loop)

A mission is an encounter with one server composed of an **unknown number of layers**. At the start of a mission the player does not know how many layers there are, nor their contents.

### 9.1 Entering a mission
- The player optionally spends credits beforehand for temporary compute (§3.4).
- The grid is filled by drawing from the pool (§4); compute is at its starting value. **[TBD — starting compute value/source.]**

### 9.2 An execution, step by step
1. The player selects a contiguous program and executes it. Compute is spent; the cells are removed from the grid.
2. The program enters at the **top layer** and attempts to **bypass** each layer in sequence using its color multiset (§5.3).
3. **On a successful bypass:** the layer is passed. If the layer has a **countermeasure**, it triggers now (bypass is an attack). The program continues to the next layer.
4. **On reaching a layer it cannot bypass:** the game shows a **prompt**. The player chooses one of:
   - **Brute-force** — spend **2 compute** for a **chance** to break the layer. Outcome is variable and unknown. On failure, the player may spend **2 more**, repeatedly, until success or they stop. A successful brute-force is an **attack**, so it **triggers the countermeasure**. **[TBD — base success probability and how it scales with layer strength and matching software.]**
   - **Passcode** — spend a passcode for legitimate **access**. The layer is passed and its countermeasure does **not** trigger.
   - **Software** — invoke an applicable software effect, if any.
   - **Take the consequence** — accept the layer's **consequence**. A common consequence is Halting.
   - **If the program passes the final layer,** the player **gains access to the server** and the mission is **won** (see §10). There is no separate "submit" step — the execution simply resolves to either *halted* or *won*.

### 9.3 Consequences (failing/declining a layer)
- Each layer has a consequence that fires when the player fails or declines it at a prompt.
- The **most common** consequence halts the execution with no further penalty. Others include: adding **trace**, **corruption** (corrupt cells added to the pool), **hardware damage**, **credit loss**, and more. **[Open design space]**

### 9.4 Countermeasures (passing a layer by attack)
- A countermeasure fires when a layer is passed by **bypass or brute-force** (both attacks).
- Passing by **passcode** does **not** trigger the countermeasure.
- **[Open design space — concrete countermeasure effects TBD.]**

### 9.5 Re-attempting after a halt
- Each **execution costs 1 trace.**
- After a halt, the player is back at the top of the server. Layers they reached are now **revealed** (intel persists for this mission).
- Cleared layers generally **refresh** and must be hacked again on the next execution. Design space exists for variants:
  - **Temporary layers** that are removed permanently once hacked.
  - **Conditional layers**, e.g., *bypassed* with one cyan but *permanently removed* with three cyan.
- Before re-attempting, the player may **reset** (§6) and/or **probe** (§9.6).
- The player may also **abandon the mission** and leave the server entirely.

### 9.6 Probing & intel
- **Probe** reveals layers before the player attempts to bypass or access them. **[TBD — probe cost, how many layers revealed, sourcing.]**
- Over many attempts and many missions, the player learns the **tendencies** of each target — e.g., one megacorp may favor particular colors. This learnable, per-target distribution is intended as a core skill-expression element. *(Megacorp identities out of scope.)*

---

## 10. Winning a Mission & Rewards

- A mission is **won** only when a single execution flows **past the final layer**.
- On winning, the player gains server access and a **reward bundle**, typically a combination of:
  - **Credits**
  - **Software**
  - **Hardware schematics** (must be built before use, §8)
  - **Data cells** added to the pool — possibly **wild**, possibly carrying **more than one symbol** **[TBD — exact special-cell behavior]**
  - **Progress toward winning the run**
- Rewards are usually a choice among the above.

---

## 11. Losing the Run

- The run is lost when **trace reaches its maximum**.
- On loss, the player starts a **fresh game**.

---

## 12. Out of Scope (context only)

The following exist in the larger game but are **not specified here**:

- **Map / node selection** (à la Slay the Spire): the player picks the next node, the core being a hack against one of three **megacorps**, with additional node types such as **hideout, shop, contacts, and more.**
- **Megacorp identities** — what makes each of the three unique (e.g., color tendencies, layer styles).
- **Meta-progression** — the end-game expands across runs as the player improves (à la The Binding of Isaac): new unlocks raise difficulty while upgrades grow more varied and harder to use. Most upgrades clearly state what they do; some **secret** upgrades stay obfuscated until the player figures them out. **[Loose for now.]**

---
