import assert from 'node:assert/strict';
import test from 'node:test';
import { createLaunchSignupClient, resetLaunchSignupTokenCache, saveLaunchSignup } from '../lib/shopify-launch-signups.js';

const env = { SHOPIFY_STORE_DOMAIN: 'test.myshopify.com', SHOPIFY_APP_CLIENT_ID: 'client', SHOPIFY_APP_CLIENT_SECRET: 'secret' };

/** Fake Shopify: counts token mints, issues numbered tokens, rejects `rejectToken`. `expiresIn: null` omits expires_in. */
function fakeShopify({ expiresIn = 86399, rejectToken = null } = {}) {
  const state = { mints: 0, usedTokens: [] };
  state.send = async (url, options) => {
    if (url.endsWith('/admin/oauth/access_token')) {
      state.mints++;
      return Response.json(expiresIn === null ? { access_token: `token-${state.mints}` } : { access_token: `token-${state.mints}`, expires_in: expiresIn });
    }
    const token = options.headers['X-Shopify-Access-Token'];
    state.usedTokens.push(token);
    if (token === rejectToken) return Response.json({ errors: 'Invalid API key or access token' }, { status: 401 });
    const { query } = JSON.parse(options.body);
    if (query.includes('metaobjectDefinitionByType')) return Response.json({ data: { metaobjectDefinitionByType: { access: { storefront: 'NONE' } } } });
    return Response.json({ data: { metaobjectUpsert: { metaobject: { id: 'gid://shopify/Metaobject/1' }, userErrors: [] } } });
  };
  return state;
}

test('reuses one client_credentials token across signups instead of minting per request', async () => {
  resetLaunchSignupTokenCache();
  const shop = fakeShopify();
  for (let i = 0; i < 5; i++) await saveLaunchSignup(`visitor${i}@example.org`, env, shop.send);
  assert.equal(shop.mints, 1);
  assert.ok(shop.usedTokens.every((token) => token === 'token-1'));
});

test('concurrent cold requests share a single in-flight mint', async () => {
  resetLaunchSignupTokenCache();
  const shop = fakeShopify();
  await Promise.all(Array.from({ length: 10 }, (_, i) => saveLaunchSignup(`v${i}@example.org`, env, shop.send)));
  assert.equal(shop.mints, 1);
});

test('refreshes shortly before expiry, never after it', async () => {
  resetLaunchSignupTokenCache();
  const shop = fakeShopify({ expiresIn: 3600 });
  let clock = 0;
  const now = () => clock;
  await createLaunchSignupClient(env, shop.send, now);
  clock = 3600_000 - 5 * 60_000 - 1; // just inside the refresh margin
  await createLaunchSignupClient(env, shop.send, now);
  assert.equal(shop.mints, 1);
  clock = 3600_000 - 5 * 60_000; // margin reached: mint again
  await createLaunchSignupClient(env, shop.send, now);
  assert.equal(shop.mints, 2);
});

test('does not cache a token without a usable expiry', async () => {
  resetLaunchSignupTokenCache();
  const shop = fakeShopify({ expiresIn: null });
  await saveLaunchSignup('a@example.org', env, shop.send);
  await saveLaunchSignup('b@example.org', env, shop.send);
  assert.equal(shop.mints, 2);
});

test('different credentials or shop never reuse a cached token', async () => {
  resetLaunchSignupTokenCache();
  const shop = fakeShopify();
  await createLaunchSignupClient(env, shop.send);
  await createLaunchSignupClient({ ...env, SHOPIFY_APP_CLIENT_SECRET: 'rotated' }, shop.send);
  await createLaunchSignupClient({ ...env, SHOPIFY_APP_CLIENT_ID: 'other' }, shop.send);
  assert.equal(shop.mints, 3);
});

test('a 401 from the Admin API evicts the cached token so the next request re-mints', async () => {
  resetLaunchSignupTokenCache();
  const shop = fakeShopify({ rejectToken: 'token-1' });
  await assert.rejects(saveLaunchSignup('a@example.org', env, shop.send));
  await saveLaunchSignup('a@example.org', env, shop.send);
  assert.equal(shop.mints, 2);
  assert.equal(shop.usedTokens.at(-1), 'token-2');
});

test('failed mints are not cached and the token never appears in logs', async () => {
  resetLaunchSignupTokenCache();
  const logged = [];
  const original = { error: console.error, log: console.log, warn: console.warn, info: console.info };
  for (const level of Object.keys(original)) console[level] = (...args) => logged.push(args.map(String).join(' '));
  try {
    let mints = 0;
    const failing = async (url) => {
      if (url.endsWith('/access_token')) { mints++; return Response.json({ error: 'invalid_client' }, { status: 401 }); }
      throw new Error('unexpected');
    };
    await assert.rejects(saveLaunchSignup('a@example.org', env, failing));
    await assert.rejects(saveLaunchSignup('a@example.org', env, failing));
    assert.equal(mints, 2);
    const shop = fakeShopify();
    await saveLaunchSignup('a@example.org', env, shop.send);
  } finally {
    Object.assign(console, original);
  }
  assert.equal(logged.some((line) => line.includes('token-1') || line.includes('secret')), false);
});
