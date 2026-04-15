# Unigrid Design System — v2

A CSS design system derived from the National Park Service Unigrid Informational Folder Program. The system solves two problems: organizing editorial and graphic variables to a format, and helping determine how a layout will print or render.

---

## Philosophy

- **Grid-driven**: All dimensions derive from the B6 acetate base sheet. 12 panels per side, consistent gutters.
- **Single typeface**: Helvetica Neue for all roles. Structure, labels, body, and captions are differentiated through weight, size, and spacing — not face switching.
- **Restrained palette**: Ink, tan, paper, and a single rule red. Color is used for hierarchy, not decoration.
- **Print heritage**: Rules, columns, and figure captions follow broadsheet and folder conventions — not screen UI conventions.
- **Dark surface token**: `--dark` is always the darkest available tone regardless of light/dark mode. Use it for any element that must stay ink-dark in both themes.

---

## CSS Variables

Paste into `:root {}` to use the system:

```css
:root {
  --ink:      #1A1A18;   /* primary text, heavy rules */
  --ink-2:    #3D3D38;   /* body text */
  --ink-3:    #6B6B63;   /* captions, muted labels */
  --tan:      #C8B89A;   /* accent, borders on dark backgrounds */
  --tan-lt:   #E8DDD0;   /* text on dark surfaces */
  --tan-dk:   #8B7355;   /* nav labels, secondary labels */
  --paper:    #F5F0E8;   /* page background */
  --paper-dk: #EDE5D8;   /* preview surfaces, secondary bg */
  --red:      #C0392B;   /* highlight, active states */
  --red-lt:   #F0D0CC;   /* red tint backgrounds */
  --rule:     rgba(26, 26, 24, 0.15);   /* light dividers */
  --rule-s:   rgba(26, 26, 24, 0.35);   /* strong dividers */
  --ff-head:  'Helvetica Neue', Helvetica, Arial, sans-serif;
  --ff-body:  'Helvetica Neue', Helvetica, Arial, sans-serif;
  --gutter:   12px;
  --col:      calc((100% - 132px) / 12);  /* 12 cols, 11 gutters */
  --dark:     var(--ink);   /* always-dark surface token */
}
```

### Dark Mode

Add `data-theme="dark"` to `<html>` to activate. Toggles the surface and text tokens while keeping `--dark` reliably dark.

```css
[data-theme="dark"] {
  --paper:    #191714;
  --paper-dk: #201E1A;
  --ink:      #EAE0D0;
  --ink-2:    #C4B49A;
  --ink-3:    #8B7B65;
  --tan:      #C8B89A;
  --tan-lt:   #EAE0D0;
  --tan-dk:   #A89070;
  --red:      #CC3D30;
  --red-lt:   rgba(204, 61, 48, 0.15);
  --rule:     rgba(234, 224, 208, 0.10);
  --rule-s:   rgba(234, 224, 208, 0.22);
  --dark:     #0D0C0A;
}
```

```js
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('ug-theme', isDark ? 'light' : 'dark');
}

// Restore on load
const saved = localStorage.getItem('ug-theme');
if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
```

---

## Typography

Single typeface, differentiated by weight, size, and letter-spacing.

| Role | Class | Size | Weight | Specs |
|---|---|---|---|---|
| H1 | `.ug-h1` | 42px | 700 | `letter-spacing: -0.04em` |
| H2 | `.ug-h2` | 28px | 700 | `letter-spacing: -0.02em` |
| H3 | `.ug-h3` | 19px | 700 | — |
| Body | `.ug-body` | 16px | 400 | `line-height: 1.65` |
| Caption | `.ug-cap` | 12px | 400 | `letter-spacing: 0.08em` |
| Label | `.ug-lbl` | 11px | 700 | `letter-spacing: 0.18em; text-transform: uppercase` |

```css
.ug-h1   { font-family: var(--ff-head); font-size: 42px; font-weight: 700; letter-spacing: -0.04em; line-height: 1.05; }
.ug-h2   { font-family: var(--ff-head); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; }
.ug-h3   { font-family: var(--ff-head); font-size: 19px; font-weight: 700; }
.ug-body { font-family: var(--ff-body); font-size: 16px; line-height: 1.65; color: var(--ink-2); }
.ug-cap  { font-family: var(--ff-head); font-size: 12px; letter-spacing: 0.08em; color: var(--ink-3); }
.ug-lbl  { font-family: var(--ff-head); font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--tan-dk); }
```

