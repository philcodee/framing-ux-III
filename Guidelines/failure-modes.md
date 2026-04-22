# CivicGuide — Agent Failure Modes & Recovery Strategies

## Most Common Failures

---

### 1. Gemini API Returns a Non-JSON or Malformed Response

**What happens:** The scan step expects a structured JSON object (`domain`, `docType`, `summary`, `fields[]`). Gemini occasionally returns prose, partial JSON, or wraps the JSON in markdown fences.

**Impact:** The wizard cannot advance past the Scan phase. The user is blocked.

**Recovery:**
- Strip markdown fences (` ```json ... ``` `) before parsing.
- If `JSON.parse` throws, show the user a "Couldn't read this document — try again" message and keep the Upload button active.
- Retry is valid here: the same document often parses cleanly on a second attempt.
- Do not attempt to partially hydrate the `fields[]` array from a broken response — it causes silent downstream errors in the Fill phase.

---

### 2. Gemini API 503 / Timeout

**What happens:** The model is overloaded or the request takes too long. This happened consistently with `gemini-2.5-flash` during development.

**Impact:** The Scan step stalls. If unhandled, the spinner spins forever.

**Recovery:**
- Retry up to 4 times with exponential backoff: 0s / 2s / 4s / 8s. *(Already implemented.)*
- After 4 failures, surface a plain error: "The AI is busy right now. Please try again in a moment."
- Keep the document in memory so the user doesn't have to re-upload.
- If a specific model is consistently 503ing, the fallback model order is: `gemini-2.5-pro` → `gemini-2.5-flash`.

---

### 3. Session Expired Mid-Fill

**What happens:** Supabase sessions have a limited lifetime. A user who starts a form, steps away, and returns may find their session silently invalidated. The next Supabase call fails with an auth error.

**Impact:** Profile pre-fill fails, and any future save-to-database calls (once `saved_forms` is built) will be rejected by RLS.

**Recovery:**
- On any Supabase auth error, call `supabase.auth.getSession()` to check whether the session is still valid.
- If the session is gone, redirect to the magic link screen with a message: "Your session timed out — enter your email to pick up where you left off."
- Once `saved_forms` is built, a re-authenticated user can restore their in-progress form by `user_id` + most recent `updated_at`.

---

### 4. Form State Lost on Page Refresh

**What happens:** All wizard state lives in JavaScript variables. A refresh — accidental or intentional — wipes the current form, uploaded document, and filled answers.

**Impact:** The user has to start over entirely.

**Recovery (current):** None. The user restarts.

**Recovery (once `saved_forms` is built):**
- Auto-save `form_state` to Supabase after each field is confirmed (not just on phase transitions).
- On page load, check for an incomplete `saved_forms` row for the current user. If found, offer: "You have an unfinished [docType] — pick up where you left off?"
- Keep a local `sessionStorage` fallback for anonymous/unauthenticated users who don't have a Supabase row to restore from.

---

### 5. Document Upload Fails Silently

**What happens:** The file is too large (>4MB), is a format Gemini can't read, or the FileReader API fails. If the error isn't surfaced, the user sees nothing happen.

**Impact:** The user is stuck on the Upload phase with no feedback.

**Recovery:**
- Validate file size and MIME type (`application/pdf`, `image/*`) before sending to Gemini.
- Show a specific message for each case: "File must be under 4MB" or "Only PDFs and images are supported."
- If the FileReader itself errors, catch it and show: "Couldn't read this file — try a different format."

---

### 6. Profile Missing or Incomplete

**What happens:** The user skips the profile screen (it's skippable), so `name` and `location` are null. Fields that would normally be pre-filled from the profile are left blank.

**Impact:** Minor UX degradation — the user has to fill in their own name/state manually.

**Recovery:**
- Treat null profile fields as empty pre-fills, not errors. The Fill phase should degrade gracefully.
- On the profile screen, make the "skip" path explicit so users understand the tradeoff.
- Once domain history injection is built, a missing location means the system prompt omits location context — the AI should then ask for location rather than assume.

---

## Edge Cases (brief)

| Failure | Notes |
|---|---|
| Gemini returns fields array as empty `[]` | Show "No fillable fields found" and let the user decide whether to proceed or re-upload. |
| Signature canvas not supported (older mobile browsers) | Fall back to a text input for signature fields; note it won't be rendered as a true signature. |
| Magic link clicked twice or after expiry | Supabase returns an error — catch it and re-show the email input with "This link has expired." |
| Two tabs open with same session | Last write wins in Supabase. No active conflict resolution needed at current scale. |
| RLS policy rejects a write | Log the error, show a generic "Couldn't save your progress" message, and keep the session alive so the user can still finish and export. |
| Netlify function cold start on first Gemini call | First request may take 2–3s longer. No recovery needed — just expected latency. |
