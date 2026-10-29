import { createHash } from 'node:crypto';

export const LAUNCH_SIGNUP_TYPE = 'lp_launch_signup';

/** Uses the existing app's credentials; never returns credentials or subscriber fields to visitors. */
export async function createLaunchSignupClient(env = process.env, send = fetch) {
  const domain = env.SHOPIFY_STORE_DOMAIN;
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(domain || '') || !env.SHOPIFY_APP_CLIENT_ID || !env.SHOPIFY_APP_CLIENT_SECRET) throw new Error('Signup storage is not configured');
  const auth = await send(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.SHOPIFY_APP_CLIENT_ID, client_secret: env.SHOPIFY_APP_CLIENT_SECRET }),
    signal: AbortSignal.timeout(10000), redirect: 'error',
  });
  const token = await auth.json();
  if (!auth.ok || !token.access_token) throw new Error('Signup authentication failed');
  return async (query, variables = {}) => {
    const response = await send(`https://${domain}/admin/api/2026-07/graphql.json`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token.access_token },
      body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(10000), redirect: 'error',
    });
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