---

## Color Palette

| Name | Hex | Usage |
|---|---|---|
| Ink | `#1A1A18` | Primary text, heavy rules, dark backgrounds |
| Ink 2 | `#3D3D38` | Body text |
| Ink 3 | `#6B6B63` | Captions, muted UI |
| Tan | `#C8B89A` | Accent on dark surfaces, borders |
| Tan Light | `#E8DDD0` | Text on dark backgrounds |
| Tan Dark | `#8B7355` | Section labels, secondary nav |
| Paper | `#F5F0E8` | Page background |
| Paper Dark | `#EDE5D8` | Preview surfaces |
| Red | `#C0392B` | Active states, highlights, warnings |
| Red Light | `#F0D0CC` | Red tint fill backgrounds |

---

## Core Components

### Broadside

The dominant header band on every folder. Always dark, always dominant.

```css
.ug-broadside {
  background: var(--dark);
  color: #fff;
  padding: 14px 22px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.ug-broadside .ug-title {
  font-size: 38px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}

.ug-broadside .ug-meta {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tan);
  text-align: right;
  line-height: 1.8;
}
```

```html
<div class="ug-broadside">
  <div class="ug-title">Navy Yard</div>
  <div class="ug-meta">
    U.S. Department of the Interior<br>
    National Park Service
  </div>
</div>
```

---

### Text Columns

Multi-column editorial layout with vertical hairline rules and a thick top rule.

```css
.ug-cols {
  display: grid;
  gap: var(--gutter);
  border-top: 2px solid var(--ink);
}

.ug-col {
  padding: 14px 18px 14px 0;
  border-right: 1px solid var(--rule);
  font-family: var(--ff-body);
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink-2);
}

.ug-col:last-child { border-right: none; padding-right: 0; }
.ug-col:not(:first-child) { padding-left: 18px; }

.ug-col h3 {
  font-family: var(--ff-head);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
  margin-bottom: 7px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--rule-s);
}
```

```html
<div class="ug-cols" style="grid-template-columns: repeat(3, 1fr)">
  <div class="ug-col">
    <h3>House Typeface</h3>
    Body copy set in Helvetica Neue...
  </div>
  <div class="ug-col">
    <h3>Preferred Colors</h3>
    The palette derives from ink and paper...
  </div>
  <div class="ug-col">
    <h3>Maps</h3>
    All site maps follow the USGS topo base...
  </div>
</div>
```

---

### Rules & Dividers

Three rule weights for expressing hierarchy.

```css
.ug-rule-s { border: none; border-top: 1px solid var(--rule-s); margin: 14px 0; }
.ug-rule-t { border: none; border-top: 3px solid var(--ink);    margin: 14px 0; }
.ug-rule-d { border: none; border-top: 3px double var(--ink);   margin: 14px 0; }
```

| Class | Use |
|---|---|
| `.ug-rule-s` | Column separators, footer dividers |
| `.ug-rule-t` | Section headers, broadside base |
| `.ug-rule-d` | Major section breaks, formal divisions |

---

### Figures

Image panels on an ink background with a tan caption strip.

```css
.ug-figure  { background: var(--dark); overflow: hidden; }
.ug-fig-img { width: 100%; display: block; }
.ug-fig-cap {
  padding: 7px 11px;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--tan);
  border-top: 1px solid rgba(200, 184, 154, 0.25);
}
```

```html
<div class="ug-figure">
  <img class="ug-fig-img" src="..." alt="A Life at Sea">
  <div class="ug-fig-cap">A Life at Sea — Illustration, 1812</div>
</div>
```

---

### Badges

Four variants for format designations, series labels, and status indicators.

```css
.ug-badge  {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 8px;
}

.ug-b-ink { background: var(--dark);  color: var(--tan-lt); }
.ug-b-tan { background: var(--tan);   color: var(--ink); }
.ug-b-red { background: var(--red);   color: #fff; }
.ug-b-out { border: 1px solid var(--rule-s); color: var(--ink); }
```

