// Vercel Serverless Function: accepts an Anthropic-style request body
// (model, max_tokens, system, messages[]), translates to OpenAI Chat
// Completions, calls OpenAI, then translates the response BACK to
// Anthropic's shape so the rest of the app stays unchanged.
// - Reads OPENAI_API_KEY from Vercel env vars.
// - Retries on transient failures.
export const config = { maxDuration: 60 };

const TIMEOUT_MS = 50_000;
const MAX_ATTEMPTS = 3;
const RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mapModel(claudeModel: string): string {
  if (!claudeModel) return 'gpt-4o-mini';
  const m = claudeModel.toLowerCase();
  if (m.includes('opus')) return 'gpt-4o';
  if (m.includes('sonnet')) return 'gpt-4o';
  if (m.includes('haiku')) return 'gpt-4o-mini';
  return 'gpt-4o-mini';
}

function flattenContent(content: any): any {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return String(content ?? '');
  const out: any[] = [];
  for (const b of content) {
    if (!b) continue;
    if (b.type === 'text') {
      out.push({ type: 'text', text: b.text || '' });
    } else if (b.type === 'image' && b.source?.type === 'base64') {
      out.push({
        type: 'image_url',
        image_url: { url: `data:${b.source.media_type};base64,${b.source.data}` },
      });
    } else if (b.type === 'document') {
      out.push({ type: 'text', text: '[document attached — text extraction not available on Server 2]' });
    } else if (b.type === 'image_url') {
      out.push(b);
    }
  }
  if (out.length === 1 && out[0].type === 'text') return out[0].text;
  return out;
}

async function callOpenAI(apiKey: string, oaiBody: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(oaiBody),
      signal: controller.signal,
    });
    const text = await upstream.text();
    return { ok: upstream.ok, status: upstream.status, text };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', provider: 'openai' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured in Vercel.',
      hint: 'Project Settings → Environment Variables → add OPENAI_API_KEY (Production), then redeploy.',
      provider: 'openai',
    });
  }

  const body: any = req.body || {};
  const messages: any[] = [];
  if (body.system) messages.push({ role: 'system', content: String(body.system) });
  for (const m of (body.messages || [])) {
    messages.push({ role: m.role, content: flattenContent(m.content) });
  }

  const oaiBody: any = {
    model: mapModel(body.model),
    messages,
    max_tokens: Math.min(body.max_tokens || 1024, 4096),
  };
  if (typeof body.temperature === 'number') oaiBody.temperature = body.temperature;

  let lastStatus = 0;
  let lastText = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const r = await callOpenAI(apiKey, oaiBody);
      if (r.ok) {
        let data: any = {};
        try { data = JSON.parse(r.text); } catch {}
        const text = data?.choices?.[0]?.message?.content || '';
        return res.status(200).json({
          id: data?.id || 'oai-' + Date.now(),
          type: 'message',
          role: 'assistant',
          model: oaiBody.model,
          content: [{ type: 'text', text: typeof text === 'string' ? text : JSON.stringify(text) }],
          stop_reason: data?.choices?.[0]?.finish_reason || 'end_turn',
          usage: {
            input_tokens: data?.usage?.prompt_tokens || 0,
            output_tokens: data?.usage?.completion_tokens || 0,
          },
          _provider: 'openai',
        });
      }
      lastStatus = r.status;
      lastText = r.text;
      if (!RETRY_STATUSES.has(r.status) || attempt === MAX_ATTEMPTS) {
        return res.status(r.status).json({
          error: 'OpenAI upstream error',
          status: r.status,
          detail: r.text,
          provider: 'openai',
        });
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      if (attempt === MAX_ATTEMPTS) {
        return res.status(isAbort ? 504 : 502).json({
          error: isAbort
            ? `OpenAI timed out after ${TIMEOUT_MS / 1000}s on all ${MAX_ATTEMPTS} attempts.`
            : `OpenAI request failed: ${err?.message || String(err)}`,
          provider: 'openai',
        });
      }
    }
    await sleep(500 * attempt * attempt);
  }

  return res.status(lastStatus || 502).json({
    error: 'OpenAI exhausted retries.',
    detail: lastText,
    provider: 'openai',
  });
}
