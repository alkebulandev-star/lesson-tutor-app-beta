// Vercel Serverless Function: diagnostic health check.
// GET /api/health → { anthropic, openai, elevenlabs, host, deployment }
// Reports whether each API key is configured WITHOUT leaking the key itself.
// Use this to debug "the API isn't working" — visit yourdomain.com/api/health
// in your browser to see at a glance which keys Vercel can actually see.
export const config = { maxDuration: 10 };

function maskKey(k?: string) {
  if (!k) return null;
  if (k.length <= 8) return '***';
  return k.slice(0, 4) + '…' + k.slice(-4) + ` (len=${k.length})`;
}

export default async function handler(_req: any, res: any) {
  const out = {
    ok: true,
    timestamp: new Date().toISOString(),
    deployment: {
      vercelEnv: process.env.VERCEL_ENV || null, // 'production' | 'preview' | 'development'
      vercelUrl: process.env.VERCEL_URL || null,
      region: process.env.VERCEL_REGION || null,
      nodeVersion: process.version,
    },
    keys: {
      anthropic: {
        configured: !!process.env.ANTHROPIC_API_KEY,
        preview: maskKey(process.env.ANTHROPIC_API_KEY),
      },
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        preview: maskKey(process.env.OPENAI_API_KEY),
      },
      elevenlabs: {
        configured: !!process.env.ELEVENLABS_API_KEY,
        preview: maskKey(process.env.ELEVENLABS_API_KEY),
      },
    },
  };
  res.setHeader('cache-control', 'no-store');
  return res.status(200).json(out);
}