```html
<span class="ug-badge ug-b-ink">Standard</span>
<span class="ug-badge ug-b-tan">B-Series</span>
<span class="ug-badge ug-b-red">New</span>
<span class="ug-badge ug-b-out">Draft</span>
```

---

### Notes

Left-bordered callout blocks for supplementary or production-critical information.

```css
.ug-note {
  border-left: 3px solid var(--ink);
  padding: 9px 14px;
  background: rgba(0, 0, 0, 0.04);
  font-size: 15px;
  color: var(--ink-2);
  line-height: 1.6;
}

.ug-note-red {
  border-left-color: var(--red);
  background: rgba(192, 57, 43, 0.06);
}
```

```html
<div class="ug-note">
  The grid helps the designer overcome problems of size and scale...
</div>

<div class="ug-note ug-note-red">
  All formats can be cut from the 965 × 1270 mm sheet...
</div>
```

---

### Tables

Ruled data tables with uppercase headers.

```css
.ug-table { width: 100%; border-collapse: collapse; font-size: 15px; }

.ug-table th {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border-bottom: 2px solid var(--ink);
  padding: 6px 10px 6px 0;
  text-align: left;
}

.ug-table td {
  padding: 7px 10px 7px 0;
  border-bottom: 1px solid var(--rule);
  color: var(--ink-2);
  vertical-align: top;
}

.ug-table tr:last-child td { border-bottom: none; }
```

---

## Wizard Components

Form-based wizard components for the CivicGuide pattern: the agent reacts to answers, never asks questions. Every component surfaces a valid choice — no blank inputs.

---

### Stage Track

Shows where the user is in the wizard and what remains. Completed stages use `--tan-dk`; the active stage fires red. Apply `is-done` and `is-active` classes via JS as the user advances.

```css
.ug-stage-track {
  display: flex;
  align-items: flex-start;
  border-bottom: 2px solid var(--ink);
}

.ug-stage {
  flex: 1;
  padding: 10px 14px 12px;
  position: relative;
  border-right: 1px solid var(--rule);
}

.ug-stage:last-child { border-right: none; }

.ug-stage-num  { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: var(--ink-3); margin-bottom: 3px; }
.ug-stage-name { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-3); }

.ug-stage.is-done .ug-stage-num,
.ug-stage.is-done .ug-stage-name { color: var(--tan-dk); }

.ug-stage.is-done::after,
.ug-stage.is-active::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0; right: 0;
  height: 2px;
}

.ug-stage.is-done::after   { background: var(--tan-dk); }
.ug-stage.is-active::after { background: var(--red); }

.ug-stage.is-active { background: var(--paper); }
.ug-stage.is-active .ug-stage-num  { color: var(--red); }
.ug-stage.is-active .ug-stage-name { color: var(--ink); }
```

```html
<div class="ug-stage-track">
  <div class="ug-stage is-done">
    <div class="ug-stage-num">01</div>
    <div class="ug-stage-name">Location</div>
  </div>
  <div class="ug-stage is-active">
    <div class="ug-stage-num">02</div>
    <div class="ug-stage-name">Domain</div>
  </div>
  <div class="ug-stage">
    <div class="ug-stage-num">03</div>
    <div class="ug-stage-name">Document</div>
  </div>
</div>
```

---

### Domain Grid

Replaces "which civic domain?" as a single-select button grid. Selected tile inverts to `--dark` background.

```css
.ug-domain-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ug-domain-tile {
  padding: 16px 14px;
  border: 1px solid var(--rule-s);
  cursor: pointer;
  background: var(--paper);
}

.ug-domain-tile:hover { border-color: var(--ink-3); }

.ug-domain-tile.is-selected { background: var(--dark); border-color: var(--ink); }

.ug-domain-name { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); }
.ug-domain-sub  { font-size: 11px; color: var(--ink-3); margin-top: 3px; line-height: 1.4; }

.ug-domain-tile.is-selected .ug-domain-name { color: var(--tan-lt); }
.ug-domain-tile.is-selected .ug-domain-sub  { color: var(--tan-dk); }
```

