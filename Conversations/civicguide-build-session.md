# CivicGuide Build Session
April 15, 2026

---

## Overview

This session covers the full build of `civicguide.html` — a single-page wizard application for the CivicGuide civic assistance prototype — from planning through Gemini API integration and agent UX.

---

## Build Plan Review

Reviewed `build-plan.md`. The plan called for a fully clickable 6-phase SPA styled in Unigrid v2, with each phase as a JS-driven view swap. Architecture decision: single-file SPA with phase show/hide, not separate HTML pages. One `state {}` object drives the whole flow.

**Phases:**
1. Location — entry, geo lookup
2. Domain — 6-tile grid, auto-advance
3. Document Type — scoped dropdown + binary choice card
4. Input — upload zone (new component) or describe textarea
5. Fill — annotate expand + field hints
6. Review — review table, edit links, submit state

---

## Initial Build — `civicguide.html`

Built the complete SPA in a single file (~550 lines CSS + JS). Key decisions:

- `enterPhase(n)` as the core navigation primitive — `advance()`, `back()`, `jumpTo(n)` all call it
- All phases re-initialized on each entry (state preserved, UI rebuilt from state)
- Pre-written canned agent responses at every hint zone
- Upload zone built as a new Unigrid component (`.ug-upload-zone`) per the build plan spec
- `index.html` redirect updated from `test-entry.html` → `civicguide.html`

---

## Gemini API Integration

**Problem:** Everything was simulated — `simulateAgent()` was just a `setTimeout` with pre-written strings.

**Discovery:** The project already had full API infrastructure in place:
- `config.js` — `GEMINI_MODEL = 'gemini-2.5-flash'`, `GEMINI_PROXY_URL = '/.netlify/functions/gemini'`, full `SYSTEM_PROMPT`
- `entry.js` — `EntryStage` class using the proxy, ES module imports from `config.js`
- `netlify/functions/gemini.js` — serverless proxy, API key injected server-side
- `server.js` — local dev proxy doing the same; key loaded from `.env`

**Changes made:**
- Removed hand-rolled API key bar (HTML, CSS, JS)
- Switched `<script>` → `<script type="module">`
- Added `import { GEMINI_MODEL, GEMINI_PROXY_URL, SYSTEM_PROMPT } from './config.js'`
- Replaced `simulateAgent()` with `agentRespond(prompt, fallback, minDelay, onDone)` — calls Gemini via proxy, falls back to canned text on failure
- All calls route to `/.netlify/functions/gemini?model=gemini-2.5-flash`
- Temperature set to `0.4` to match `entry.js`
- `SYSTEM_PROMPT` from `config.js` used as base; wizard-mode context note appended per-call

**Gemini call sites:**
| Trigger | Agent prompt |
|---|---|
| Phase 1 load | Greeting |
| Phase 2 domain tile click | Domain acknowledgment |
| Phase 3 dropdown focus | Why document type matters |
| Phase 4 upload confirmed | Post-upload acknowledgment |
| Phase 4 Analyze button | "I've reviewed everything" transition |
| Phase 5 load | Intro to fill fields |
| Phase 5 annotation expand (first open) | Live section explanation with thinking dots |
| Phase 5 field `?` (first open) | Field-specific guidance |
| Phase 6 submit | What happens next |

---

## Local Dev Setup

**Problem:** 405 Method Not Allowed — was opening via VS Code Live Server, which doesn't handle `POST /.netlify/functions/gemini`.

**Fix:** Run `node server.js` and open `http://localhost:3000`. Created `.env` file with `GEMINI_API_KEY=`.

---

## Agent UX — Phase Briefs + Typewriter

**Problem:** No visible sense that an agent was working on the user's behalf. Hint zones were subtle and reactive.

**Direction chosen:** Proactive phase-level agent brief + typewriter reveal. Not a chat experience — no input field, no thread, no bubbles. The agent opens each phase with a structural dark block, then the form follows.

**What was built:**

`.agent-brief` — dark (`var(--dark)`) block at the top of every phase. Agent role badge on the left. Thinking dots while Gemini is called. Text typewriters in when response arrives.

**Role progression:**
| Phase | Agent Role |
|---|---|
| 1–2 | Router |
| 3 | Domain Expert |
| 4–5 | Document Agent |
| 6 | Security Agent |

`typewrite(el, text, speed)` — character-by-character reveal at 18ms/char. Runs on all agent text: phase briefs, domain confirmation, dropdown hint, upload acknowledgment, annotation expands, field help, post-submit next steps.

`agentBrief(phaseNum, role, prompt, fallback)` — shows thinking state immediately, calls Gemini, typewriters the result. Called at the top of every `initPhaseN()`.

---

## Security Fixes

Two issues identified and fixed:

1. **`.gitignore` missing `.env`** — API key would have been committable. Added `.env` and `*.env`.

2. **`server.js` static handler served dotfiles** — path traversal check only blocked paths *outside* the project root. A `GET /.env` request returned the key. Fixed by blocking any request path segment starting with `.`, and blocking `/server.js` directly.

```js
const segments = pathname.split('/').filter(Boolean);
if (segments.some(s => s.startsWith('.')) || pathname === '/server.js') {
  res.writeHead(403);
  res.end('Forbidden');
  return;
}
```

---

## Bug Fix — Module Scope

**Error:** `Uncaught ReferenceError: toggleAnnotate is not defined`

**Cause:** `<script type="module">` scopes all declarations — inline `onclick` attributes in HTML can't reach them.

**Fix:** Expose the three functions used by inline handlers on `window` before boot:

```js
window.back           = back;
window.jumpTo         = jumpTo;
window.toggleAnnotate = toggleAnnotate;
```

Same issue would have affected `back()` and `jumpTo()` on the next interaction.

---

## Files Modified This Session

| File | Change |
|---|---|
| `civicguide.html` | Created — full 6-phase SPA |
| `index.html` | Redirect updated to `civicguide.html` |
| `server.js` | Dotfile and server source blocking added |
| `.gitignore` | `.env` and `*.env` added |
| `.env` | Created (not committed) |

---

## Files Referenced (Unchanged)

| File | Role |
|---|---|
| `config.js` | Gemini model, proxy URL, system prompt |
| `entry.js` | EntryStage class, proxy pattern reference |
| `netlify/functions/gemini.js` | Serverless proxy (production) |
| `Guidelines/unigrid-v2.md` | Design system — all component CSS |
| `build-plan.md` | Phase specs, architecture decisions |
