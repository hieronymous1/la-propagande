import test from 'node:test';
import assert from 'node:assert/strict';
import { recordVisit, getInstagramPostUrl } from '../lib/audience.js';

test('counts the same visitor only once per day using an atomic persistent operation', async () => {
  const requests = [];
  const fetcher = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: requests.length === 1 ? 1 : 1 }) };
  };
  const env = { UPSTASH_REDIS_REST_URL: 'https://test.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'secret' };
  assert.equal(await recordVisit('visitor-token', env, fetcher), 1);
  assert.equal(await recordVisit('visitor-token', env, fetcher), 1);
  assert.equal(requests[0][0], 'EVAL');
  assert.match(requests[0][1], /SET.*NX.*EX/);
  assert.match(requests[0][1], /INCR/);
  assert.ok(!requests[0].join(' ').includes('visitor-token'));
});

test('no configured store or failed store never produces a fabricated count', async () => {
  assert.equal(await recordVisit('token', {}, () => { throw Error('unexpected'); }), null);
  await assert.rejects(recordVisit('token', { UPSTASH_REDIS_REST_URL: 'https://test.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'secret' }, async () => ({ ok: false })));
});

test('only accepts Instagram posts and reels, stripping tracking and rejecting lookalike hosts', () => {
  assert.equal(getInstagramPostUrl('https://www.instagram.com/p/ABC_123/?utm_source=qr'), 'https://www.instagram.com/p/ABC_123/');
  assert.equal(getInstagramPostUrl('https://instagram.com/reel/ABC-123/'), 'https://www.instagram.com/reel/ABC-123/');
  for (const input of ['javascript:alert(1)', 'https://instagram.com.evil.test/p/abc/', 'https://www.instagram.com/_lapropagande/', 'http://instagram.com/p/abc/']) {
    assert.equal(getInstagramPostUrl(input), undefined);
  }
});