```html
<div class="ug-domain-grid">
  <div class="ug-domain-tile" onclick="selectDomain(this)">
    <div class="ug-domain-name">Parks</div>
    <div class="ug-domain-sub">Permits, reservations</div>
  </div>
  <!-- repeat for each domain -->
</div>

<script>
function selectDomain(el) {
  document.querySelectorAll('.ug-domain-tile').forEach(t => t.classList.remove('is-selected'));
  el.classList.add('is-selected');
  state.domain = el.dataset.domain;
  shell.advance();
}
</script>
```

---

### Binary Choice Card

Two-path decision as equal-weight cards. Selected card inverts to `--dark`. Used for Upload vs. Describe, and any other either/or branch.

```css
.ug-choice-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ug-choice-card {
  padding: 22px 20px;
  border: 1px solid var(--rule-s);
  cursor: pointer;
  background: var(--paper);
}

.ug-choice-card:hover { border-color: var(--ink-3); }
.ug-choice-card.is-selected { background: var(--dark); border-color: var(--ink); }

.ug-choice-top   { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.ug-choice-mark  { width: 14px; height: 14px; border: 1px solid var(--rule-s); border-radius: 50%; }
.ug-choice-label { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; color: var(--ink); }
.ug-choice-desc  { font-size: 15px; line-height: 1.55; color: var(--ink-3); }

.ug-choice-card.is-selected .ug-choice-label { color: var(--tan-lt); }
.ug-choice-card.is-selected .ug-choice-desc  { color: var(--tan-dk); }
.ug-choice-card.is-selected .ug-choice-mark  { border-color: var(--tan); background: var(--red); }
```

```html
<div class="ug-choice-pair">
  <div class="ug-choice-card" onclick="selectChoice(this)">
    <div class="ug-choice-top">
      <div class="ug-choice-label">Upload a document</div>
      <div class="ug-choice-mark"></div>
    </div>
    <div class="ug-choice-desc">You have a letter, notice, or form you received.</div>
  </div>
  <div class="ug-choice-card" onclick="selectChoice(this)">
    <div class="ug-choice-top">
      <div class="ug-choice-label">Describe your situation</div>
      <div class="ug-choice-mark"></div>
    </div>
    <div class="ug-choice-desc">No document yet. Tell us what happened.</div>
  </div>
</div>
```

---

### Location Input

Text field paired with a geolocation trigger. The button fills the field from the browser API — no typing required.

```css
.ug-loc-field { display: flex; }

.ug-loc-input {
  flex: 1;
  font-size: 16px;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--rule-s);
  border-right: none;
  padding: 10px 12px;
  outline: none;
  min-width: 0;
}

.ug-loc-input:focus     { border-color: var(--ink); }
.ug-loc-input::placeholder { color: var(--ink-3); }

.ug-loc-btn {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: var(--dark);
  color: var(--tan-lt);
  border: 1px solid var(--ink);
  padding: 10px 16px;
  cursor: pointer;
}

.ug-loc-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tan-dk);
  margin-bottom: 7px;
}
```

```html
<div class="ug-loc-label">Your Location</div>
<div class="ug-loc-field">
  <input class="ug-loc-input" type="text" placeholder="City or ZIP code">
  <button class="ug-loc-btn" onclick="getLocation()">Use My Location</button>
</div>

<script>
function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    // reverse-geocode, then:
    document.querySelector('.ug-loc-input').value = result.city;
    state.location = result.city;
  });
}
</script>
```

---

### Scoped Dropdown

Options populate based on the prior domain selection. Always appears after a domain is confirmed — never shown with a generic option list.

```css
.ug-select-wrap { position: relative; display: inline-block; width: 100%; }

.ug-select {
  appearance: none;
  width: 100%;
  font-size: 16px;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--rule-s);
  padding: 10px 36px 10px 12px;
  outline: none;
  cursor: pointer;
}

.ug-select:focus { border-color: var(--ink); }

.ug-select-arrow {
  pointer-events: none;
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--ink-3);
}

.ug-select-label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tan-dk); margin-bottom: 7px; }
.ug-select-hint  { font-size: 11px; color: var(--ink-3); margin-top: 5px; }
```

