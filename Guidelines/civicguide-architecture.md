# CivicGuide — wizard architecture

## Stages

```
1. ENTRY       → location + domain selection
2. UPLOAD      → document drop or manual entry choice
3. SCAN        → OCR / parse (agent-side, progress indicator only)
4. ANNOTATE    → document view + plain-language overlays, section by section
5. FORM        → simplified form, pre-filled from scan, user completes gaps
6. REVIEW      → full summary, PII warnings, edit affordances
7. EXPORT      → download submission-ready PDF or hand-off link
```

## Agent-to-stage map

| Stage    | Active agent    |
|----------|-----------------|
| Entry    | Router          |
| Upload   | Router          |
| Scan     | Document Agent  |
| Annotate | Document Agent + Domain Expert |
| Form     | Domain Expert   |
| Review   | Security Agent  |
| Export   | Document Agent  |

## Screen anatomy (every stage)

```
┌─────────────────────────────────────────┐
│  Progress rail   [1]─[2]─[3]─[4]─[5]   │  ← named stages, not %
├─────────────────────────────────────────┤
│                                         │
│  Stage content (single focus per view)  │
│                                         │
├─────────────────────────────────────────┤
│  [Back]                      [Continue] │
└─────────────────────────────────────────┘
```

## Key components

- `StageShell` — wraps every stage; owns progress rail + nav buttons
- `DocumentViewer` — renders uploaded doc with annotation layer (stages 4–5)
- `AnnotationOverlay` — plain-language tooltips pinned to document regions
- `SimplifiedForm` — generated field-by-field from document scan
- `PIIWarning` — inline flag on any field touching sensitive data
- `AgentStatus` — subtle background indicator (scanning / thinking / ready)

## State shape (minimal)

```js
{
  location: string,
  domain: string,
  stage: 1–7,
  document: { raw, parsed, chunks[] },
  form: { fields[], completed[], flagged[] },
  agent: 'router' | 'document' | 'domain' | 'security'
}
```

## Routing rules

- Stage advances only on explicit user action (no auto-advance)
- Back is always available except during Scan
- Any stage can surface a "explain this" overlay without leaving the stage
- Human escalation exits the wizard and opens a contact view
