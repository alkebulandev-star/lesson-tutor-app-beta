// Vercel Serverless Function: proxies TTS requests to ElevenLabs.
// - Reads ELEVENLABS_API_KEY from Vercel env vars.
// - Retries on transient failures.
export const config = { maxDuration: 60 };

const TIMEOUT_MS = 50_000;
const MAX_ATTEMPTS = 3;
const RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_VOICE_ID = 'CiGXiF6vr3ULNlgVfZ5z';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callEleven(apiKey: string, voiceId: string, text: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
        signal: controller.signal,
      }
    );
    return upstream;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', provider: 'elevenlabs' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ELEVENLABS_API_KEY is not configured in Vercel.',
      hint: 'Project Settings → Environment Variables → add ELEVENLABS_API_KEY (Production), then redeploy.',
      provider: 'elevenlabs',
    });
  }

  const payload: any = req.body || {};
  const text = (payload?.text || '').toString().slice(0, 4000);
  if (!text) {
    return res.status(400).json({ error: 'Missing text', provider: 'elevenlabs' });
  }
  const voiceId = (payload?.voiceId || DEFAULT_VOICE_ID).toString();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const upstream = await callEleven(apiKey, voiceId, text);
      if (upstream.ok) {
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('content-type', 'audio/mpeg');
        res.setHeader('cache-control', 'no-store');
        return res.status(200).send(buffer);
      }
      const errText = await upstream.text();
      if (!RETRY_STATUSES.has(upstream.status) || attempt === MAX_ATTEMPTS) {
        return res.status(upstream.status).json({
          error: 'ElevenLabs error',
          status: upstream.status,
          detail: errText,
          provider: 'elevenlabs',
        });
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      if (attempt === MAX_ATTEMPTS) {
        return res.status(isAbort ? 504 : 502).json({
          error: isAbort
            ? `ElevenLabs timed out after ${TIMEOUT_MS / 1000}s on all ${MAX_ATTEMPTS} attempts.`
            : `ElevenLabs request failed: ${err?.message || String(err)}`,
          provider: 'elevenlabs',
        });
      }
    }
    await sleep(500 * attempt * attempt);
  }

  return res.status(502).json({ error: 'ElevenLabs exhausted retries.', provider: 'elevenlabs' });
}