```html
<div class="ug-select-label">Document Type</div>
<div class="ug-select-wrap">
  <select class="ug-select" id="doc-type"></select>
  <span class="ug-select-arrow">▾</span>
</div>

<script>
const DOC_TYPES = {
  dmv:     ['Driver License Renewal', 'Vehicle Registration', 'ID Card Application'],
  welfare: ['SNAP Application', 'Medicaid Enrollment', 'Cash Assistance'],
  housing: ['Section 8 Voucher', 'Emergency Rental Assistance', 'Public Housing Application'],
};

function updateDocTypes(domain) {
  const sel = document.getElementById('doc-type');
  sel.innerHTML = DOC_TYPES[domain].map(t => `<option>${t}</option>`).join('');
}
</script>
```

---

### Field + Agent Hint

A `?` trigger on each field reveals an agent-written hint inline. Text is injected below the field and persists until dismissed. The hint zone is distinct from `.ug-note` — no left border, lighter background.

```css
.ug-field-wrap      { margin-bottom: 20px; }
.ug-field-label-row { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
.ug-field-label     { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tan-dk); }

.ug-field-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px; height: 14px;
  border: 1px solid var(--rule-s);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-3);
  cursor: pointer;
}

.ug-field-help:hover,
.ug-field-help.is-open { border-color: var(--ink); color: var(--ink); }

.ug-field-input {
  width: 100%;
  font-size: 16px;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--rule-s);
  padding: 10px 12px;
  outline: none;
}

.ug-field-input:focus { border-color: var(--ink); }

/* Hint zone */
.ug-hint {
  margin-top: 8px;
  padding: 9px 12px;
  background: var(--paper);
  border: 1px solid var(--rule);
  font-size: 15px;
  color: var(--ink-2);
  line-height: 1.6;
  display: none;
}

.ug-hint.is-visible { display: block; }

.ug-hint-attr {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tan-dk);
  margin-top: 6px;
}
```

```html
<div class="ug-field-wrap">
  <div class="ug-field-label-row">
    <span class="ug-field-label">Case Number</span>
    <span class="ug-field-help" onclick="toggleHint(this, 'hint-case')">?</span>
  </div>
  <input class="ug-field-input" type="text" placeholder="e.g. 2024-DMV-00847">
  <div class="ug-hint" id="hint-case">
    <!-- agent writes here via onMessage -->
    <span class="ug-hint-attr">Gemini — DMV domain</span>
  </div>
</div>

<script>
// Wire agent response to hint zone
stage.onMessage = (text) => {
  const el = document.getElementById('hint-case');
  el.textContent = text;
  el.classList.add('is-visible');
};
</script>
```

---

### Annotate Expand

Document sections shown as collapsed rows. Tapping a row opens an agent explanation below it. Built on the hint zone — same visual output, triggered by a document section label.

```css
.ug-annotate-block { border-top: 2px solid var(--ink); }
.ug-annotate-row   { border-bottom: 1px solid var(--rule); }

.ug-annotate-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  cursor: pointer;
}

.ug-ann-label  { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-2); }
.ug-ann-toggle { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }

.ug-annotate-trigger:hover .ug-ann-label,
.ug-annotate-trigger:hover .ug-ann-toggle { color: var(--ink); }

.ug-annotate-body          { display: none; padding: 0 0 14px; }
.ug-annotate-body.is-open  { display: block; }
.ug-annotate-body .ug-hint { display: block; margin-top: 0; }
```

```html
<div class="ug-annotate-block">
  <div class="ug-annotate-row">
    <div class="ug-annotate-trigger" onclick="toggleAnnotate(this)">
      <span class="ug-ann-label">Section 1 — Applicant Information</span>
      <span class="ug-ann-toggle">Explain ▾</span>
    </div>
    <div class="ug-annotate-body">
      <div class="ug-hint is-visible">
        This section asks for your legal name as it appears on a government ID.
        <span class="ug-hint-attr">Gemini — document annotation</span>
      </div>
    </div>
  </div>
</div>
```

---

### Hint Zone

The standalone `--hint` container — the single surface where agent responses appear. Lighter than a note. Used directly in annotate expand and as the `onMessage` target in field + hint.

