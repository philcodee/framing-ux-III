# CivicGuide — PDF Functionality (LLM Context Document)

*As of commit 2b76bf1 — April 23, 2026*

This document describes the PDF-related functionality in CivicGuide for use as LLM context. URLs, CDN addresses, and API endpoints have been omitted intentionally.

---

## Overview

CivicGuide handles PDFs in two directions: reading a government PDF that the user uploads, and exporting a filled-out summary as a PDF. These sit at opposite ends of a 5-phase flow: Upload → Scan → Fill → Review → Export.

---

## Phase 1 — Upload

The upload zone accepts both PDFs and image files via drag-and-drop or a file picker. A 4 MB size cap is enforced client-side. The selected file is stored in application state as `state.file`. No network request is made at this stage.

---

## Phase 2 — Scan (two code paths)

When the user advances from Upload, the app decides how to analyze the document. For PDFs, it tries Path A first and falls back to Path B if Path A yields nothing.

### Path A: AcroForm Extraction

**Trigger condition:** The file is a PDF and no previously uploaded file reference exists in state.

**Mechanism:** A PDF parsing library is loaded dynamically at runtime. It reads the file as a binary buffer, iterates every page, and collects all Widget-type annotations — these are the interactive form fields in a fillable PDF. For each unique field name, the following properties are extracted:

- **id** — the raw field name from the PDF spec
- **label** — the field's alternative text if present; otherwise the field name is cleaned up (camelCase split, underscores/dots replaced with spaces)
- **value** — any value already stored in the field (e.g., a partially filled PDF)
- **type** — one of `text`, `checkbox`, or `signature`
- **sensitive** — boolean flag, set by matching the field id against a regex for patterns like SSN, password, PIN, and account number

Fields with duplicate names are deduplicated. If no fields are found (the PDF is scanned/non-fillable), the function returns null and the app falls through to Path B.

**AI call (text-only):** When fields are found, the app makes a text-only AI call — no image or file data is sent. The prompt provides the list of extracted field IDs and asks the model to return a JSON object with:

- `domain` — one of 7 civic categories (DMV, Housing, Social Security, etc.)
- `docType` — a short human-readable form name
- `summary` — one sentence describing the form
- `prefill` — a map of field IDs to suggested values drawn from the user's saved profile (name, location); sensitive fields are excluded from prefill
- `sections` — a map of field IDs to logical group names (e.g., "Personal Information", "Address", "Employment")

A lightweight AI model is used for this call with a low token budget (512 tokens), since it is text-only and structured.

**State written:** `state.fields`, `state.values`, `state.domain`, `state.docType`, `state.scanSummary`, and a `section` property on each field object.

---

### Path B: Multimodal Vision Scan

**Trigger condition:** The file is an image, or the PDF had no AcroForm fields, or a prior session's file reference is being resumed.

**Mechanism:** The file is converted to base64 and uploaded to the AI provider's file storage API. The returned file reference URI is stored in state and persisted to the database so the session can be resumed later without re-uploading.

The AI call sends the file reference along with a system instruction requesting a complete JSON response in the following shape:

```
{
  "domain": one of 7 civic categories,
  "docType": short form name,
  "summary": 2-3 sentence plain description,
  "fields": [
    {
      "id": camelCase identifier,
      "label": human-readable label,
      "value": pre-filled value from document or profile if applicable,
      "type": text | date | signature | checkbox,
      "sensitive": true | false,
      "section": logical group name
    }
  ]
}
```

The system instruction includes the user's profile data (name, location) if available, and the user's civic domain history as a classification hint. Administrative fields and pre-printed static text are explicitly excluded.

A larger token budget (16,384 tokens) is used here because the model must interpret the visual content of the document.

**Retry logic:** If the AI service returns an overloaded signal, the app retries up to 3 more times with increasing delays (approximately 8, 20, and 40 seconds). After all retries are exhausted, the user sees an error with a manual retry button.

---

## Phase 3 — Fill

Fields extracted in Phase 2 are rendered as an editable form. Values pre-filled by the AI or from AcroForm data are shown; the user reviews and completes the rest.

## Phase 4 — Review

All field/value pairs are shown in a read-only review table. The user can click any field to edit it inline before proceeding.

---

## Phase 5 — Export

The export step generates a PDF summary using the browser's native print dialog — no client-side PDF library is used.

**Mechanism (`exportToPDF`):**

1. An HTML document is constructed in memory as a string.
2. A new browser window is opened.
3. The HTML is written into that window.
4. A script embedded in that HTML calls `window.print()` on load, immediately triggering the browser's print dialog.
5. The user chooses "Save as PDF" in the dialog.

**Content of the generated HTML:**

- A header containing the document type, civic domain, and one-sentence summary
- A two-column table: field labels on the left (small, gray), user-entered values on the right
  - Signature fields whose value is a base64 image string are rendered as an inline image (max 240px wide)
  - Empty fields display a gray em-dash placeholder
- A footer with a disclaimer to verify the submission through official government channels
- A print media query that removes body padding in print mode
- A web font (IBM Plex Sans) referenced from an external font service — requires internet access at print time; falls back to system sans-serif fonts if unavailable

**Error handling:** If the browser blocks the popup, the function throws and the export button resets to an error state with a retry option.

**Side effect:** When Phase 5 is entered, if the user is logged in and the current document's domain is not already in their saved domain history, it is appended to their profile in the database.

---

## Known Limitations

**Export popup dependency:** The entire export flow depends on `window.open` succeeding. If the browser blocks popups, there is no fallback — the user sees an error and must unblock popups manually.

**Export font dependency:** The print window loads a web font at render time. In offline environments or if the font service is unavailable, the document falls back to Helvetica/Arial.

**No programmatic PDF generation:** Because export relies on the browser print dialog, the user controls the filename, page margins, and paper size. The app cannot guarantee consistent output across browsers or operating systems.

**AcroForm path bypasses vision entirely:** When a PDF has AcroForm fields, the AI never sees the document visually. Field label quality depends entirely on how well the PDF's metadata (`alternativeText`) was authored — which varies widely across government documents.

**Sensitive field detection is heuristic:** The regex used to flag sensitive fields matches on field ID strings only. Non-standard naming conventions (e.g., a field named `tin` for a tax identification number) will not be caught.

**4 MB file size cap:** Large or high-resolution scanned PDFs may exceed the limit and cannot be uploaded.
