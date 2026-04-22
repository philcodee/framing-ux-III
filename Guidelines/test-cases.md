# CivicGuide — Test Cases & Design Principles

## Problem Definition

Government forms are designed for compliance, not for people. They use legal language, assume prior knowledge, and offer no help when users get stuck. CivicGuide's job is to sit between the user and the form — reading the document, translating it into plain language, pre-filling what it can, and walking the user through the rest one small step at a time.

The core risk is trust. Users are sharing sensitive documents in a civic context. If the AI misreads a form, fills in a wrong value, or behaves unpredictably, users may submit incorrect information to a government agency. Every test case below is ultimately asking: does the system earn and maintain the user's trust?

---

## Solution Approach

CivicGuide uses a five-phase linear wizard (Upload → Scan → Fill → Review → Export) with a human confirmation gate after the AI scan. The AI never writes directly to a form — it proposes, and the user confirms. Profile data (name, location) is used to pre-fill fields, but the user always sees and can override every value before export.

The Gemini model does two things: (1) analyze the uploaded document and return structured field data, and (2) answer follow-up questions in the Fill phase. All AI output passes through the user before anything is finalized.

---

## Test Cases

### Upload Phase

| # | Test | Input | Expected Response |
|---|---|---|---|
| U1 | Valid PDF upload | A standard government form PDF under 4MB | File accepted, scan initiated, spinner shown |
| U2 | Valid image upload | JPG or PNG of a handwritten or printed form | File accepted, scan initiated |
| U3 | File too large | PDF over 4MB | Inline error: "File must be under 4MB" — no upload attempt |
| U4 | Unsupported file type | `.docx` or `.xlsx` | Inline error: "Only PDFs and images are supported" |
| U5 | Empty or corrupt file | A 0-byte PDF | Error surfaced after FileReader attempt — "Couldn't read this file" |
| U6 | Drag-and-drop | File dragged onto drop zone | Same behavior as file picker — no difference in handling |
| U7 | Re-upload after error | Upload fails, user tries a different file | State resets cleanly — no ghost data from first attempt |

---

### Scan Phase (AI Analysis)

| # | Test | Input | Expected Response |
|---|---|---|---|
| S1 | Well-structured government form | A standard DMV renewal form | Returns `domain`, `docType`, `summary`, and populated `fields[]` — user sees confirmation screen |
| S2 | Handwritten or low-quality scan | A blurry or skewed image | AI returns best-effort result; if fields are sparse, user is told the document may be hard to read |
| S3 | Non-form document | A letter, flyer, or ID card | AI returns a summary but `fields[]` is empty or minimal — user shown "No fillable fields found" |
| S4 | Foreign language form | A form in Spanish or Chinese | AI translates field labels into English and notes the original language |
| S5 | Gemini returns malformed JSON | Simulated bad API response | Error caught before parse — user sees retry prompt, document stays in memory |
| S6 | Gemini returns 503 repeatedly | Simulated overload | Retries 4x with backoff, then surfaces: "The AI is busy — please try again shortly" |
| S7 | Scan result looks wrong | AI misidentifies domain or docType | User can correct the domain/docType on the confirmation screen before proceeding |
| S8 | Form with 30+ fields | A complex multi-page form | All fields returned and paginated 3-at-a-time through Fill phase — no truncation |

---

### Fill Phase

| # | Test | Input | Expected Response |
|---|---|---|---|
| F1 | Profile pre-fill — name | User has name saved in profile | Name field pre-populated; user can edit before confirming |
| F2 | Profile pre-fill — location | User has location saved in profile | State/city field pre-populated |
| F3 | Profile not set | User skipped profile screen | Fields left blank — no error, no crash |
| F4 | Signature field | Form includes a signature field | Signature canvas shown; user can draw or skip |
| F5 | Checkbox field | Form includes a yes/no checkbox | Toggle shown, not a text input |
| F6 | Date field | Form asks for a date | Date input shown (not a free-text field) |
| F7 | Sensitive field (SSN, etc.) | Form asks for Social Security Number | Field shown with a warning: "This is sensitive — only enter it if you're ready to submit the completed form" |
| F8 | Back navigation | User goes back from field 6 to field 3 | Field 3 shows the previously entered value — not blank |
| F9 | Skip a field | User submits a field blank | Allowed — blank is a valid answer. No blocking validation unless the field is explicitly required |
| F10 | AI follow-up question | User asks "what does this field mean?" | AI responds in plain language without advancing the wizard |

---

### Review Phase

