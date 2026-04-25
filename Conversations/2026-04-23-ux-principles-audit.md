# UX Principles Audit — Session April 23, 2026

How today's changes map to five core agentic UX principles.

---

## Latency Tolerance
*Does the user know it's working?*

**What we changed:**
- Export button now shows "Generating…" and disables while the PDF is being assembled (canvas render + jsPDF). Re-enables on completion or failure.
- The AcroForm Gemini call now runs at 6000 tokens instead of 512 — meaningfully longer. The existing Phase 2 dot-pulse thinking indicator covers this, but the user has no signal that the longer call is due to a richer analysis rather than slowness.

**Gap still open:**
- No indication of what Phase 2 is doing during the longer indexed call (just the same generic dots). A line like "Reading your form and cleaning up field labels…" during AcroForm analysis would set better expectations.
- The on-demand field explainer (next session) will need its own inline loading state scoped to the individual field — not the global status dot.

---

## Capability Discovery
*Does a new user know what it can/can't do?*

**What we changed:**
- `tip` field added to Phase 2 scan — surfaces one practical sentence about the form before the user starts filling (e.g. "Have your driver's license, vehicle title, and proof of insurance ready"). This is implicit capability signalling: it shows the system understands the specific form, not just a generic PDF.
- Section headings in Phase 3 communicate structure: the user can see the full shape of the form before they're done with it.
- Skipping administrative/office-use fields reduces noise and implicitly tells the user "we've filtered out what you don't need to touch."

**Gap still open:**
- No explicit communication that the system recognises the specific form (MV-82) and has enriched its output accordingly. Users have no way to know whether the labels and hints came from the PDF text or from Gemini's knowledge.
- The right-click field explainer (next session) will be a direct capability discovery surface — a user who stumbles on it will realise the system can answer questions, not just display fields.

---

## Trust Calibration
*Can the user tell when to trust vs. verify output?*

**What we changed:**
- Hints now carry format requirements and document references (e.g. "Enter as it appears on your vehicle title") — these give the user a way to independently verify what they've entered rather than just accepting the label at face value.
- Pre-filled values from user profile are surfaced in the filled state (blue border + label) — the user can see at a glance what was pre-populated and what they filled themselves.
- Export PDF footer retains the disclaimer: "Always verify your final submission through official government channels."
- `skip` filtering removes fields the user shouldn't touch — reduces the chance of accidentally filling an office-use field incorrectly.

**Gap still open:**
- No distinction between hints sourced from Gemini's form knowledge vs. hints inferred from field label text alone. A user has no way to know how confident the system is in a given hint.
- The field explainer (next session) is the natural place to add epistemic hedging: "Based on my knowledge of the MV-82 form, this field is asking for…" with an explicit note to verify against the official instructions.

---

## Transparency
*Does the user understand why it said that?*

**What we changed:**
- Section groupings are now visible as named headings — the user can see how the system has interpreted and organised the form, rather than receiving a flat undifferentiated list.
- Labels are now shortened and human-readable; the original verbose field ID is preserved in `field.id` but not shown. This is a transparency trade-off: cleaner UX, but the user can no longer see the raw field name the label was derived from.
- `tip` and `hints` make Gemini's reasoning visible inline — the user sees why a field matters or what format it expects, not just a bare input.

**Gap still open:**
- No attribution on the tip or hints ("Gemini suggested this based on its knowledge of the MV-82 form"). It reads as authoritative system text.
- The planned right-click explainer is the most direct transparency feature on the roadmap: on-demand visibility into what a field is, why it exists, and what counts as a correct answer.

---

## Memory Awareness
*Does the user know what the agent remembers or forgets?*

**What we changed:**
- Nothing directly today. The existing "Progress saved — you can close this and come back later" note in Phase 2 remains the only memory surface.
- `state.tip` is cleared on `startOver()` — memory is reset correctly on a new session, but this is invisible to the user.

**Gap still open:**
- The user has no visibility into what their profile contains (name, location, domain history) or that it was used to pre-fill fields.
- When the AcroForm path pre-fills from profile, the blue "filled" state signals that a value is present, but not *why* it was pre-filled or where it came from.
- A lightweight "We pre-filled 3 fields from your profile" note at the top of Phase 3 would close this gap without requiring a dedicated memory UI.
