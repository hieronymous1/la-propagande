import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { handleInquiry, FIELD_MAX_LENGTHS } from '../lib/inquiry.js';
import { handleLaunchSignup } from '../lib/launch-signup.js';
import * as rateLimit from '../lib/rate-limit.js';

const require = createRequire(import.meta.url);
const validation = require('../lib/cart-validation.js');
const nextServer = require('next/server');
const SITE = 'https://www.lapropagande.net';
const cart = { id: 'gid://shopify/Cart/test-cart', totalQuantity: 1 };

function loadRoute(path, extraImports = {}) {
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const imports = {
    '@/lib/commerce': { COMMERCE_ENABLED: true, DEMO_MESSAGE: 'demo' },
    'next/server': { NextResponse: Response },
    '@/lib/cart-validation': validation,
    '@/lib/rate-limit': rateLimit,
    '@/lib/queries/cart': { createCart: async () => cart, addToCart: async () => cart, updateCartLines: async () => cart, removeFromCart: async () => cart },
    ...extraImports,
  };
  vm.runInNewContext(outputText, { exports, URL, console, require: (name) => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  } });
  return exports;
}

const inquiryRequest = (ip, data, origin = SITE) => new Request(`${SITE}/api/inquiry`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
  body: JSON.stringify(data ?? { inquiryType: 'archive', name: 'Visitor', email: 'visitor@example.org', message: 'A contribution' }),
});

test('inquiry: the 6th submission from one IP in 10 minutes gets 429 and never reaches the mail provider', async () => {
  let sent = 0;
  const env = { RESEND_API_KEY: 'test-key', MAIL_FROM: 'forms@example.org' };
  const send = async () => { sent++; return Response.json({ id: 'ok' }); };
  for (let i = 0; i < 5; i++) assert.equal((await handleInquiry(inquiryRequest('203.0.113.50'), env, send)).status, 200);
  const blocked = await handleInquiry(inquiryRequest('203.0.113.50'), env, send);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  // Existing UI contract: inquiry errors are JSON { message }.
  assert.equal(typeof (await blocked.json()).message, 'string');
  assert.equal(sent, 5);
  assert.equal((await handleInquiry(inquiryRequest('203.0.113.51'), env, send)).status, 200, 'other IPs unaffected');
});

test('inquiry: cross-site posts are rejected before counting, so a third-party page cannot exhaust a visitor quota', async () => {
  const send = async () => Response.json({ id: 'ok' });
  const env = { RESEND_API_KEY: 'test-key', MAIL_FROM: 'forms@example.org' };
  for (let i = 0; i < 20; i++) assert.equal((await handleInquiry(inquiryRequest('203.0.113.60', undefined, 'https://evil.example'), env, send)).status, 403);
  assert.equal((await handleInquiry(inquiryRequest('203.0.113.60'), env, send)).status, 200);
});

test('inquiry: every free-text field has a max length; the 16 KB body cap still applies', async () => {
  const send = () => { throw new Error('Must not send'); };
  const base = { inquiryType: 'custom-jackets', name: 'Visitor', email: 'visitor@example.org', consent: true };
  let ip = 0;
  for (const [field, max] of Object.entries(FIELD_MAX_LENGTHS)) {
    if (field === 'name' || field === 'email') continue; // covered by the identity validation (400 as well)
    const response = await handleInquiry(inquiryRequest(`192.0.2.${++ip}`, { ...base, [field]: 'x'.repeat(max + 1) }), {}, send);
    assert.equal(response.status, 400, field);
  }
  assert.equal((await handleInquiry(inquiryRequest('192.0.2.200', { ...base, notes: 'x'.repeat(17000) }), {}, send)).status, 413);
  // At the limit is accepted (reaches delivery; no provider configured -> 503, not 400).
  assert.equal((await handleInquiry(inquiryRequest('192.0.2.201', { ...base, notes: 'x'.repeat(FIELD_MAX_LENGTHS.notes) }), {}, send)).status, 503);
});

