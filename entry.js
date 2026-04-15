/**
 * entry.js — CivicGuide Stage 1: Entry
 *
 * Runs the ROUTER agent conversation that collects the user's
 * location and civic domain. Resolves with { location, domain }
 * when both are confirmed so StageShell can advance to Stage 2.
 *
 * Uses the Gemini REST API directly (no build step required).
 */

import { SYSTEM_PROMPT, GEMINI_PROXY_URL, GEMINI_MODEL } from './config.js';

const API_URL = `${GEMINI_PROXY_URL}?model=${encodeURIComponent(GEMINI_MODEL)}`;

// ── Civic domains the router presents to the user ────────────────
const DOMAINS = [
  'DMV',
  'Parks & Recreation',
  'Streets & Transit',
  'Welfare / Benefits',
  'Social Security',
  'Housing',
  'Other',
];

// ── Simple regex extractors used to detect confirmed state ────────
// These are best-effort — the model's plain-language reply is the
// source of truth for the user; these just drive stage advancement.

function extractLocation(text) {
  // Matches common patterns like "Portland, OR", "Chicago, Illinois",
  // "New York", "London, UK", etc.
  const m = text.match(
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+))\b/
  );
  return m ? m[1] : null;
}

function extractDomain(text) {
  for (const domain of DOMAINS) {
    // Check for numbered selection ("1", "2" …) or the domain name itself
    if (text.toLowerCase().includes(domain.toLowerCase())) return domain;
  }
  // Numbered pick — map 1-7 to domain list
  const numMatch = text.match(/\b([1-7])\b/);
  if (numMatch) return DOMAINS[parseInt(numMatch[1], 10) - 1] ?? null;
  return null;
}

// ── Core class ────────────────────────────────────────────────────

export class EntryStage {
  /**
   * @param {object} options
   * @param {(role: 'model'|'user', text: string) => void} options.onMessage
   *   Called for every message exchanged so the UI can render the chat.
   * @param {(state: { location: string, domain: string }) => void} options.onComplete
   *   Called once both location and domain are confirmed.
   * @param {(error: Error) => void} [options.onError]
   */
  constructor({ onMessage, onComplete, onError }) {
    this._onMessage  = onMessage;
    this._onComplete = onComplete;
    this._onError    = onError ?? ((e) => console.error('[EntryStage]', e));

    // Conversation history sent to Gemini on every turn
    this._history = [];

    // Partial state — filled in as the router confirms each piece
    this._state = { location: null, domain: null };

    this._started = false;
  }

  // ── Public API ──────────────────────────────────────────────────

  /** Begin the session. Sends the router's opening message. */
  async start() {
    if (this._started) return;
    this._started = true;
    await this._send(null); // null = no user turn yet, triggers greeting
  }

  /**
   * Submit a user message and get the model's response.
   * @param {string} userText
   */
  async send(userText) {
    if (!userText.trim()) return;
    this._onMessage('user', userText);
    await this._send(userText);
  }

  // ── Internal ────────────────────────────────────────────────────

  async _send(userText) {
    if (userText !== null) {
      this._history.push({ role: 'user', parts: [{ text: userText }] });
    }

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: this._history.length ? this._history : [
        // Gemini requires at least one user turn; we use a silent primer
        // on the very first call so the model opens with its greeting.
        { role: 'user', parts: [{ text: 'Hello.' }] },
      ],
      generationConfig: {
        temperature: 0.4,   // calm, consistent responses
        maxOutputTokens: 512,
      },
    };

    let modelText;

    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Gemini API ${res.status}: ${detail}`);
      }

      const data = await res.json();
      modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!modelText) throw new Error('Empty response from Gemini.');
    } catch (err) {
      this._onError(err);
      return;
    }

    // Append model turn to history
    this._history.push({ role: 'model', parts: [{ text: modelText }] });
    this._onMessage('model', modelText);

    // After the user has spoken, check whether we can advance state
    if (userText !== null) {
      this._tryAdvanceState(userText, modelText);
    }
  }

  _tryAdvanceState(userText, modelText) {
    const combined = `${userText} ${modelText}`;

    if (!this._state.location) {
      const loc = extractLocation(combined);
      if (loc) this._state.location = loc;
    }

    if (!this._state.domain) {
      const dom = extractDomain(combined);
      if (dom) this._state.domain = dom;
    }

    if (this._state.location && this._state.domain) {
      // Give the model one more turn so it can confirm the hand-off
      // before we signal completion to StageShell.
      setTimeout(() => this._onComplete({ ...this._state }), 800);
    }
  }
}