| # | Test | Input | Expected Response |
|---|---|---|---|
| R1 | All fields shown | Any completed form | Every field and answer visible in a summary table |
| R2 | Edit a field from Review | User clicks "Edit" on a field | Wizard jumps back to that specific field in Fill, then returns to Review after confirmation |
| R3 | Blank fields in Review | User left several fields empty | Blanks shown clearly — not hidden or defaulted |
| R4 | Long answers | A field with a paragraph of text | Text wraps correctly — no overflow or truncation in the table |

---

### Auth & Profile

| # | Test | Input | Expected Response |
|---|---|---|---|
| A1 | Magic link login | User enters email, clicks link | Session established, profile checked, wizard starts |
| A2 | Expired magic link | User clicks a link more than 1 hour old | Auth error caught — "This link has expired, enter your email again" |
| A3 | Dev bypass | App opened on localhost | Auth skipped entirely, goes straight to profile check |
| A4 | First-time user | No profile row exists | Profile creation screen shown (name + location), skippable |
| A5 | Returning user | Profile row exists | Profile screen skipped, wizard starts directly |
| A6 | Session timeout mid-fill | User leaves app open for hours | On next Supabase call, session error caught — redirect to magic link with "session timed out" message |
| A7 | Update profile | User edits name or location | `updateProfile()` called, change reflected immediately in current session |

---

### Saved Forms *(planned — not yet built)*

| # | Test | Input | Expected Response |
|---|---|---|---|
| SV1 | Auto-save after each field | User fills in field 4 of 12 | `saved_forms` row upserted with current `form_state` |
| SV2 | Restore on return | User closes browser and re-opens | "You have an unfinished [docType] — pick up where you left off?" prompt shown |
| SV3 | Decline restore | User dismisses the restore prompt | Fresh wizard starts — saved row is not deleted (user may want it later) |
| SV4 | Multiple saved forms | User has two unfinished forms | Most recent shown first; older ones accessible from a list |
| SV5 | Save while offline | User loses network mid-fill | Local `sessionStorage` buffer used; sync attempted when network returns |

---

### Export *(planned — not yet built)*

| # | Test | Input | Expected Response |
|---|---|---|---|
| E1 | Export filled form | User completes Review and clicks Export | PDF generated with answers overlaid on original form layout |
| E2 | Export with blank fields | Some fields left empty | Blank fields render as empty on the PDF — no placeholder text injected |
| E3 | Export with signature | Signature canvas used | Signature image embedded in the correct field region |
| E4 | Download fails | PDF generation throws | Error shown — user not left on a blank screen; try-again option offered |

---

## Expected AI Response Behaviors

These are behavioral expectations for Gemini, not just functional pass/fail tests.

1. **Scan output is always in the declared JSON schema.** No extra keys, no missing required keys. If the model can't determine a value, it returns `null` — not an invented value.
2. **Field labels are plain English.** "Date of Birth" not "DOB (MM/DD/YYYY per 8 CFR 214.1)".
3. **The AI never fills a sensitive field without explicit user action.** SSN, financial account numbers, and passwords are never pre-populated.
4. **Follow-up answers stay in scope.** If a user asks a question in the Fill phase, the AI answers it and stops. It does not re-summarize the form, suggest other fields, or advance the wizard.
5. **Domain inference is confident but not overconfident.** If the document is ambiguous (e.g., a generic letter), the AI says so rather than picking a domain arbitrarily.

---

## Design Principles

**1. Human in the loop at every gate.**
The AI proposes; the user decides. No phase transition happens without an explicit user action. This is especially important at Scan (confirming the AI's read of the document) and Review (confirming all answers before export).

**2. Fail visibly, not silently.**
Every error — bad upload, API timeout, malformed response, session expiry — must surface a clear, specific message. A spinner that never resolves is worse than an error message. Users in a civic context may assume a silent failure means they did something wrong.

**3. Pre-fill is a suggestion, not a commitment.**
Profile data and AI-inferred values are starting points. The user sees every pre-filled value before it's locked in. Nothing is ever submitted without passing through the user's eyes.

**4. One thing at a time.**
Three fields per screen in Fill. One question at a time from the AI. One phase at a time in the wizard. The cognitive load of a government form is already high — the UI should reduce it, not add to it.

**5. Degrade gracefully.**
A missing profile, an empty fields array, a slow network — none of these should crash the session. The app should always leave the user in a state where they can either continue or try again.

**6. Trust is the product.**
Every interaction — from the language used in error messages to the handling of sensitive fields — should reinforce that this tool is on the user's side. When in doubt, err toward transparency: explain what the AI did, why a field is sensitive, and what happens next.
