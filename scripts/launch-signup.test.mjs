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

test('FormSubmit rejection or activation requirement is never reported as a saved signup', async () => {
  const provider = { LAUNCH_SIGNUP_ENDPOINT: 'https://formsubmit.co/ajax/lapropagandeparisbey@outlook.com' };
  for (const payload of [{ success: false }, { success: 'false' }]) {
    const response = await handleLaunchSignup(request(), provider, async () => Response.json(payload));
    assert.equal(response.status, 502);
  }
});

test('FormSubmit launch signups include the referrer and disable an unavailable server-side captcha', async () => {
  const provider = { LAUNCH_SIGNUP_ENDPOINT: 'https://formsubmit.co/ajax/lapropagandeparisbey@outlook.com' };
  const response = await handleLaunchSignup(request(), provider, async (_url, options) => {
    assert.equal(options.headers.Referer, 'https://lapropagande.net/');
    assert.equal(JSON.parse(options.body)._captcha, 'false');
    return Response.json({ success: 'true' });
  });
  assert.equal(response.status, 200);
});

test('Shopify launch mode confirms only durable saves and never calls the mail service', async () => {
  const storageEnv = { ...env, LAUNCH_SIGNUP_STORAGE: 'shopify' };
  let saved;
  const send = async () => { throw new Error('Email provider must not be called'); };
  const ok = await handleLaunchSignup(request(), storageEnv, send, async email => { saved = email; });
  assert.equal(ok.status, 200);
  assert.equal(saved, valid.email);
  assert.equal((await handleLaunchSignup(request(), storageEnv, send, async () => { throw new Error('storage failed'); })).status, 502);
});
