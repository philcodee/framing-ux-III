# CivicGuide — UX rationale & Gemini integration pattern

> Companion to `civicguide-architecture.md`

---

## Why not chat

Chat puts the burden of articulation on the user. CivicGuide's users arrive confused, often with a document they don't understand, in a civic domain they rarely navigate. Asking them to type is the wrong starting point.

A form-based wizard:
- Removes the blank input problem — every screen offers only valid choices
- Makes progress legible — users see where they are and what remains
- Keeps the agent invisible — Gemini responds to selections, not conversations
- Reduces error surface — structured inputs produce structured state, no parsing required

---

## How Gemini's role shifts

In a chat UI, the agent **asks questions**. In a wizard, the agent **reacts to answers**.

The user never sees a query. They see a UI component. When they interact with it, a pre-formed message is constructed and passed to Gemini silently. The agent's response surfaces as contextual help text — not a bubble.

```js
// User selects "DMV" from the domain grid
const msg = `User selected domain: DMV. Location: ${location}. 
Respond with one calm sentence describing what you can help with.`;

stage.send(msg); // existing EntryStage.send() — unchanged
```

`onMessage` writes into a hint zone beneath the active component, not a chat thread:

```js
stage.onMessage = (text) => {
  document.getElementById('agent-hint').textContent = text;
};
```

---

## Component-to-query map

| Stage | Chat query replaced by | Component |
|-------|----------------------|-----------|
| Entry | "What's your location?" | Text input + geolocation button |
| Entry | "Which civic domain?" | Button grid (Parks, DMV, Streets, Welfare…) |
| Upload | "Do you have a document?" | Two-option card (Upload / Describe it) |
| Upload | "What type of document?" | Dropdown, scoped by domain selection |
| Annotate | "What does this section mean?" | Inline expand — agent hint appears on tap |
| Form | "What should I put here?" | Field-level help icon — triggers agent hint |
| Review | "Is this correct?" | Summary card with explicit confirm button |

---

## Gemini model recommendation

| Agent | Model | Reason |
|-------|-------|--------|
| Router | `gemini-3-flash-preview` | Fast, cheap — location + domain routing only |
| Document Agent | `gemini-3-flash-preview` | Native PDF + image input for Scan stage |
| Domain Expert | `gemini-3-flash-preview` | Consistent model, simpler config |
| Security Agent | Inline logic only | No LLM needed — PII flagging is rule-based |

Single model across all agents keeps `config.js` simple and avoids latency differences between stages.

---

## State handoff pattern

Each stage writes confirmed values to shared state. Gemini is only called when a stage completes — not on every keystroke or selection.

```js
// StageShell wires each stage's onComplete to advance state
entryStage.onComplete = ({ location, domain }) => {
  state.location = location;
  state.domain = domain;
  shell.advance(); // moves to stage 2
};
```

The agent hint calls during a stage are low-stakes — short, contextual, disposable. The `onComplete` call is the meaningful one.

---

## API key note

As flagged in session 01 — the key is currently plaintext in `config.js`. Before any non-local use, proxy all Gemini calls through a lightweight server route so the key is never exposed to the client.

---

> See `civicguide-architecture.md` for stage breakdown, component list, and full state shape.
