// Vercel Serverless Function: proxies requests to Anthropic.
// - Reads ANTHROPIC_API_KEY from Vercel env vars.
// - Retries automatically on transient failures (429, 5xx, 529 overloaded).
// - Returns structured JSON errors so the client can show real diagnostics.
// - maxDuration 60s is the Hobby-plan ceiling.
export const config = { maxDuration: 60 };

const TIMEOUT_MS = 50_000;
const MAX_ATTEMPTS = 3;
const RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504, 529]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callAnthropic(apiKey: string, rawBody: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: rawBody,
      signal: controller.signal,
    });
    const text = await upstream.text();
    return {
      ok: upstream.ok,
      status: upstream.status,
      text,
      contentType: upstream.headers.get('content-type') || 'application/json',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', provider: 'anthropic' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured in Vercel.',
      hint: 'Project Settings → Environment Variables → add ANTHROPIC_API_KEY (Production), then redeploy.',
      provider: 'anthropic',
    });
  }

  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

  let lastStatus = 0;
  let lastText = '';
  let lastErr: any = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const r = await callAnthropic(apiKey, rawBody);
      if (r.ok) {
        res.setHeader('content-type', r.contentType);
        return res.status(r.status).send(r.text);
      }
      lastStatus = r.status;
      lastText = r.text;
      if (!RETRY_STATUSES.has(r.status) || attempt === MAX_ATTEMPTS) {
        // Non-retryable, or last attempt — pass upstream error through.
        res.setHeader('content-type', r.contentType);
        return res.status(r.status).send(r.text);
      }
    } catch (err: any) {
      lastErr = err;
      const isAbort = err?.name === 'AbortError';
      if (attempt === MAX_ATTEMPTS) {
        return res.status(isAbort ? 504 : 502).json({
          error: isAbort
            ? `Anthropic timed out after ${TIMEOUT_MS / 1000}s on all ${MAX_ATTEMPTS} attempts.`
            : `Anthropic request failed: ${err?.message || String(err)}`,
          provider: 'anthropic',
        });
      }
    }
    // Exponential backoff: ~500ms, ~2000ms.
    await sleep(500 * attempt * attempt);
  }

  return res.status(lastStatus || 502).json({
    error: 'Anthropic exhausted retries.',
    detail: lastText || (lastErr ? String(lastErr) : ''),
    provider: 'anthropic',
  });
}
