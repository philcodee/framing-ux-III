# Animated View — Guidelines

A full-screen playback mode accessible from a button in the broadside header. Replaces the static views with a single continuous animation that advances through time, revealing how trust and resource access changed for each demographic group across decades.

---

## Purpose

The static views require the user to navigate — click years, switch tabs, scan panels. The animated view removes that friction. It plays the story automatically, letting the pattern reveal itself through motion rather than interaction.

---

## Entry & Exit

- Triggered by a **"▶ Animate"** button in the top-right of the broadside header (Unigrid style: ink background, tan-lt text, uppercase, letter-spacing)
- Opens as a **full-screen overlay** (`position: fixed; inset: 0; z-index: 200`) over the existing page
- A **close button** (×) in the top-right of the overlay returns to the static page without any state loss
- The overlay uses `--ink` as the background — a deliberate visual break from the `--paper` page

---

## Sequence

The animation advances through 7 years: `1972 → 1980 → 1990 → 2000 → 2010 → 2014 → 2020`

At each step:
1. **Year number** updates (large, centered, Helvetica Neue, `--tan-lt`)
2. **Demographic fill columns** animate to the new trust heights (CSS transition, `0.8s cubic-bezier`)
3. **National trust line** on canvas extends one segment to the new point
4. **Annotation text** fades in (opacity transition, `0.4s ease`)
5. Auto-advances after a configurable dwell time

---

## Visual Structure

```
┌─────────────────────────────────── overlay ────────────────────────────────┐
│  CIVIC TRUST — ANIMATED                                            [CLOSE] │  ← dark bar
├────────────────────────────────────────────────────────────────────────────┤
│                          1972                                               │  ← year (large)
│  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ national trust line (canvas) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │
│                                                                             │
│  [White]  [Black]  [Hispanic]  [Low-income]  [Young adults]                │  ← fill columns
│                                                                             │
│  Annotation: what happened in this era, who was affected                   │  ← narrative text
│                                                                             │
│  [◀◀ RESTART]   [▶ PLAY / ❙❙ PAUSE]   Speed: [1×] [2×] [3×]             │  ← controls
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Data

Uses the same trust-by-group data as the By Group view:

| Group        | 1972 | 1980 | 1990 | 2000 | 2010 | 2014 | 2020 |
|--------------|------|------|------|------|------|------|------|
| White        | 0.54 | 0.40 | 0.35 | 0.36 | 0.22 | 0.19 | 0.17 |
| Black        | 0.30 | 0.22 | 0.21 | 0.25 | 0.14 | 0.08 | 0.12 |
| Hispanic     | 0.38 | 0.28 | 0.25 | 0.28 | 0.17 | 0.12 | 0.14 |
| Low-income   | 0.32 | 0.24 | 0.22 | 0.22 | 0.13 | 0.09 | 0.11 |
| Young adults | 0.58 | 0.42 | 0.32 | 0.34 | 0.24 | 0.20 | 0.16 |

National average for the trend line: `0.48, 0.36, 0.31, 0.33, 0.19, 0.18, 0.17`

---

## Annotations (per year)

| Year | Text |
|------|------|
| 1972 | High baseline — but already unequal. White and young Americans trusted government at nearly twice the rate of Black and low-income communities. |
| 1980 | Watergate's aftermath. Trust collapsed across all groups. The gap between White and Black Americans widened rather than closed. |
| 1990 | Stabilization — but at a lower floor. Hispanic communities saw no recovery from 1980. Low-income trust held below 25%. |
| 2000 | Brief uptick following the 1990s economic expansion. Every group improved slightly — the only decade-start with a positive trend. |
| 2010 | The financial crisis erased the recovery. Low-income trust fell to 13%. Young adults — the most optimistic in 1972 — dropped to 24%. |
| 2014 | Historic low. Only 19% of Americans trusted government most of the time. Black Americans: 8%. This is the floor. |
| 2020 | Marginal recovery obscures the damage. The gap between White and Black Americans is structurally unchanged from 1972. |

---

## Controls

| Control | Behavior |
|---------|----------|
| Play / Pause | Toggle auto-advance. Default: paused at 1972 on load. |
| Restart | Return to 1972, reset canvas line, re-animate fills. |
| Speed 1× | 2.5s dwell per year |
| Speed 2× | 1.4s dwell per year |
| Speed 3× | 0.7s dwell per year |
| Manual step | Clicking a year node on the scrubber jumps directly to that year |

---

## Animation Principles

1. **Motion implies causality.** Fills rise and fall together — showing group divergence is as important as the overall trend.
2. **The line draws itself.** The national trust canvas line should never show the full trajectory upfront. Each segment is earned by reaching that year.
3. **Text is secondary to motion.** Annotations appear after the fills settle, not before.
4. **Never loop automatically.** At 2020, the animation stops. The data ends there; looping would undercut the gravity of the final state.
5. **Consistent with Unigrid.** Dark background (`--ink`), tan fills (`--tan`), red for the national trend line (`--red`), all type in Helvetica Neue.

---

## File

`js/animated-view.js` — self-contained IIFE. Injected into `index.html` via `<script src="js/animated-view.js">` before `</body>`.
