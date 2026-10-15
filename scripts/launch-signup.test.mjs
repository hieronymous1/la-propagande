import assert from 'node:assert/strict';
import test from 'node:test';
import { handleLaunchSignup } from '../lib/launch-signup.js';

const env = { LAUNCH_SIGNUP_ENDPOINT: 'https://formspree.io/f/example' };
const valid = { email: 'visitor@example.org', consent: true };
const request = (data = valid, origin = 'https://lapropagande.net') => new Request('https://lapropagande.net/api/launch-signup', {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});

test('launch signup rejects cross-site, invalid email, missing consent, honeypot, oversized bodies', async () => {
  let calls = 0;
  const send = async () => { calls++; return new Response(); };
  assert.equal((await handleLaunchSignup(request(valid, 'https://other.example'), env, send)).status, 403);
  for (const data of [{ ...valid, email: 'invalid' }, { ...valid, consent: false }, { ...valid, website: 'spam' }]) {
    assert.equal((await handleLaunchSignup(request(data), env, send)).status, 400);
  }
  assert.equal((await handleLaunchSignup(request({ ...valid, email: 'x'.repeat(3000) }), env, send)).status, 413);
  assert.equal(calls, 0);
});

test('launch signup reports configuration and delivery failures without success', async () => {
  assert.equal((await handleLaunchSignup(request(), {})).status, 503);
  assert.equal((await handleLaunchSignup(request(), { LAUNCH_SIGNUP_ENDPOINT: 'http://unsafe.example' })).status, 503);
  assert.equal((await handleLaunchSignup(request(), env, async () => new Response(null, { status: 422 }))).status, 502);
  assert.equal((await handleLaunchSignup(request(), env, async () => { throw new Error('private provider details'); })).status, 502);
});

test('launch signup sends only allowed fields and confirms successful provider receipt', async () => {
  let sent;
  const response = await handleLaunchSignup(request({ ...valid, email: ' visitor@example.org ', admin: true }), env, async (url, options) => {
    assert.equal(url, env.LAUNCH_SIGNUP_ENDPOINT);
    assert.equal(options.redirect, 'error');
    sent = JSON.parse(options.body);
    return new Response(null, { status: 200 });
  });
  assert.equal(response.status, 200);
  assert.equal(sent.email, valid.email);
  assert.equal(sent.consent, true);
  assert.equal(sent.admin, undefined);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
