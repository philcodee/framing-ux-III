# Carbon Design System — CSS Revision Guide

A practical reference for aligning your product's CSS to the [IBM Carbon Design System v11](https://carbondesignsystem.com). Use this document as a checklist and token reference when migrating or auditing your stylesheet.

---

## Table of Contents

1. [Setup & Installation](#1-setup--installation)
2. [Design Tokens — How They Work](#2-design-tokens--how-they-work)
3. [Color Tokens (White Theme)](#3-color-tokens-white-theme)
4. [Typography](#4-typography)
5. [Spacing Scale](#5-spacing-scale)
6. [Layout & Grid](#6-layout--grid)
7. [Motion](#7-motion)
8. [Theming — Light & Dark Mode](#8-theming--light--dark-mode)
9. [Component-Level Tokens](#9-component-level-tokens)
10. [Audit Checklist](#10-audit-checklist)
11. [Migration Notes (v10 → v11)](#11-migration-notes-v10--v11)

---

## 1. Setup & Installation

### Install Carbon styles

```bash
npm install @carbon/react        # React apps (includes @carbon/styles)
# or
npm install @carbon/styles       # Framework-agnostic (Sass tokens + CSS)
```

### Load via Sass (recommended)

```scss
// Entry point — loads all Carbon tokens, reset, and component styles
@use '@carbon/styles';
```

### Load via CDN (prototype / no build)

```html
<link rel="stylesheet"
  href="https://1.www.s81c.com/common/carbon/web-components/tag/v2/latest/all.css" />
```

### Load IBM Plex via Google Fonts (no bundler required)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;600&family=IBM+Plex+Serif:wght@300;400&display=swap" rel="stylesheet" />
```

---

## 2. Design Tokens — How They Work

Carbon v11 ships all tokens as **CSS Custom Properties** (prefixed `--cds-`). Sass variables (`$token-name`) and CSS custom properties (`var(--cds-token-name)`) are equivalent — choose based on your build setup.

### Token naming convention

```
[element] - [role] - [order] - [state]
```

Examples:
- `--cds-background` — page background surface
- `--cds-text-primary` — main body/heading text
- `--cds-button-primary` — primary action background
- `--cds-layer-01` — first elevation layer
- `--cds-focus` — keyboard focus ring color

> **Note:** In v10, tokens used numerals (`$ui-01`, `$text-01`). In v11, numerals are replaced with descriptive adjectives (`layer-01` is the exception — layering tokens keep numerals).

---

## 3. Color Tokens (White Theme)

### Background

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Background | `--cds-background` | `#ffffff` | Page background |
| Background Active | `--cds-background-active` | `#c6c6c6` | Clicked background |
| Background Hover | `--cds-background-hover` | `#e8e8e8` | Hovered background |
| Background Selected | `--cds-background-selected` | `#e0e0e0` | Selected background |
| Background Inverse | `--cds-background-inverse` | `#393939` | High-contrast backgrounds |

### Layer (Elevation)

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Layer 01 | `--cds-layer-01` | `#f4f4f4` | Cards, sidebars, containers |
| Layer 02 | `--cds-layer-02` | `#ffffff` | Nested cards/panels |
| Layer 03 | `--cds-layer-03` | `#f4f4f4` | Deeply nested content |
| Layer Active 01 | `--cds-layer-active-01` | `#c6c6c6` | Active state on layer-01 |
| Layer Hover 01 | `--cds-layer-hover-01` | `#e8e8e8` | Hover state on layer-01 |
| Layer Selected 01 | `--cds-layer-selected-01` | `#e0e0e0` | Selected state on layer-01 |
| Layer Accent 01 | `--cds-layer-accent-01` | `#e0e0e0` | Subtle accents on layer-01 |

### Text

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Text Primary | `--cds-text-primary` | `#161616` | Body, headings |
| Text Secondary | `--cds-text-secondary` | `#525252` | Labels, captions |
| Text Placeholder | `--cds-text-placeholder` | `#a8a8a8` | Input placeholder text |
| Text Helper | `--cds-text-helper` | `#6f6f6f` | Helper text below inputs |
| Text Error | `--cds-text-error` | `#da1e28` | Error messages |
| Text Inverse | `--cds-text-inverse` | `#ffffff` | Text on dark backgrounds |
| Text On Color | `--cds-text-on-color` | `#ffffff` | Text on colored backgrounds |
| Text Disabled | `--cds-text-disabled` | `#c6c6c6` | Disabled text |

### Link

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Link Primary | `--cds-link-primary` | `#0f62fe` | Default link |
| Link Primary Hover | `--cds-link-primary-hover` | `#0043ce` | Hovered link |
| Link Secondary | `--cds-link-secondary` | `#0043ce` | Secondary links |
| Link Visited | `--cds-link-visited` | `#8a3ffc` | Visited links |
| Link Inverse | `--cds-link-inverse` | `#78a9ff` | Links on dark surfaces |

### Icon

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Icon Primary | `--cds-icon-primary` | `#161616` | Primary icons |
| Icon Secondary | `--cds-icon-secondary` | `#525252` | Secondary icons |
| Icon Inverse | `--cds-icon-inverse` | `#ffffff` | Icons on dark surfaces |
| Icon On Color | `--cds-icon-on-color` | `#ffffff` | Icons on colored backgrounds |
| Icon Disabled | `--cds-icon-disabled` | `#c6c6c6` | Disabled icons |

### Interactive / Brand

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Interactive | `--cds-interactive` | `#0f62fe` | Primary interactive elements |
| Focus | `--cds-focus` | `#0f62fe` | Focus outlines |
| Focus Inset | `--cds-focus-inset` | `#ffffff` | Focus ring inset shadow |
| Highlight | `--cds-highlight` | `#d0e2ff` | Selection highlight |

### Border

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Border Subtle 00 | `--cds-border-subtle-00` | `#e0e0e0` | Borders on `background` |
| Border Subtle 01 | `--cds-border-subtle-01` | `#c6c6c6` | Borders on `layer-01` |
| Border Subtle 02 | `--cds-border-subtle-02` | `#e0e0e0` | Borders on `layer-02` |
| Border Strong 01 | `--cds-border-strong-01` | `#8d8d8d` | High-emphasis borders |
| Border Inverse | `--cds-border-inverse` | `#161616` | Borders on inverse surfaces |
| Border Interactive | `--cds-border-interactive` | `#0f62fe` | Active/selected borders |
| Border Disabled | `--cds-border-disabled` | `#c6c6c6` | Disabled inputs |

### Support (Feedback colors)

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Support Error | `--cds-support-error` | `#da1e28` | Error states |
| Support Warning | `--cds-support-warning` | `#f1c21b` | Warning states |
| Support Success | `--cds-support-success` | `#198038` | Success states |
| Support Info | `--cds-support-info` | `#0043ce` | Informational states |
| Support Error Inverse | `--cds-support-error-inverse` | `#ff8389` | Errors on dark backgrounds |
| Support Warning Inverse | `--cds-support-warning-inverse` | `#f1c21b` | Warnings on dark backgrounds |

### Overlay & Miscellaneous

| Token | CSS Variable | Default Value | Usage |
|---|---|---|---|
| Overlay | `--cds-overlay` | `rgba(22,22,22,0.5)` | Modal/dialog backdrop |
| Skeleton Element | `--cds-skeleton-element` | `#c6c6c6` | Loading skeleton shapes |
| Skeleton Background | `--cds-skeleton-background` | `#e8e8e8` | Loading skeleton containers |
| Toggle Off | `--cds-toggle-off` | `#8d8d8d` | Inactive toggle |

---

## 4. Typography

### Font families

```css
font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;    /* Default */
font-family: 'IBM Plex Serif', 'Georgia', Times, serif;               /* Serif */
font-family: 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', monospace; /* Mono / Code */
```

### Type scale (productive — product UI)

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `label-01` | 12px / .75rem | 16px | 400 | .32px | Labels, tags |
| `label-02` | 14px / .875rem | 18px | 400 | .16px | Larger labels |
| `helper-text-01` | 12px / .75rem | 16px | 400 | .32px | Form helper text |
| `helper-text-02` | 14px / .875rem | 18px | 400 | .16px | Larger helper text |
| `body-compact-01` | 14px / .875rem | 18px | 400 | .16px | Short body / list items |
| `body-compact-02` | 16px / 1rem | 22px | 400 | 0px | Larger short body |
| `body-01` | 14px / .875rem | 20px | 400 | .16px | Running body copy |
| `body-02` | 16px / 1rem | 24px | 400 | 0px | Larger running body |
| `heading-compact-01` | 14px / .875rem | 18px | 600 | .16px | Component headings |
| `heading-compact-02` | 16px / 1rem | 22px | 600 | 0px | Section headings |
| `heading-01` | 14px / .875rem | 20px | 600 | .16px | Productive heading |
| `heading-02` | 16px / 1rem | 24px | 600 | 0px | Larger heading |
| `heading-03` | 20px / 1.25rem | 28px | 400 | 0px | H3-level |
| `heading-04` | 28px / 1.75rem | 36px | 400 | 0px | H2-level |
| `heading-05` | 36px / 2.25rem | 44px | 300 | 0px | H1-level |
| `heading-06` | 48px / 3rem | 56px | 300 | 0px | Display heading |
| `heading-07` | 60px / 3.75rem | 70px | 300 | 0px | Large display |
| `code-01` | 12px / .75rem | 16px | 400 | .32px | Inline code |
| `code-02` | 14px / .875rem | 20px | 400 | .32px | Code blocks |

### Applying type styles in CSS

```css
/* body-compact-01 */
.my-text {
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 400;
  line-height: 1.125rem;   /* 18px */
  letter-spacing: 0.16px;
}

/* heading-compact-01 */
.my-heading {
  font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 600;
  line-height: 1.125rem;   /* 18px */
  letter-spacing: 0.16px;
}
```

### Applying type styles in Sass

```scss
@use '@carbon/styles/scss/type';

.my-heading {
  @include type.type-style('heading-compact-01');
}

.my-body {
  @include type.type-style('body-01');
}
```

---

## 5. Spacing Scale

Carbon uses a **base-8 spacing scale**. All values are multiples of 8px, starting from 2px.

| Token | Sass `$spacing-*` | CSS `--cds-spacing-*` | Value |
|---|---|---|---|
| spacing-01 | `$spacing-01` | `--cds-spacing-01` | 2px / .125rem |
| spacing-02 | `$spacing-02` | `--cds-spacing-02` | 4px / .25rem |
| spacing-03 | `$spacing-03` | `--cds-spacing-03` | 8px / .5rem |
| spacing-04 | `$spacing-04` | `--cds-spacing-04` | 12px / .75rem |
| spacing-05 | `$spacing-05` | `--cds-spacing-05` | 16px / 1rem |
| spacing-06 | `$spacing-06` | `--cds-spacing-06` | 24px / 1.5rem |
| spacing-07 | `$spacing-07` | `--cds-spacing-07` | 32px / 2rem |
| spacing-08 | `$spacing-08` | `--cds-spacing-08` | 40px / 2.5rem |
| spacing-09 | `$spacing-09` | `--cds-spacing-09` | 48px / 3rem |
| spacing-10 | `$spacing-10` | `--cds-spacing-10` | 64px / 4rem |
| spacing-11 | `$spacing-11` | `--cds-spacing-11` | 80px / 5rem |
| spacing-12 | `$spacing-12` | `--cds-spacing-12` | 96px / 6rem |
| spacing-13 | `$spacing-13` | `--cds-spacing-13` | 160px / 10rem |

### Layout scale (macro-level gaps between sections)

| Token | CSS Variable | Value |
|---|---|---|
| layout-01 | `--cds-layout-01` | 16px / 1rem |
| layout-02 | `--cds-layout-02` | 24px / 1.5rem |
| layout-03 | `--cds-layout-03` | 32px / 2rem |
| layout-04 | `--cds-layout-04` | 48px / 3rem |
| layout-05 | `--cds-layout-05` | 64px / 4rem |
| layout-06 | `--cds-layout-06` | 96px / 6rem |
| layout-07 | `--cds-layout-07` | 160px / 10rem |

---

## 6. Layout & Grid

Carbon uses a **2x Grid** (based on a 4-column, 8-column, or 16-column grid depending on breakpoint).

### Breakpoints

| Breakpoint | Token | Min Width |
|---|---|---|
| Small | `sm` | 320px |
| Medium | `md` | 672px |
| Large | `lg` | 1056px |
| X-Large | `xlg` | 1312px |
| Max | `max` | 1584px |

### Enable CSS Grid in Sass

```scss
@use '@carbon/styles';
// or individually:
@use '@carbon/styles/scss/grid';
```

### Grid classes (HTML)

```html
<div class="cds--grid">
  <div class="cds--row">
    <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8">
      Content
    </div>
    <div class="cds--col-sm-4 cds--col-md-4 cds--col-lg-8">
      Content
    </div>
  </div>
</div>
```

### Grid modifiers

```html
<!-- Full width (no gutters on edges) -->
<div class="cds--grid cds--grid--full-width">

<!-- Condensed (tighter gutters) -->
<div class="cds--grid cds--grid--condensed">

<!-- Narrow (no left margin/padding on columns) -->
<div class="cds--grid cds--grid--narrow">
```

---

## 7. Motion

Carbon defines a motion scale for animation duration and easing.

### Duration tokens

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| Fast 01 | `--cds-duration-fast-01` | 70ms | Micro-interactions, hover |
| Fast 02 | `--cds-duration-fast-02` | 110ms | Small elements |
| Moderate 01 | `--cds-duration-moderate-01` | 150ms | Panels, menus |
| Moderate 02 | `--cds-duration-moderate-02` | 240ms | Expanding content |
| Slow 01 | `--cds-duration-slow-01` | 400ms | Large surfaces |
| Slow 02 | `--cds-duration-slow-02` | 700ms | Full-screen transitions |

### Easing tokens

| Token | CSS Variable | Value | Usage |
|---|---|---|---|
| Standard | `--cds-motion-standard` | `cubic-bezier(0.2, 0, 0.38, 0.9)` | Standard transitions |
| Entrance | `--cds-motion-entrance` | `cubic-bezier(0, 0, 0.38, 0.9)` | Elements entering |
| Exit | `--cds-motion-exit` | `cubic-bezier(0.2, 0, 1, 0.9)` | Elements leaving |
| Expressive | `--cds-motion-expressive-standard` | `cubic-bezier(0.4, 0.14, 0.3, 1)` | Expressive/brand motion |

### Usage example

```css
.my-panel {
  transition: transform var(--cds-duration-moderate-02)
              var(--cds-motion-entrance);
}
```

---

## 8. Theming — Light & Dark Mode

Carbon v11 ships four themes: **White** (default), **Gray 10 (G10)**, **Gray 90 (G90)**, **Gray 100 (G100)**.

### Apply a theme globally via Sass

```scss
// Default: White theme (no config needed)
@use '@carbon/styles';

// Gray 10 theme
@use '@carbon/styles/scss/themes' as themes;
@use '@carbon/styles/scss/theme' with ($theme: themes.$g10);
@use '@carbon/styles';

// Dark theme (Gray 90)
@use '@carbon/styles/scss/theme' with ($theme: themes.$g90);
@use '@carbon/styles';
```

### Apply a theme inline (sub-section dark mode)

```html
<!-- Wrap a section in a data attribute to switch themes locally -->
<div data-carbon-theme="g90">
  <!-- All Carbon tokens inside here will use the Gray 90 dark palette -->
</div>
```

### Customize a theme — override individual tokens

```scss
@use '@carbon/styles/scss/theme' with (
  $theme: (
    background: #f5f0ff,
    interactive: #6929c4,
    focus: #6929c4,
    link-primary: #6929c4,
  )
);
@use '@carbon/styles';
```

### CSS Custom Properties approach (runtime theming)

```css
:root {
  --cds-interactive: #6929c4;
  --cds-focus: #6929c4;
  --cds-link-primary: #6929c4;
}

/* Dark mode override */
@media (prefers-color-scheme: dark) {
  :root {
    --cds-background: #161616;
    --cds-layer-01: #262626;
    --cds-text-primary: #f4f4f4;
  }
}
```

---

## 9. Component-Level Tokens

Some components expose their own token layer. Import and override them individually.

### Button

```scss
@use '@carbon/styles/scss/components/button' as button with (
  $button-primary: #6929c4,
  $button-primary-hover: #491d8b,
  $button-primary-active: #31135e,
);
```

| Token | Default (White) | Usage |
|---|---|---|
| `$button-primary` | `#0f62fe` | Primary button background |
| `$button-primary-hover` | `#0353e9` | Primary hover |
| `$button-primary-active` | `#002d9c` | Primary active/pressed |
| `$button-secondary` | `#393939` | Secondary button |
| `$button-danger-primary` | `#da1e28` | Danger button |
| `$button-separator` | `#e0e0e0` | Button set dividers |
| `$button-disabled` | `#c6c6c6` | Disabled button bg |

### Notification

```scss
@use '@carbon/styles/scss/components/notification';
```

### Tag

```scss
@use '@carbon/styles/scss/components/tag';
```

---

## 10. Audit Checklist

Use this checklist to review your existing CSS for Carbon compliance.

### Foundations

- [ ] IBM Plex Sans loaded (body text)
- [ ] IBM Plex Mono loaded (code/mono text)
- [ ] Body font size is 14px (productive) or 16px (expressive) base
- [ ] Line heights match Carbon type scale
- [ ] Font weights are 300 / 400 / 600 (no 500, 700, 800)
- [ ] No custom font colors — using `--cds-text-*` tokens
- [ ] No raw hex colors for interactive elements — using `--cds-interactive` / `--cds-link-primary`

### Color

- [ ] Page background uses `--cds-background` (#ffffff white theme)
- [ ] Cards / panels use `--cds-layer-01` (#f4f4f4)
- [ ] Nested panels use `--cds-layer-02` (#ffffff)
- [ ] Primary actions use `--cds-interactive` (#0f62fe)
- [ ] Focus rings use `--cds-focus` (#0f62fe) with 2px solid outline
- [ ] Error states use `--cds-support-error` (#da1e28)
- [ ] Warning states use `--cds-support-warning` (#f1c21b)
- [ ] Success states use `--cds-support-success` (#198038)
- [ ] Disabled text uses `--cds-text-disabled` (#c6c6c6)
- [ ] Overlay/backdrop uses `--cds-overlay` (rgba dark)

### Spacing

- [ ] All padding/margin values map to spacing scale (multiples of 2/4/8px)
- [ ] No arbitrary spacing values like 7px, 13px, 22px
- [ ] Using spacing-03 (8px) as minimum interactive padding
- [ ] Using spacing-05 (16px) as standard component padding

### Layout

- [ ] 2x Grid applied (`cds--grid`, `cds--row`, `cds--col-*`)
- [ ] Breakpoints match Carbon breakpoints (sm 320, md 672, lg 1056, xlg 1312)
- [ ] Max content width does not exceed 1584px

### Motion

- [ ] Transitions use Carbon duration tokens (70ms–700ms)
- [ ] Easing uses Carbon cubic-bezier curves
- [ ] No instant state changes (0ms transitions) on interactive elements

### Accessibility

- [ ] Focus indicator visible (2px solid `--cds-focus` + 1px inset `--cds-focus-inset`)
- [ ] Minimum 4.5:1 contrast ratio for body text (WCAG AA)
- [ ] Minimum 3:1 contrast for large text and UI components
- [ ] Interactive elements minimum 44×44px touch target

---

## 11. Migration Notes (v10 → v11)

### Token name changes (common examples)

| v10 Token | v11 Token |
|---|---|
| `$ui-01` | `--cds-layer-01` |
| `$ui-02` | `--cds-layer-02` |
| `$ui-03` | `--cds-border-subtle-01` |
| `$ui-04` | `--cds-border-strong-01` |
| `$ui-05` | `--cds-border-inverse` |
| `$text-01` | `--cds-text-primary` |
| `$text-02` | `--cds-text-secondary` |
| `$text-03` | `--cds-text-placeholder` |
| `$text-04` | `--cds-text-on-color` |
| `$text-05` | `--cds-text-helper` |
| `$interactive-01` | `--cds-interactive` |
| `$interactive-03` | `--cds-interactive` (same) |
| `$interactive-04` | `--cds-interactive` (same) |
| `$icon-01` | `--cds-icon-primary` |
| `$icon-02` | `--cds-icon-secondary` |
| `$icon-03` | `--cds-icon-inverse` |
| `$link-01` | `--cds-link-primary` |
| `$field-01` | `--cds-field-01` (unchanged) |
| `$overlay-01` | `--cds-overlay` |
| `$danger-01` | `--cds-button-danger-primary` |
| `$danger-02` | `--cds-button-danger-secondary` |

### Type token name changes

| v10 Token | v11 Token |
|---|---|
| `$body-short-01` | `body-compact-01` |
| `$body-short-02` | `body-compact-02` |
| `$body-long-01` | `body-01` |
| `$body-long-02` | `body-02` |
| `$productive-heading-01` | `heading-compact-01` |
| `$expressive-heading-01` | `heading-01` |

### Use the compatibility theme (incremental migration)

If you can't rename all tokens at once, use the compatibility shim:

```scss
@use '@carbon/styles/scss/compat/themes' as compat;
@use '@carbon/styles/scss/compat/theme' with (
  $theme: compat.$white
);
@use '@carbon/styles';
```

This allows v10 token names (`$ui-01`, `$text-01`) to continue working alongside v11 tokens.

### Package rename

```bash
# v10 (deprecated Sept 2024)
npm uninstall carbon-components carbon-components-react

# v11
npm install @carbon/react    # React
npm install @carbon/styles   # CSS/Sass only
```

---

## Reference Links

- [Carbon Design System](https://carbondesignsystem.com)
- [Color Guidelines](https://carbondesignsystem.com/guidelines/color/overview/)
- [Typography Guidelines](https://carbondesignsystem.com/guidelines/typography/overview/)
- [Spacing Guidelines](https://carbondesignsystem.com/guidelines/spacing/)
- [Motion Guidelines](https://carbondesignsystem.com/guidelines/motion/overview/)
- [Themes Overview](https://carbondesignsystem.com/elements/themes/overview/)
- [v11 Migration Guide](https://carbondesignsystem.com/migrating/guide/overview/)
- [Carbon GitHub](https://github.com/carbon-design-system/carbon)
- [IBM Plex Typeface](https://github.com/IBM/plex)
- [Sass API Docs](https://github.com/carbon-design-system/carbon/blob/main/packages/styles/docs/sass.md)
