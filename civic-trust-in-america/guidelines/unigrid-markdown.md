# Unigrid Design System

A CSS design system derived from the National Park Service Unigrid Informational Folder Program — a standardized graphic and production system originally developed for NPS site folders. The system solves two problems: organizing editorial and graphic variables to a format, and helping determine how a folder will be printed.

---

## Philosophy

- **Grid-driven**: All dimensions derive from the B6 acetate base sheet. 12 panels per side, consistent gutters.
- **Two-typeface rule**: Helvetica Neue for structure and labels; Georgia for editorial body copy. They do not cross into each other's territory.
- **Restrained palette**: Ink, tan, paper, and a single rule red. Color is used for hierarchy, not decoration.
- **Print heritage**: Rules, columns, and figure captions follow broadsheet and folder conventions — not screen UI conventions.

---

## CSS Variables

Paste into `:root {}` to use the system:

```css
:root {
  --ink:        #1A1A18;   /* primary text, heavy rules */
  --ink-2:      #3D3D38;   /* body text */
  --ink-3:      #6B6B63;   /* captions, muted labels */
  --tan:        #C8B89A;   /* accent, borders on dark backgrounds */
  --tan-lt:     #E8DDD0;   /* text on dark surfaces */
  --tan-dk:     #8B7355;   /* nav labels, secondary labels */
  --paper:      #F5F0E8;   /* page background */
  --paper-dk:   #EDE5D8;   /* preview surfaces, secondary bg */
  --red:        #C0392B;   /* highlight, active states */
  --red-lt:     #F0D0CC;   /* red tint backgrounds */
  --rule:       rgba(26, 26, 24, 0.15);   /* light dividers */
  --rule-s:     rgba(26, 26, 24, 0.35);   /* strong dividers */
  --ff-head:    'Helvetica Neue', Helvetica, Arial, sans-serif;
  --ff-body:    Georgia, 'Times New Roman', serif;
  --gutter:     12px;
  --col:        calc((100% - 132px) / 12);  /* 12 cols, 11 gutters */
}
```

---

## Typography

| Role | Family | Size | Weight | Notes |
|---|---|---|---|---|
| H1 | Helvetica Neue | 34px | 700 | `letter-spacing: -0.04em` |
| H2 | Helvetica Neue | 22px | 700 | `letter-spacing: -0.02em` |
| H3 | Helvetica Neue | 15px | 700 | — |
| Body | Georgia | 13px | 400 | `line-height: 1.65` |
| Caption | Helvetica Neue | 10px | 400 | `letter-spacing: 0.08em; color: var(--ink-3)` |
| Label | Helvetica Neue | 9px | 700 | `letter-spacing: 0.18em; text-transform: uppercase; color: var(--tan-dk)` |

```css
.ug-h1    { font-family: var(--ff-head); font-size: 34px; font-weight: 700; letter-spacing: -0.04em; line-height: 1.05; }
.ug-h2    { font-family: var(--ff-head); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.ug-h3    { font-family: var(--ff-head); font-size: 15px; font-weight: 700; }
.ug-body  { font-family: var(--ff-body); font-size: 13px; line-height: 1.65; color: var(--ink-2); }
.ug-cap   { font-family: var(--ff-head); font-size: 10px; letter-spacing: 0.08em; color: var(--ink-3); }
.ug-lbl   { font-family: var(--ff-head); font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--tan-dk); }
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

## Components

### Broadside

The dominant header band on every folder. Dark background, large place-name title, agency attribution flush right.

```css
.ug-broadside {
  background: var(--ink);
  color: #fff;
  padding: 14px 22px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.ug-broadside .ug-title {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}

.ug-broadside .ug-meta {
  font-size: 10px;
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

Multi-column editorial layout with vertical hairline rules between columns and a thick top rule. Mirrors folded panel structure.

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
  font-size: 12px;
  line-height: 1.65;
  color: var(--ink-2);
}

.ug-col:last-child { border-right: none; padding-right: 0; }
.ug-col:not(:first-child) { padding-left: 18px; }

.ug-col h3 {
  font-family: var(--ff-head);
  font-size: 10px;
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
    Body copy in Georgia...
  </div>
  <div class="ug-col">
    <h3>Preferred Colors</h3>
    Body copy in Georgia...
  </div>
  <div class="ug-col">
    <h3>Maps</h3>
    Body copy in Georgia...
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

Image panels on an ink background with a tan caption strip. Consistent treatment regardless of image content.

```css
.ug-figure   { background: var(--ink); overflow: hidden; }

.ug-fig-img  {
  width: 100%;
  display: block;
  /* replace with <img> in production */
}

.ug-fig-cap  {
  padding: 7px 11px;
  font-size: 10px;
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
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 8px;
}

.ug-b-ink { background: var(--ink);   color: var(--tan-lt); }
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
  font-family: var(--ff-body);
  font-size: 12px;
  font-style: italic;
  color: var(--ink-2);
}

.ug-note-red {
  border-left-color: var(--red);
  background: rgba(192, 57, 43, 0.06);
}
```

```html
<!-- General note -->
<div class="ug-note">
  The grid helps the designer overcome problems of size and scale...
</div>

<!-- Production warning -->
<div class="ug-note ug-note-red">
  All formats can be cut from the 965 × 1270 mm sheet...
</div>
```

---

### Tables

Ruled data tables. Uppercase small-cap headers, Georgia body text for editorial warmth.

```css
.ug-table { width: 100%; border-collapse: collapse; font-size: 12px; }

.ug-table th {
  font-size: 9px;
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
  font-family: var(--ff-body);
  color: var(--ink-2);
  vertical-align: top;
}

.ug-table tr:last-child td { border-bottom: none; }
```

---

## Grid System

All formats are derived from the B6 base sheet. A 12-column overlay is used as the organizational grid.

```css
/* Layout helpers — set grid-template-columns to match fold count */
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
4. **Two fonts, two jobs.** Helvetica Neue handles structure (labels, headings, UI). Georgia handles editorial content (body, captions, notes). They do not mix within the same element.
5. **Tan on dark, ink on paper.** On dark (`--ink`) backgrounds, use `--tan` or `--tan-lt` for text. On light (`--paper`) backgrounds, use `--ink` or `--ink-2`. Red is reserved for active states and warnings only.

---

*Based on the Unigrid System designed for the National Park Service Informational Folder Program, with consulting design by Massimo Vignelli.*
