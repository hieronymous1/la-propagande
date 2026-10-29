import { createHash } from 'node:crypto';

export const LAUNCH_SIGNUP_TYPE = 'lp_launch_signup';

// Refresh this long before Shopify's stated expiry so an in-flight request never uses a stale token.
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

/**
 * Module-scope cache of the client_credentials access token, one entry per warm
 * serverless instance. Keyed by shop, client id and a hash of the secret so a
 * rotated secret or different shop never reuses an old token. The token itself
 * is never logged or returned to visitors.
 * @type {{ key: string, token: string, expiresAt: number } | null}
 */
let cachedToken = null;
/** @type {{ key: string, promise: Promise<string> } | null} */
let pendingToken = null;

/** Test hook: forget any cached or in-flight token. */
export function resetLaunchSignupTokenCache() {
  cachedToken = null;
  pendingToken = null;
}

async function mintToken(domain, env, send, now) {
  const auth = await send(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.SHOPIFY_APP_CLIENT_ID, client_secret: env.SHOPIFY_APP_CLIENT_SECRET }),
    signal: AbortSignal.timeout(10000), redirect: 'error',
  });
  const token = await auth.json();
  if (!auth.ok || typeof token.access_token !== 'string' || !token.access_token) throw new Error('Signup authentication failed');
  const lifetimeMs = Number(token.expires_in) * 1000;
  // Without a usable expiry we do not cache: minting again is safer than reusing a token of unknown lifetime.
  return { token: token.access_token, expiresAt: Number.isFinite(lifetimeMs) && lifetimeMs > TOKEN_REFRESH_MARGIN_MS ? now() + lifetimeMs - TOKEN_REFRESH_MARGIN_MS : 0 };
}

async function getAccessToken(domain, env, send, now) {
  const key = [domain, env.SHOPIFY_APP_CLIENT_ID, createHash('sha256').update(String(env.SHOPIFY_APP_CLIENT_SECRET)).digest('hex')].join('\n');
  if (cachedToken && cachedToken.key === key && cachedToken.expiresAt > now()) return cachedToken.token;
  if (pendingToken && pendingToken.key === key) return pendingToken.promise;
  const promise = mintToken(domain, env, send, now).then(({ token, expiresAt }) => {
    cachedToken = expiresAt > now() ? { key, token, expiresAt } : null;
    return token;
  }).finally(() => {
    if (pendingToken?.promise === promise) pendingToken = null;
  });
  pendingToken = { key, promise };
  return promise;
}

/** Uses the existing app's credentials; never returns credentials or subscriber fields to visitors. */
export async function createLaunchSignupClient(env = process.env, send = fetch, now = Date.now) {
  const domain = env.SHOPIFY_STORE_DOMAIN;
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(domain || '') || !env.SHOPIFY_APP_CLIENT_ID || !env.SHOPIFY_APP_CLIENT_SECRET) throw new Error('Signup storage is not configured');
  const accessToken = await getAccessToken(domain, env, send, now);
  return async (query, variables = {}) => {
    const response = await send(`https://${domain}/admin/api/2026-07/graphql.json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken },
      body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(10000), redirect: 'error',
    });
    // A revoked or expired token must not stay cached: the next request mints a fresh one.
    if (response.status === 401 && cachedToken?.token === accessToken) cachedToken = null;
    const result = await response.json();
    if (!response.ok || result.errors?.length || !result.data) throw new Error('Signup storage request failed');
    return result.data;
  };
}

export async function saveLaunchSignup(rawEmail, env = process.env, send = fetch) {
  const email = rawEmail.trim().toLowerCase();
  const admin = await createLaunchSignupClient(env, send);
  const definition = await admin('query SignupPrivacy($type: String!) { metaobjectDefinitionByType(type: $type) { access { storefront } } }', { type: LAUNCH_SIGNUP_TYPE });
  if (definition.metaobjectDefinitionByType?.access?.storefront !== 'NONE') throw new Error('Signup storage must be private');
  const result = await admin(`mutation SaveLaunchSignup($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) { metaobject { id } userErrors { message } }
  }`, {
    handle: { type: LAUNCH_SIGNUP_TYPE, handle: createHash('sha256').update(email).digest('hex') },
    metaobject: { fields: [
      { key: 'email', value: email }, { key: 'consent', value: 'true' },
      { key: 'consented_at', value: new Date().toISOString() }, { key: 'source', value: 'website-launch' },
    ] },
  });
  if (!result.metaobjectUpsert?.metaobject?.id || result.metaobjectUpsert.userErrors?.length) throw new Error('Signup was not saved');
}
