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
| **Layer**          | One defensive tier of a server. Has a bypass requirement in the form of colors such as: blue, blue, any. A layer may have a countermeasure and/or a consequence. |
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

---

## 3. Resources

### 3.1 Trace (run-level)
- A single meter spanning the entire run.
- If trace reaches its maximum, the player **loses the run** and may start a fresh game.
- Trace is increased by executions, resets, and certain consequences (see below).
- Trace can be reduced by certain nodes/effects (e.g., a hideout), generally at the cost of other benefits. *(Node-level detail out of scope.)*

### 3.2 Data (per-mission, lives in the grid)
- **Data** is the contents of the grid: each cell is a unit of data with a color and a symbol.
- A program is built **out of data cells**. Selecting and executing a program **consumes** those cells from the grid permanently.
- Data is replenished only by a **reset** (see §6).
- **Corrupt data** are useless cells injected by corruption effects; they occupy grid space and cannot satisfy layer requirements. *(Exact behavior of corrupt cells in matching is [TBD] — see §5.)*

### 3.3 Compute (per-mission energy)
- Compute is spent to execute programs and to brute-force.
- Each cell included in a program costs compute. The cost **scales non-linearly** with program size  1 + 2 + 3 + 4 … for successive cells
- Compute may also be spent mid-execution on other effects (e.g., boosting a program). **[Open design space]**
- Compute is replenished by a **reset** (see §6).
- Before a mission, the player may spend **credits** to buy **temporary compute** for that mission. **[Amount/exchange rate TBD]**

### 3.4 Credits (persist across the run)
- Earned as mission rewards and from certain nodes.
- Spent on software (§7), on pre-mission temporary compute (§3.3), and at shops. *(Shop detail out of scope.)*
- Credits to not persist cross runs.

### 3.5 Passcodes (collectible)
- A passcode grants one-time **legitimate access** through a single layer at a prompt, **without** triggering that layer's countermeasure.
- Passcodes are collected as rewards/effects. **[Sourcing & stack limits TBD]**

---

## 4. The Grid

- The grid is a **4×4** matrix of data cells (16 cells) at the start of a mission. Hardware may enlarge it (candidate: **4×5**). **[TBD — confirm enlargement]**
- There are **5 colors** and **5 symbols**. Every (color, symbol) pairing is unique, giving **25** possible distinct cells.
- Each cell carries **both** a color and a symbol.
- At the start of a mission, **16** of the 25 possible cells fill the grid at random.
- Concrete color and symbol identities are defined in the UI/UX document, not here.

---

## 5. Programs & Matching

### 5.1 Building a program
- The player selects a set of orthogonally **contiguous** cells on the grid. 
- Executing the program **consumes** its cells from the grid (they are gone until a reset) and **spends compute** per §3.3.
- The program carries:
  - a **color multiset** (used to satisfy layer requirements), and
  - a **symbol multiset** (used to activate software, §7).

### 5.2 Layer requirements
- A layer's requirement is a **color multiset**, optionally including **wildcard** slots ("any").
- A **wildcard** is a slot that must be filled by **some** cell of any color. It is a real slot: "blue, blue, any" requires at least three cells (two blue + one of anything), and is strictly more demanding than "blue, blue."

### 5.3 Bypass rule (minimum matching)
- A program **bypasses** a layer if its color multiset **contains** the layer's requirement: enough cells of each named color, plus at least one distinct cell per wildcard slot.
- Matching is **minimum, not exact**. Extra cells in the program beyond the requirement are simply **ignored for that layer**.
- The program is **not consumed** by passing a layer. Its full color multiset is **re-checked** against each subsequent layer.

**Worked example.** Program colors = {green, blue, blue, red}. This program, in one execution, will pass in sequence:
- "blue, blue, any" — two blues + one extra fills the wildcard.
- "green, any" — green + one extra.
- "red, any, any" — red + two extras.
- "green, blue" — both present.

It flows through all of these because each is contained in {green, blue, blue, red}. It only stops when it reaches a layer it cannot contain (e.g., "green, green, any" — only one green available).

### 5.4 Corrupt data cells in matching
- Corrupt data cells clog the grid and **cannot satisfy** color requirements.
- A corrupt data cell cannot be included in a program.

---

## 6. Resets

When the player is low on data or compute, they may reset. Resets cost trace.

| Reset | Effect | Trace cost |
|-------|--------|-----------|
| **Hard reset** | Dumps all data from the grid, refills the grid, **and** refreshes compute. | 3 |
| **Soft reset** | Does **one** of the two — either (dump + refill grid) **or** (refresh compute) — **player's choice** each time. | 2 |

- After a reset the player continues the same mission from the top of the server.

---

## 7. Software (active during an execution)

- There are **5 software slots**, one per symbol.
- Software is purchased with **credits** at shops or won at the end of a mission.
- A software piece **activates for the duration of an execution** if the executed program **contains its matching symbol**.
- **Multiple matching symbols** in the program may strengthen the effect, depending on the software (e.g., scaling with the count of that symbol).
- Effects fire at whatever moment is relevant within the execution: at launch (symbol-count scaling), at a prompt (e.g., brute-force discount), or at end-of-flow (e.g., "if at least X layers were passed").
- Some software **mitigates countermeasures**.
- The design space is broad: brute-force discounts, credit generation, conditional triggers on layers passed, program modification, countermeasure mitigation, and more. **[Open design space]**

---

## 8. Hardware (passive / triggered)

- Hardware grants **passive** or **triggered** benefits. Hardware is **never manually activated**.
- Examples: more compute, larger grid, and more. **[Open design space]**
- Hardware is **unlimited** for now (no fixed slot count). **[TBD — may be bounded later.]**
- Hardware is obtained as **schematics** from mission rewards and must be **built** before it takes effect. **[TBD — build cost/process.]**

---

## 9. Mission Flow (the core loop)

A mission is an encounter with one server composed of an **unknown number of layers**. At the start of a mission the player does not know how many layers there are, nor their contents.

### 9.1 Entering a mission
- The player optionally spends credits beforehand for temporary compute (§3.3).
- The grid is filled (§4); compute is at its starting value. **[TBD — starting compute value/source.]**

### 9.2 An execution, step by step
1. The player selects a contiguous program and executes it. Compute is spent; the cells are consumed.
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
- The **most common** consequence halts the execution with no further penalty. Others include: adding **trace**, **corruption** (corrupt cells added to the pool/grid), **hardware damage**, **credit loss**, and more. **[Open design space]**

### 9.4 Countermeasures (passing a layer by attack)
- A countermeasure fires when a layer is passed by **bypass or brute-force** (both attacks).
- Passing by **passcode** does **not** trigger the countermeasure.
- **[Open design space — concrete countermeasure effects TBD.]**

### 9.5 Re-attempting after a halt
- Each **execution costs 1 trace.** 
- After a halt, the player is back at the top of the server. Layers they reached are now **revealed** (intel persists for this mission).
- Cleared layers generally **refresh** and must be hacked again on the next execution. Design space exists for variants:
  - **Temporary layers** that are removed permanently once hacked.
  - **Conditional layers**, e.g., *bypassed* with one blue but *permanently removed* with three blue.
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
  - **Data cells** as rewards — possibly **wild**, possibly carrying **more than one symbol** **[TBD — exact special-cell behavior]**
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
