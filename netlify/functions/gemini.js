/**
 * netlify/functions/gemini.js
 *
 * Serverless proxy for Gemini API calls. Keeps the API key
 * server-side; the client never sees it.
 *
 * Called by the client at: POST /api/gemini?model=<model-name>
 * (Netlify redirects /api/gemini → /.netlify/functions/gemini via netlify.toml)
 *
 * Set GEMINI_API_KEY in Netlify → Site settings → Environment variables.
 */

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY environment variable is not set.' }),
    };
  }

  const ALLOWED_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);
  const requestedModel = event.queryStringParameters?.model || 'gemini-2.5-flash';
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-2.5-flash';
  const geminiUrl = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(geminiUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    event.body,
      signal:  AbortSignal.timeout(22000),
    });

    const text = await response.text();
    return {
      statusCode: response.status,
      headers:    { 'Content-Type': 'application/json' },
      body:       text,
    };
  } catch (err) {
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    return {
      statusCode: isTimeout ? 503 : 502,
      headers:    { 'Content-Type': 'application/json' },
      body:       JSON.stringify({ error: isTimeout ? 'Gemini API timed out' : err.message }),
    };
  }
};
