import assert from 'node:assert/strict';
import test from 'node:test';
import { createRateLimiter, getClientIp, rateLimitResponse, RATE_LIMIT_MESSAGE } from '../lib/rate-limit.js';

const withHeaders = (headers) => new Request('https://www.lapropagande.net/api/x', { method: 'POST', headers });

test('client IP comes from the first x-forwarded-for hop, then x-real-ip', () => {
  assert.equal(getClientIp(withHeaders({ 'X-Forwarded-For': '203.0.113.7, 10.0.0.1, 10.0.0.2' })), '203.0.113.7');
  assert.equal(getClientIp(withHeaders({ 'X-Forwarded-For': ' 203.0.113.7 ' })), '203.0.113.7');
  assert.equal(getClientIp(withHeaders({ 'X-Real-IP': '198.51.100.4' })), '198.51.100.4');
  assert.equal(getClientIp(withHeaders({ 'X-Forwarded-For': 'garbage', 'X-Real-IP': '198.51.100.4' })), '198.51.100.4');
  assert.equal(getClientIp(withHeaders({ 'X-Forwarded-For': '203.0.113.7:51234' })), '203.0.113.7');
  assert.equal(getClientIp(withHeaders({ 'X-Forwarded-For': '::ffff:203.0.113.7' })), '203.0.113.7');
  assert.equal(getClientIp(withHeaders({})), 'unknown');
  assert.equal(getClientIp(withHeaders({ 'X-Forwarded-For': `${'1'.repeat(5000)}` })), 'unknown');
});

test('IPv6 clients are grouped by /64 so rotating the interface id does not reset the limit', () => {
  const a = getClientIp(withHeaders({ 'X-Forwarded-For': '2001:db8:abcd:12::1' }));
  const b = getClientIp(withHeaders({ 'X-Forwarded-For': '2001:0db8:abcd:0012:ffff:ffff:ffff:ffff' }));
  const c = getClientIp(withHeaders({ 'X-Forwarded-For': '[2001:db8:abcd:13::1]:443' }));
  assert.equal(a, '2001:db8:abcd:12::/64');
  assert.equal(a, b);
  assert.equal(c, '2001:db8:abcd:13::/64');
});

test('sliding window allows `limit` hits, rejects the next with Retry-After, then recovers', () => {
  let clock = 1_000_000;
  const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => clock });
  for (let i = 0; i < 3; i++) assert.equal(limiter.check('a').allowed, true);
  const blocked = limiter.check('a');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 60);
  assert.equal(limiter.check('b').allowed, true, 'other keys are independent');

  clock += 30_000;
  assert.equal(limiter.check('a').allowed, false, 'still inside the window');
  assert.equal(limiter.check('a').retryAfterSeconds, 30);
  clock += 30_001;
  assert.equal(limiter.check('a').allowed, true, 'oldest hits slid out of the window');
});

test('limiter memory stays bounded: key count capped and expired keys swept', () => {
  let clock = 0;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, maxKeys: 100, now: () => clock });
  for (let i = 0; i < 10_000; i++) limiter.check(`spoofed-${i}`);
  assert.ok(limiter.size <= 100, `size ${limiter.size}`);
  clock += 5000;
  limiter.check('fresh');
  assert.equal(limiter.size, 1, 'expired keys are swept once the window has passed');
});

test('rateLimitResponse returns 429 with Retry-After, no-store and the caller-supplied body shape', async () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 600_000 });
  const request = () => withHeaders({ 'X-Forwarded-For': '192.0.2.10' });
  assert.equal(rateLimitResponse(request(), limiter), null);
  const response = rateLimitResponse(request(), limiter, { message: RATE_LIMIT_MESSAGE });
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get('retry-after')) >= 1);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { message: RATE_LIMIT_MESSAGE });
});
