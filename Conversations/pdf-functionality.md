# CivicGuide — PDF Functionality State Document

*As of commit `2b76bf1` — April 23, 2026*

---

## Overview

CivicGuide supports two PDF-related capabilities: **reading** a government PDF that a user uploads, and **exporting** a filled-out summary as a PDF. These are handled at opposite ends of the 5-phase flow (Upload → Scan → Fill → Review → Export).

---

## 1. PDF Input — Upload Phase (Phase 1)

The file input (`<input accept=".pdf,image/*">`) accepts both PDFs and images through drag-and-drop or click-to-browse. A hard 4 MB size cap is enforced client-side before the file is stored in `state.file`. No server upload happens at this stage.

---

## 2. PDF Reading — Scan Phase (Phase 2)

Phase 2 has two separate code paths for PDFs, executed in priority order.

### Path A: AcroForm Extraction (PDF.js)

**When it runs:** The uploaded file is a PDF (`file.type === 'application/pdf'`) and no Gemini `fileUri` already exists for this session.

**How it works (`extractAcroFields`, line 1495):**

PDF.js v4.0.379 is dynamically imported from the Cloudflare CDN. The library reads the PDF as an `ArrayBuffer`, iterates every page, and collects all Widget annotations (the spec type for form fields). For each unique `fieldName`:

| Property extracted | Source |
|---|---|
| `id` | `annot.fieldName` |
| `label` | `annot.alternativeText`, or the `fieldName` with camelCase/separator cleanup |
| `value` | `annot.fieldValue` (pre-existing fill if the PDF had saved data) |
| `type` | `'signature'` if `fieldType === 'Sig'`; `'checkbox'` if `checkBox` or `radioButton`; else `'text'` |
| `sensitive` | regex on the `id`: `/ssn|social.?sec|password|pin\b|account.?num/i` |

Fields are deduplicated by `fieldName`. If no fields are found (e.g., a scanned/non-fillable PDF), the function returns `null` and falls through to Path B.

**AI call after AcroForm extraction:**

If fields are found, the app does a **text-only** Gemini call (no image data sent) to classify the form. The prompt sends the list of field IDs and asks for a JSON response containing:

- `domain` — one of 7 civic categories
- `docType` — short human-readable form name
- `summary` — one sentence
- `prefill` — map of `fieldId → value` derived from the user's saved profile (name, location); sensitive fields excluded
- `sections` — map of `fieldId → logical group name` (e.g., "Personal Information", "Address", "Vehicle")

Model: `gemini-2.5-flash-lite`, `maxTokens: 512`

**State written:** `state.fields`, `state.values`, `state.domain`, `state.docType`, `state.scanSummary`, and `f.section` on each field object.

### Path B: Multimodal Vision Scan (Gemini)

**When it runs:** The file is an image, or the PDF has no AcroForm fields, or a prior session's Gemini `fileUri` was restored.

**How it works:**

The file is converted to base64 and uploaded to the Gemini Files API (`uploadFileToGemini`). The resulting `fileUri` is stored in state and persisted to Supabase so the session can be resumed without re-uploading.

The Gemini call sends the file reference alongside a system instruction (`buildScanInstruction`, line 1195) that requests a full JSON object:

```json
{
  "domain": "...",
  "docType": "...",
  "summary": "...",
  "fields": [
    { "id", "label", "value", "type", "sensitive", "section" }
  ]
}
```

The instruction includes user profile data (name, location) if available, and the user's `domain_history` as a classification hint. Administrative or static-text fields are explicitly excluded.

Model: `GEMINI_MODEL` (configured in `config.js`), `maxTokens: 16384`

**Retry logic:** Up to 4 attempts with progressive delays `[0, 8, 20, 40]` seconds when Gemini returns an overloaded signal. If all attempts fail, a "Try again" button is shown to the user.

---

## 3. PDF Output — Export Phase (Phase 5)

The export button calls `exportToPDF()` (line 1968). There is no client-side PDF library (no jsPDF, no pdfmake). Instead, the function:

1. Builds a complete HTML document string in memory.
2. Opens it in a new browser window via `window.open('', '_blank')`.
3. Writes the HTML to that window with `win.document.write()`.
4. A `window.onload` handler in the injected HTML immediately calls `window.print()`, triggering the browser's native print dialog.

The user then uses the browser's "Save as PDF" option in the print dialog.

**HTML structure of the generated document:**

- **Header:** Document title (`state.docType`), domain (`state.domain`), and the one-sentence summary (`state.scanSummary`).
- **Table:** Two-column table — left column is the field label (11px, gray), right column is the value.
  - If a field's `value` starts with `data:image` and the type is `'signature'`, an `<img>` tag is rendered instead of text (max-width 240px).
  - Empty fields display an em-dash in `#a8a8a8`.
- **Footer:** "CivicGuide • Always verify your final submission through official government channels."
- **Font:** IBM Plex Sans loaded from Google Fonts (requires internet at print time).
- **Print media query:** `body { padding: 0; }` removes the 40px padding in print mode.

**Error handling:** If `window.open` returns null (popup blocked by the browser), the function throws, the button resets to "Export failed — try again", and the user can retry.

**Domain history side effect:** On entering Phase 5, if the user is logged in and the current `state.domain` is not already in their `domain_history` profile field, it is appended via a Supabase `updateProfile` call.

---

## Summary of Gaps / Known Limitations

| Issue | Notes |
|---|---|
| Export requires popups unblocked | `window.open` will fail silently if the browser blocks popups; no fallback |
| Export requires internet at print time | IBM Plex Sans is loaded from Google Fonts in the print window; offline use will fall back to Helvetica/Arial |
| No true PDF generation | The "Download PDF" flow is entirely the browser print dialog — the file is not generated programmatically, so the user controls the final filename and page settings |
| AcroForm path skips vision entirely | For well-structured government PDFs, Gemini never sees the document image; field labels rely on `alternativeText` metadata quality, which varies widely across government PDFs |
| Sensitive field detection is regex-only | The pattern `/ssn|social.?sec|password|pin\b|account.?num/i` on the field ID may miss non-standard naming conventions |