```css
.ug-hint {
  padding: 9px 12px;
  background: var(--paper);
  border: 1px solid var(--rule);
  font-size: 15px;
  color: var(--ink-2);
  line-height: 1.6;
}

.ug-hint-attr {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--tan-dk);
  margin-top: 6px;
}
```

```html
<div class="ug-hint" id="agent-hint"></div>

<script>
// From civicguide-ux-rationale.md:
stage.onMessage = (text) => {
  const el = document.getElementById('agent-hint');
  el.textContent = text;
  el.classList.add('is-visible');
};
</script>
```

---

### Review Card

Final stage. All confirmed values in a ruled table, explicit confirm action, and a back path. Edit links return to individual stages.

```css
.ug-review     { border-top: 3px solid var(--ink); }
.ug-review-head {
  padding: 14px 0 10px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid var(--rule-s);
}

.ug-review-title { font-size: 16px; font-weight: 700; color: var(--ink); }
.ug-review-edit  { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tan-dk); background: none; border: none; cursor: pointer; }

.ug-review table { width: 100%; border-collapse: collapse; }

.ug-review td { padding: 9px 0; border-bottom: 1px solid var(--rule); font-size: 15px; vertical-align: top; }
.ug-review td:first-child { width: 140px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); padding-right: 16px; padding-top: 11px; }
.ug-review tr:last-child td { border-bottom: none; }

.ug-review-actions { margin-top: 18px; display: flex; gap: 10px; align-items: center; }

.ug-confirm-btn {
  font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  background: var(--dark); color: var(--tan-lt);
  border: none; padding: 11px 22px; cursor: pointer;
}

.ug-back-btn {
  font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  background: none; border: 1px solid var(--rule-s); color: var(--ink-3);
  padding: 10px 16px; cursor: pointer;
}
```

```html
<div class="ug-review">
  <div class="ug-review-head">
    <span class="ug-review-title">Review your submission</span>
  </div>
  <table>
    <tr>
      <td>Location</td>
      <td>Brooklyn, NY 11201 <button class="ug-review-edit">Edit</button></td>
    </tr>
    <tr>
      <td>Domain</td>
      <td>DMV <button class="ug-review-edit">Edit</button></td>
    </tr>
    <tr>
      <td>Document</td>
      <td>Driver License Renewal</td>
    </tr>
  </table>
  <div class="ug-review-actions">
    <button class="ug-confirm-btn">Confirm &amp; Submit</button>
    <button class="ug-back-btn">Back</button>
  </div>
</div>
```

---

## Grid System

All formats derive from the B6 base sheet. A 12-column overlay provides the organizational structure.

```css
/* Layout helpers */
.layout-3col { grid-template-columns: repeat(3, 1fr); }
.layout-4col { grid-template-columns: repeat(4, 1fr); }
```

**Standard format sizes** (NPS reference):

| Format | Width | Height | Panels |
|---|---|---|---|
| A4 | 210 mm | 297 mm | 3 |
| B-Series | 176 mm | 250 mm | 4 |
| Broadside | 356 mm | 216 mm | 8 |
| Standard Travel | 99 mm | 210 mm | 6 |

---

## Design Principles

1. **The broadside is always dominant.** The large dark header band anchors every layout. Everything below serves it.
2. **Columns open like folds.** Text column widths correspond to physical fold panels — the layout should make sense both flat and folded.
3. **Rules replace decoration.** Hierarchy is expressed through rule weight (1px, 3px, 3px double), not color or shading.
4. **Single typeface, two jobs.** Helvetica Neue handles structure (labels, headings) and editorial content (body, captions). Differentiation comes from weight, size, and letter-spacing — not face switching.
5. **Tan on dark, ink on paper.** On `--dark` backgrounds, use `--tan` or `--tan-lt` for text. On `--paper` backgrounds, use `--ink` or `--ink-2`. Red is reserved for active states and warnings only.
6. **The agent reacts, never asks.** In wizard flows, every screen offers valid choices. Gemini responses surface as inline hint text — not as chat bubbles or modal dialogs.

---

*Based on the Unigrid System designed for the National Park Service Informational Folder Program, with consulting design by Massimo Vignelli.*
