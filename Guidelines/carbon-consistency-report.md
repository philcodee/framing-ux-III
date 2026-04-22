# CivicGuide — Carbon Design System Consistency Report
_Audited against Carbon v11 White Theme / G90 Dark Theme. April 2026._

---

## Summary

The token layer is solid — all colors, spacing, and typography reference `--cds-*` variables correctly. The main gaps are in component-level patterns: one button variant is mis-classified, raw RGBA values appear in three places, the dark theme is missing two token overrides, and several inline `style` attributes bypass the spacing system entirely.

| Severity | Count |
|---|---|
| High | 4 |
| Medium | 5 |
| Low / intentional custom | 6 |

---

## High Priority

### 1. `.ug-back-btn` doesn't match any Carbon button variant

**Current:** transparent background, `1px solid var(--cds-button-secondary)` border (#393939), `--cds-text-primary` text color.

**Carbon patterns:**
- **Secondary** — dark fill (`#393939` bg), white text, no border
- **Tertiary** — transparent bg, `--cds-interactive` border, `--cds-interactive` text
- **Ghost** — transparent bg, no border, `--cds-interactive` text

The current style is a hybrid that doesn't match any of these. The closest match is **tertiary**. Fix: change border and text to `--cds-interactive`.

```css
.ug-back-btn {
  border: 1px solid var(--cds-interactive);
  color: var(--cds-interactive);
}
.ug-back-btn:hover {
  background: var(--cds-highlight);
  border-color: var(--cds-interactive);
}
```

---

### 2. Raw RGBA values used instead of tokens (3 locations)

`.stage-pill`, `.theme-toggle`, and `.agent-role-badge` all use `rgba(244, 244, 244, 0.25)` for borders and `rgba(244, 244, 244, 0.1)` for hover backgrounds on the inverse surface. These are hardcoded values outside the token system.

Carbon's inverse surface border token is `--cds-border-inverse` (#161616 on white, #f4f4f4 on dark). For a subtle border on an inverse background, the convention is to use a semi-transparent form of `--cds-text-inverse`. Define a custom property for this rather than repeating the raw value:

```css
:root {
  --cds-border-inverse-subtle: rgba(244, 244, 244, 0.25);
  --cds-background-inverse-hover: rgba(244, 244, 244, 0.1);
}
```

Then replace all three hardcoded instances with these tokens.

---

### 3. Dark theme missing `--cds-support-success` G90 override

The white theme sets `--cds-support-success: #198038`. Carbon's G90 dark theme changes this to `#42be65` for legibility on dark backgrounds. The status dot's "ready" state uses this token. On dark mode it currently renders the white-theme green, which fails WCAG AA contrast against `#161616`.

Add to `[data-theme="dark"]`:
```css
--cds-support-success: #42be65;
```

---

### 4. `.fill-sensitive` tag missing background fill

The sensitive field badge uses `border: 1px solid var(--cds-support-error)` with no background. Carbon's error Tag component pairs the border with a tinted background (`--cds-support-error-bg`, already defined as `#fff1f1` in the token set). Without the fill, the badge has insufficient visual weight and the border-only style doesn't match Carbon's tag pattern.

```css
.fill-sensitive {
  background: var(--cds-support-error-bg);
}
```

---

## Medium Priority

### 5. Inline `style` attributes bypass the spacing system

Three locations in the HTML use hardcoded pixel values directly:

| Location | Raw value | Should be |
|---|---|---|
| Profile screen button row | `gap: 10px` | `gap: var(--sp-03)` (8px) or `var(--sp-04)` (12px) — 10px is off-scale |
| Profile screen button row | `margin-top: 8px` | `margin-top: var(--sp-03)` |
| Restore screen button row | `gap: 12px` | `gap: var(--sp-04)` |

These should be moved into named CSS classes so the spacing system is consistently applied.

---

### 6. Primary button missing `min-width`

Carbon's primary button spec requires a minimum width of `16rem` (256px) at 48px height to prevent very short button text from producing a cramped target. Currently unset.

```css
.ug-confirm-btn {
  min-width: 16rem;
}
```

---

### 7. `.ug-review-edit` missing `text-decoration` spec

Carbon inline link buttons show `text-decoration: none` by default and `text-decoration: underline` on hover. Currently neither is set, leaving it to browser defaults (which vary).

```css
.ug-review-edit          { text-decoration: none; }
.ug-review-edit:hover    { text-decoration: underline; }
```

---

### 8. Review table column width is a hardcoded pixel value

`.ug-review td:first-child { width: 160px }` — 160px is not in the Carbon spacing scale. The nearest token equivalent is `10rem`, which is also not a named spacing token. Options: use `10rem` (same visual result, rem-relative) or `var(--sp-10)` (64px, likely too narrow). `10rem` is the cleanest fix.

---

### 9. `body` element missing explicit `line-height`

Carbon sets body line-height to match `body-compact-01` (18px / 1.125rem) for product UIs. The body element currently sets `font-size` but no `line-height`, leaving it at the browser default (typically 1.2–1.5).

```css
body {
  line-height: 1.125rem; /* body-compact-01 */
}
```

---

## Low Priority / Intentional Custom Patterns

These components have no direct Carbon equivalent and are acceptable as custom patterns, as long as they use Carbon tokens internally (which they do).

| Component | Notes |
|---|---|
| **Stage Track** | Carbon's Progress Indicator is a horizontal step component, but the current tab-style track is a reasonable product-specific variant. Token usage is correct. |
| **Upload Zone** | Carbon's FileUploader is a different visual pattern (button-triggered). The drag-drop zone is a valid custom component. |
| **Signature Canvas** | No Carbon equivalent. `background: var(--cds-background)` and border token usage are correct. |
| **Status Dot** | No Carbon equivalent. Uses correct `--cds-interactive` and `--cds-support-success` tokens. Fix #3 above applies. |
| **Agent Brief** | No Carbon equivalent. Inverse surface usage and text tokens are correct. |
| **Scan Summary** | Left-border notification is close to Carbon's Inline Notification pattern but simplified. Acceptable. |

---

## Checklist Summary

- [ ] Fix `.ug-back-btn` to match Carbon tertiary button (border + text → `--cds-interactive`)
- [ ] Replace 3× raw RGBA values with named custom properties
- [ ] Add `--cds-support-success: #42be65` to dark theme overrides
- [ ] Add `background: var(--cds-support-error-bg)` to `.fill-sensitive`
- [ ] Move inline `style` spacing into CSS classes using spacing tokens
- [ ] Add `min-width: 16rem` to `.ug-confirm-btn`
- [ ] Add `text-decoration` states to `.ug-review-edit`
- [ ] Change `width: 160px` to `width: 10rem` on review label column
- [ ] Add `line-height: 1.125rem` to `body`
