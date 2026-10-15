import { createHash } from 'node:crypto';

// One count per anonymous browser in a rolling 24-hour window, across all routes.
// The conditional increment is atomic even when requests arrive concurrently.
const VISIT_SCRIPT = `
if redis.call('SET', KEYS[1], '1', 'NX', 'EX', 86400) then
  return redis.call('INCR', KEYS[2])
end
return tonumber(redis.call('GET', KEYS[2]) or '0')
`;

export async function recordVisit(visitor, env = process.env, fetcher = fetch) {
  const endpoint = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!endpoint || !token) return null;
  const url = new URL(endpoint);
  if (url.protocol !== 'https:') throw new Error('Visitor storage requires HTTPS');
  const hash = createHash('sha256').update(visitor).digest('hex');
  const response = await fetcher(url.toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', VISIT_SCRIPT, 2, `lp:visit:${hash}`, 'lp:visits:total']),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Visitor storage unavailable');
  const data = await response.json();
  if (data.error || !Number.isSafeInteger(data.result) || data.result < 0) throw new Error('Invalid visitor count');
  return data.result;
}

export function getInstagramPostUrl(value) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname) || url.username || url.password || url.port) return undefined;
    const match = url.pathname.match(/^\/(p|reel)\/([A-Za-z0-9_-]+)\/?$/);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/` : undefined;
  } catch { return undefined; }
}

