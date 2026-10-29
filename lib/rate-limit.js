/*
 * Best-effort in-memory sliding-window rate limiting for the public API routes.
 *
 * IMPORTANT: state lives in module scope, so limits apply PER SERVERLESS INSTANCE.
 * Vercel may run several warm instances at once and recycles them at will, so a
 * determined client can exceed these numbers. This layer exists to blunt casual
 * abuse (form spam, cart hammering) without adding a paid service. The durable
 * layer is a Vercel Firewall (WAF) rate-limit rule on /api/* configured in the
 * Vercel dashboard; keep that rule in place and treat this module as defence in
 * depth, not as the only control.
 *
 * Client IP: the first hop of `x-forwarded-for`, falling back to `x-real-ip`.
 * On Vercel the edge overwrites `x-forwarded-for` with the connecting client's
 * address, so the first hop is trustworthy there. Behind any other proxy that
 * forwards a client-supplied header unchanged, it can be spoofed.
 */
import { isIP } from 'node:net';

const DEFAULT_MAX_KEYS = 5000;
const MAX_IP_HEADER_LENGTH = 256;
export const RATE_LIMIT_MESSAGE = 'Too many requests. Please wait a few minutes and try again.';

/** Collapse an IPv6 address to its /64 prefix: one subscriber usually controls a whole /64. */
function ipv6Prefix64(address) {
  const [head, tail = null] = address.toLowerCase().split('::');
  const headParts = head ? head.split(':') : [];
  const tailParts = tail === null ? [] : tail ? tail.split(':') : [];
  const missing = 8 - headParts.length - tailParts.length;
  const groups = tail === null ? headParts : [...headParts, ...Array(Math.max(missing, 0)).fill('0'), ...tailParts];
  return `${groups.slice(0, 4).map((group) => group.replace(/^0+(?=.)/, '')).join(':')}::/64`;
}

/** Normalise a raw header value into a stable limiter key, or null if it is not an IP. */
function normalizeIp(raw) {
  if (typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value || value.length > 64) return null;
  if (value.startsWith('[')) value = value.slice(1, value.indexOf(']') === -1 ? undefined : value.indexOf(']'));
  else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) value = value.slice(0, value.lastIndexOf(':'));
  const zone = value.indexOf('%');
  if (zone !== -1) value = value.slice(0, zone);
  const version = isIP(value);
  if (version === 4) return value;
  if (version !== 6) return null;
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(value);
  if (mapped && isIP(mapped[1]) === 4) return mapped[1];
  return ipv6Prefix64(value);
}

/**
 * Client IP from the first `x-forwarded-for` hop, falling back to `x-real-ip`; 'unknown' otherwise.
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  const headers = request?.headers;
  if (!headers || typeof headers.get !== 'function') return 'unknown';
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = normalizeIp(forwarded.slice(0, MAX_IP_HEADER_LENGTH).split(',')[0]);
    if (ip) return ip;
  }
  return normalizeIp(headers.get('x-real-ip')?.slice(0, MAX_IP_HEADER_LENGTH)) ?? 'unknown';
}

/**
 * Sliding-window log limiter. Each key keeps at most `limit` timestamps, and the
 * number of keys is capped at `maxKeys`: expired keys are swept once per window,
 * and at the cap the least recently used key is evicted. Memory is therefore
 * O(maxKeys * limit).
 */
export function createRateLimiter({ limit, windowMs, maxKeys = DEFAULT_MAX_KEYS, now = Date.now }) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('limit must be a positive integer');
  if (!Number.isFinite(windowMs) || windowMs <= 0) throw new Error('windowMs must be positive');
  if (!Number.isInteger(maxKeys) || maxKeys < 1) throw new Error('maxKeys must be a positive integer');

  /** @type {Map<string, number[]>} */
  const hits = new Map();
  let lastSweep = now();

  function sweep(current) {
    for (const [key, stamps] of hits) {
      if (!stamps.length || stamps[stamps.length - 1] <= current - windowMs) hits.delete(key);
    }
    lastSweep = current;
  }

  /** @param {string} key */
  function check(key) {
    const current = now();
    // Periodic O(n) sweep only; at the key cap the LRU eviction below keeps each call O(1).
    if (current - lastSweep >= windowMs) sweep(current);

    const id = String(key);
    const stamps = (hits.get(id) ?? []).filter((stamp) => stamp > current - windowMs);
    hits.delete(id); // Re-inserted below so Map order tracks recency (LRU eviction).

    if (stamps.length >= limit) {
      hits.set(id, stamps);
      const retryAfterSeconds = Math.max(1, Math.ceil((stamps[0] + windowMs - current) / 1000));
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    while (hits.size >= maxKeys) hits.delete(hits.keys().next().value);
    stamps.push(current);
    hits.set(id, stamps);
    return { allowed: true, remaining: limit - stamps.length, retryAfterSeconds: 0 };
  }

  return {
    check,
    get size() { return hits.size; },
    reset() { hits.clear(); lastSweep = now(); },
  };
}

/**
 * Returns a 429 response when the request's client IP is over the limit, else null.
 * `body` keeps each route's existing JSON error shape ({ message } or { error }).
 * @param {Request} request
 * @param {{ check(key: string): { allowed: boolean, remaining: number, retryAfterSeconds: number } }} limiter
 * @param {Record<string, unknown>} [body]
 * @returns {Response | null}
 */
export function rateLimitResponse(request, limiter, body = { error: RATE_LIMIT_MESSAGE }) {
  const result = limiter.check(getClientIp(request));
  if (result.allowed) return null;
  return Response.json(body, {
    status: 429,
    headers: { 'Retry-After': String(result.retryAfterSeconds), 'Cache-Control': 'no-store' },
  });
}

const TEN_MINUTES = 10 * 60 * 1000;

// One limiter per route family; each warm instance keeps its own counts (see header comment).
export const inquiryRateLimiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES });
export const launchSignupRateLimiter = createRateLimiter({ limit: 5, windowMs: TEN_MINUTES });
export const cartCreateRateLimiter = createRateLimiter({ limit: 60, windowMs: TEN_MINUTES });
export const cartLinesRateLimiter = createRateLimiter({ limit: 60, windowMs: TEN_MINUTES });
export const visitorsRateLimiter = createRateLimiter({ limit: 30, windowMs: TEN_MINUTES });
