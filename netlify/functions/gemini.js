const GEMINI_BASE   = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_UPLOAD = 'https://generativelanguage.googleapis.com/upload/v1beta/files';

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

  // ── File upload action ─────────────────────────────────
  if (event.queryStringParameters?.action === 'upload') {
    try {
      const { mimeType, data: base64Data } = JSON.parse(event.body);
      const fileBytes = Buffer.from(base64Data, 'base64');
      const boundary  = 'gc_boundary';
      const metadata  = JSON.stringify({ file: { mimeType } });

      const multipart = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
        fileBytes,
        Buffer.from(`\r\n--${boundary}--`),
      ]);

      const res = await fetch(`${GEMINI_UPLOAD}?uploadType=multipart&key=${apiKey}`, {
        method:  'POST',
        headers: {
          'Content-Type':   `multipart/related; boundary=${boundary}`,
          'Content-Length': String(multipart.length),
        },
        body:   multipart,
        signal: AbortSignal.timeout(25000),
      });

      const json = await res.json();
      return {
        statusCode: res.status,
        headers:    { 'Content-Type': 'application/json' },
        body:       JSON.stringify({ fileUri: json.file?.uri, mimeType: json.file?.mimeType }),
      };
    } catch (err) {
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
      return {
        statusCode: isTimeout ? 503 : 502,
        headers:    { 'Content-Type': 'application/json' },
        body:       JSON.stringify({ error: isTimeout ? 'Upload timed out' : err.message }),
      };
    }
  }

  // ── Generate content ───────────────────────────────────
  const ALLOWED_MODELS  = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);
  const requestedModel  = event.queryStringParameters?.model || 'gemini-2.5-flash';
  const model           = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-2.5-flash';
  const geminiUrl       = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;

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
