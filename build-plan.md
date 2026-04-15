# CivicGuide Build Plan
April 15, 2026

---

## Overview

The goal is a fully clickable, multi-phase wizard that demonstrates every stage of CivicGuide agent interaction — from cold entry through document review. Each phase is a discrete HTML page (or a JS-driven view swap within one page) styled entirely in Unigrid v2.

The session log confirms `test-entry.html` exists as a starting point. `index.html` redirects to it. The design system is locked in `unigrid-v2.md`. The plan below builds forward from what exists.

---

## Architecture decision

**Single-file SPA with view swap, not separate HTML pages.**

Reasons:
- Stage Track (already spec'd) tracks progress across phases — easiest to update from one JS state object
- Agent hint zones (`onMessage`) need to persist state across steps
- Avoids re-loading the broadside/topbar on every step
- One `state {}` object drives the whole flow — each phase reads from it and writes back

Each phase is a `<section class="phase" id="phase-N">` — only one is `display: block` at a time. `advance()` and `back()` show/hide.

---

## Global shell (applies to all phases)

### UI elements
- **Broadside** — full width, always dark. Left: "CivicGuide". Right: stage pill + status dot (idle/thinking states from `test-entry.html`)
- **Stage Track** — immediately below broadside. 6 stages (see phases below). Updates `is-done` / `is-active` on every `advance()`
- **Main content area** — `max-width: 900px`, centered, padded. Each phase renders inside here
- **Dark mode toggle** — top-right of broadside, persists via `localStorage`

### State object
```js
const state = {
  location: null,
  domain:   null,
  docType:  null,
  method:   null,   // 'upload' | 'describe'
  fields:   {},     // field values keyed by name
  agentStatus: 'idle'  // 'idle' | 'thinking' | 'done'
}
```

### Agent simulation
No live API in the prototype. Agent responses are pre-written strings per context. A `simulateAgent(phaseId, delay)` helper sets `agentStatus = 'thinking'`, fires the status dot animation, then injects the canned response text after `delay` ms and sets `agentStatus = 'idle'`.

---

## Phases

### Phase 1 — Entry / Location
**Stage label:** Location  
**Existing file:** `test-entry.html` — absorb this into the SPA as Phase 1

**Components:**
- Broadside (shell)
- Stage Track — all inactive on load, Phase 1 becomes `is-active`
- Location Input (`ug-loc-field`) — text entry + "Use My Location" geo button
- Hint Zone — pre-populated with a one-line agent greeting: *"Tell me where you are and I'll find the right resources."* This fires immediately on page load (no user trigger needed)
- Primary action button: **Continue** — disabled until `state.location` is set

**UI updates vs. current `test-entry.html`:**
- Replace current entry content with the Location Input component from v2
- Add Stage Track below broadside
- Apply v2 typography scale (42/28/19/16/12/11px) and `--dark` token
- Update `--ff-body` from Georgia to Helvetica Neue

**Interaction:**
1. Page loads → hint zone fades in with greeting
2. User types a location OR clicks "Use My Location" → geo lookup simulated (900ms spinner)
3. Location confirmed → Continue button activates
4. Click Continue → `state.location = value`, advance to Phase 2

---

### Phase 2 — Domain Selection
**Stage label:** Domain

**Components:**
- Domain Grid (`ug-domain-grid`) — 6 tiles: DMV, Housing, Benefits, Courts, Parks, Education
- Each tile has a name + one-line sub-description
- Hint Zone — fires once a tile is hovered for 600ms: *"Select the area closest to your situation."*
- No explicit Continue button — selecting a tile auto-advances after a 300ms confirmation pause

**UI updates:**
- Section heading: `ug-h2` — "What area do you need help with?"
- `ug-lbl` location breadcrumb above heading: shows confirmed location from Phase 1
- Tile grid: 3-col on desktop, 2-col on mobile

**Interaction:**
1. User clicks a tile → tile inverts to `--dark`, 300ms pause
2. `state.domain = tile.dataset.domain`
3. Hint zone shows: *"Got it — [domain]. Let's narrow it down."*
4. Auto-advance to Phase 3 after 600ms

---

### Phase 3 — Document Type
**Stage label:** Document

**Components:**
- Scoped Dropdown (`ug-select`) — options populated from `DOC_TYPES[state.domain]`
- 4–6 options per domain (pre-written)
- Hint Zone — fires on dropdown focus: canned text explaining what the document type determines
- Binary Choice Card (`ug-choice-pair`) — appears AFTER a doc type is selected: "Upload a document" vs. "Describe your situation"

**UI updates:**
- Location + domain breadcrumb trail in `ug-lbl` above heading
- Heading: "What do you need help with?"
- Choice pair appears with a subtle slide-in after dropdown selection (CSS transition, `max-height` 0 → auto)

**Interaction:**
1. Dropdown renders with domain-appropriate options
2. User selects doc type → `state.docType = value`, choice pair slides in
3. User picks Upload or Describe → `state.method = value`
4. Continue button activates → advance to Phase 4

---

### Phase 4 — Document Input
**Stage label:** Input  
**Two sub-views based on `state.method`**

#### 4a — Upload path
- Drag-and-drop zone (new component, not in v2 spec yet — see below)
- Simulated upload: click/drop triggers a fake progress bar, then shows filename confirmed
- Hint Zone fires after "upload": *"I'll analyze this document and highlight what matters."*

#### 4b — Describe path
- `ug-field-wrap` with a `<textarea>` — label: "Describe your situation"
- `?` help trigger → Hint Zone: canned prompt guidance
- Character counter in `ug-cap`

**New component needed: Upload Zone**
```
.ug-upload-zone
  border: 1px dashed var(--rule-s)
  padding: 40px 24px
  text-align: center
  background: var(--paper-dk)
  → hover: border-color var(--ink-3)
  → active/dropping: border-color var(--ink), background var(--paper)
  → confirmed: border solid, shows filename + ug-badge ug-b-tan
```

**Interaction:**
1. Upload or textarea fills in
2. "Analyze" / "Continue" button activates
3. Click → `simulateAgent('phase4', 1800)` — status dot goes amber for 1.8s
4. Advance to Phase 5

---

### Phase 5 — Annotation / Field Fill
**Stage label:** Fill

**Components:**
- Annotate Expand (`ug-annotate-block`) — 3–4 document sections shown as collapsed rows
- Each row: section label + "Explain ▾" toggle → opens Hint Zone with canned agent explanation
- Below annotations: 2–3 `ug-field-wrap` inputs the user must fill
- Each field has a `?` help button → inline Hint Zone with field-specific guidance
- Hint Zone at top of phase fires on load: *"I've read the document. Here's what you'll need to fill in."*

**UI updates:**
- Section heading: "Fill in the required fields"
- Agent attribution line in each hint: `ug-hint-attr` shows domain context
- Completed fields get a subtle `border-color: var(--tan-dk)` confirmation state

**Interaction:**
1. Annotations available to expand at any time
2. User fills fields
3. All required fields filled → Continue activates → advance to Phase 6

---

### Phase 6 — Review & Submit
**Stage label:** Review

**Components:**
- Review Card (`ug-review`) — ruled table of all confirmed values
- Each row has an "Edit" button that returns to the relevant phase (jumps back, doesn't reset state)
- `ug-confirm-btn` — "Confirm & Submit"
- `ug-back-btn` — "Back"

**UI updates:**
- Heading: "Review your submission"
- After confirm: button text changes to "Submitted", a Hint Zone appears with: *"Done. Here's what happens next..."* + canned next-steps copy
- Stage Track: all 6 stages show `is-done`
- Status dot returns to idle

**Interaction:**
1. User reviews all values
2. Clicks Edit on any row → jumps to that phase, state preserved
3. Clicks Confirm → simulated submit (400ms), success state renders in place

---

## File structure

```
index.html          → redirects to civicguide.html
civicguide.html     → single SPA, all 6 phases
test-entry.html     → keep as reference, not linked
build-plan.md       → this file
Guidelines/
  unigrid-v2.md
Conversations/
  design-system-session-log.md
```

---

## Build sequence

1. **Shell** — broadside + stage track + phase show/hide scaffolding + state object + `advance()` / `back()` / `simulateAgent()`
2. **Phase 1** — location input, geo simulation, hint zone greeting
3. **Phase 2** — domain grid, auto-advance
4. **Phase 3** — scoped dropdown + binary choice card
5. **Phase 4** — upload zone (new component) + describe textarea
6. **Phase 5** — annotate expand + field hints
7. **Phase 6** — review card + submit state
8. **Polish** — dark mode toggle, breadcrumb trail, mobile grid breakpoints, transition timings

---

## Components to add to unigrid-v2.md after build

- Upload Zone (drag-and-drop, progress, confirmed state)
- Breadcrumb trail (`ug-breadcrumb` — small `ug-lbl` row showing Location › Domain › Document)
- Submit success state (hint zone variant with green-adjacent confirmation — possibly `--tan-dk` border instead of red)
