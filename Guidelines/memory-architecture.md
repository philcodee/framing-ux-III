# CivicGuide Memory Architecture

## Overview

CivicGuide stores user data across three layers: the browser (in-memory session state), a cloud database (Supabase), and the AI context window (system prompt injection). Each layer serves a different purpose and operates at a different scope.

---

## Layer 1 — Browser Session State (in-memory)

**What:** The active wizard state while a user is filling out a form.

**Where:** JavaScript variables in `civicguide.html`. Nothing is written to `localStorage` or `sessionStorage` — state lives only as long as the page is open.

**Why:** The form wizard is a single-session task. Persisting mid-fill state to the server adds complexity before it adds value. This layer is intentionally ephemeral.

**What it holds:**
- The uploaded document (base64 blob for Gemini)
- Gemini's scan result (domain, docType, summary, fields array)
- The user's answers as they fill in fields
- Current phase and field index (which step the wizard is on)
- The authenticated user's session and profile

---

## Layer 2 — Supabase Database (persistent, cloud)

### `profiles` table — User identity and history

**What:** One row per authenticated user. Stores who the user is and a history of what civic domains they've engaged with.

**Why:** Location pre-fills state-specific fields on forms. Domain history will eventually personalize the AI's guidance (see Layer 3 below).

### `saved_forms` table — In-progress form state *(built 2026-04-20)*

**What:** A saved snapshot of a form mid-completion — the document type, the answers filled so far, and the current wizard position.

**Why:** Users filling out government forms often need to stop and come back. This table lets the app restore exactly where they left off.

---

## Layer 3 — AI Context Injection (system prompt) *(planned, not yet built)*

**What:** Before each Gemini API call, the user's `domain_history` from their profile will be injected into the system prompt so the AI knows which civic areas this user has dealt with before.

**Where:** In `netlify/functions/gemini.js`, the proxy that wraps Gemini API calls.

**Why:** An AI that knows you've previously filed a Parks permit or a DMV renewal can skip re-explaining the basics and give more targeted help. The domain history is the mechanism for that continuity.

---

## Memory Schema (JSON)

### `profiles` row

```json
{
  "id": "uuid",
  "name": "string | null",
  "location": "string | null",
  "domain_history": ["DMV", "Parks & Recreation"],
  "created_at": "ISO 8601 timestamp"
}
```

`domain_history` is a JSON array of strings appended to each time the user completes a form in a new civic domain.

---

### `saved_forms` row *(planned)*

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "domain": "string",
  "doc_type": "string",
  "stage": "fill | review",
  "form_state": {
    "fields": [
      {
        "label": "string",
        "value": "string",
        "type": "text | date | signature | checkbox"
      }
    ],
    "current_field_index": 0,
    "scan_result": {
      "domain": "string",
      "docType": "string",
      "summary": "string"
    }
  },
  "updated_at": "ISO 8601 timestamp"
}
```

`form_state` is a JSONB blob — the full wizard snapshot needed to restore the session.

---

## System Prompt Injection (planned)

When built, the Netlify function will merge profile context into the system prompt before forwarding to Gemini:

```json
{
  "system": "You are CivicGuide... [base prompt]\n\nUSER CONTEXT:\nLocation: California\nPast domains: DMV, Parks & Recreation",
  "contents": [{ "role": "user", "parts": [...] }]
}
```

This is the bridge between the persistent database layer and the AI layer — turning stored history into active, personalized guidance.

---

## Summary Table

| Layer | What | Where | Scope | Built? |
|---|---|---|---|---|
| Browser session | Active form + wizard state | JS variables in `civicguide.html` | Single page load | Yes |
| `profiles` | Identity, location, domain history | Supabase | Permanent, per user | Yes |
| `saved_forms` | Mid-fill form snapshots | Supabase | Permanent, per form | Yes (2026-04-20) |
| System prompt injection | Domain history → AI context | Netlify function | Per API call | **Planned** |