test('launch signup: the 6th attempt from one IP gets 429 with a { message } the demo dialog displays', async () => {
  const env = { LAUNCH_SIGNUP_ENDPOINT: 'https://formspree.io/f/example' };
  let calls = 0;
  const send = async () => { calls++; return new Response(null, { status: 200 }); };
  const request = () => new Request('https://lapropagande.net/api/launch-signup', {
    method: 'POST', headers: { Origin: 'https://lapropagande.net', 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.70' },
    body: JSON.stringify({ email: 'visitor@example.org', consent: true }),
  });
  for (let i = 0; i < 5; i++) assert.equal((await handleLaunchSignup(request(), env, send)).status, 200);
  const blocked = await handleLaunchSignup(request(), env, send);
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  assert.equal((await blocked.json()).message, rateLimit.RATE_LIMIT_MESSAGE);
  assert.equal(calls, 5);
});

const cartPost = (endpoint, ip, body) => new Request(`${SITE}${endpoint}`, {
  method: 'POST', headers: { Origin: SITE, 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, body,
});
const addBody = JSON.stringify({ action: 'add', cartId: cart.id, lines: [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 }] });

for (const [path, endpoint] of [['app/api/cart/route.ts', '/api/cart'], ['app/api/cart/lines/route.ts', '/api/cart/lines']]) {
  test(`${endpoint}: 60 mutations per IP per 10 minutes, then 429 { error } with Retry-After`, async () => {
    const route = loadRoute(path);
    for (let i = 0; i < 60; i++) assert.equal((await route.POST(cartPost(endpoint, '203.0.113.80', addBody))).status, 200, `request ${i + 1}`);
    const blocked = await route.POST(cartPost(endpoint, '203.0.113.80', addBody));
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get('retry-after')) > 0);
    assert.equal(typeof (await blocked.json()).error, 'string');
    assert.equal((await route.POST(cartPost(endpoint, '203.0.113.81', addBody))).status, 200);
  });
}

test('/api/cart/lines caps the body at 8 KB and lines / lineIds at 50 entries', async () => {
  const route = loadRoute('app/api/cart/lines/route.ts');
  const line = (i) => ({ merchandiseId: `gid://shopify/ProductVariant/${i}`, quantity: 1 });
  const big = JSON.stringify({ action: 'add', cartId: cart.id, lines: [line(1)], pad: 'x'.repeat(validation.MAX_CART_BODY_BYTES) });
  assert.equal((await route.POST(cartPost('/api/cart/lines', '198.51.100.90', big))).status, 413);
  const tooMany = JSON.stringify({ action: 'add', cartId: cart.id, lines: Array.from({ length: 51 }, (_, i) => line(i)) });
  assert.ok(tooMany.length < validation.MAX_CART_BODY_BYTES);
  assert.equal((await route.POST(cartPost('/api/cart/lines', '198.51.100.91', tooMany))).status, 400);
  const tooManyIds = JSON.stringify({ action: 'remove', cartId: cart.id, lineIds: Array.from({ length: 51 }, (_, i) => `gid://shopify/CartLine/${i}`) });
  assert.equal((await route.POST(cartPost('/api/cart/lines', '198.51.100.92', tooManyIds))).status, 400);
  const ok = JSON.stringify({ action: 'add', cartId: cart.id, lines: Array.from({ length: 50 }, (_, i) => line(i)) });
  assert.equal((await route.POST(cartPost('/api/cart/lines', '198.51.100.93', ok))).status, 200);
  assert.equal((await route.POST(cartPost('/api/cart/lines', '198.51.100.94', '{not json'))).status, 400);
  assert.equal((await route.POST(cartPost('/api/cart/lines', '198.51.100.95', 'null'))).status, 400);
});

test('cart validation helpers refuse oversized arrays instead of truncating them', async () => {
  const lines = Array.from({ length: 51 }, (_, i) => ({ merchandiseId: `gid://shopify/ProductVariant/${i}`, quantity: 1 }));
  assert.deepEqual(validation.normalizeCartLines(lines), []);
  assert.equal(validation.normalizeCartLines(lines.slice(0, 50)).length, 50);
  assert.deepEqual(validation.normalizeLineIds(Array.from({ length: 51 }, (_, i) => `gid://shopify/CartLine/${i}`)), []);
  const streamed = new Request(`${SITE}/x`, { method: 'POST', body: new ReadableStream({ start(c) { for (let i = 0; i < 20; i++) c.enqueue(new Uint8Array(1024)); c.close(); } }), duplex: 'half' });
  assert.deepEqual(await validation.readJsonBody(streamed), { ok: false, status: 413 }, 'cap enforced without trusting content-length');
});

test('/api/visitors: 30 per IP per 10 minutes, then 429 with { count: null }', async () => {
  let recorded = 0;
  const route = loadRoute('app/api/visitors/route.ts', {
    'node:crypto': { randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    'next/server': nextServer,
    '@/lib/audience': { recordVisit: async () => { recorded++; return null; } },
  });
  const request = (ip) => new nextServer.NextRequest(`${SITE}/api/visitors`, { method: 'POST', headers: { origin: SITE, 'x-forwarded-for': ip } });
  for (let i = 0; i < 30; i++) assert.equal((await route.POST(request('203.0.113.99'))).status, 200);
  const blocked = await route.POST(request('203.0.113.99'));
  assert.equal(blocked.status, 429);
  assert.deepEqual(await blocked.json(), { count: null });
  assert.equal(recorded, 30);
});
