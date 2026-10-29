import test from 'node:test';
import assert from 'node:assert/strict';
import { saveLaunchSignup } from '../lib/shopify-launch-signups.js';
const env = { SHOPIFY_STORE_DOMAIN: 'test.myshopify.com', SHOPIFY_APP_CLIENT_ID: 'client', SHOPIFY_APP_CLIENT_SECRET: 'secret' };

test('privately saves consented emails with a stable deduplicating handle and no form-provider request', async () => {
  const handles = [];
  const send = async (url, options) => {
    assert.equal(new URL(url).hostname, 'test.myshopify.com');
    if (url.endsWith('/access_token')) return Response.json({ access_token: 'private-token', expires_in: 86399 });
    const body = JSON.parse(options.body);
    if (body.query.includes('metaobjectDefinitionByType')) return Response.json({ data: { metaobjectDefinitionByType: { access: { storefront: 'NONE' } } } });
    assert.equal(options.headers['X-Shopify-Access-Token'], 'private-token');
    handles.push(body.variables.handle.handle);
    const fields = Object.fromEntries(body.variables.metaobject.fields.map(f => [f.key, f.value]));
    assert.equal(fields.email, 'visitor@example.org');
    assert.equal(fields.consent, 'true');
    assert.equal(fields.source, 'website-launch');
    assert.ok(!handles.at(-1).includes('@'));
    return Response.json({ data: { metaobjectUpsert: { metaobject: { id: 'gid://shopify/Metaobject/123' }, userErrors: [] } } });
  };
  await saveLaunchSignup(' Visitor@Example.org ', env, send);
  await saveLaunchSignup('visitor@example.org', env, send);
  assert.equal(handles.length, 2);
  assert.equal(handles[0], handles[1]);
});

test('never writes email to a publicly readable or missing definition', async () => {
  for (const definition of [null, { access: { storefront: 'PUBLIC_READ' } }]) {
    let writes = 0;
    await assert.rejects(saveLaunchSignup('visitor@example.org', env, async (url, options) => {
      if (url.endsWith('/access_token')) return Response.json({ access_token: 'private-token' });
      const { query } = JSON.parse(options.body);
      if (query.includes('metaobjectDefinitionByType')) return Response.json({ data: { metaobjectDefinitionByType: definition } });
      writes++; return Response.json({});
    }));
    assert.equal(writes, 0);
  }
});

test('Shopify errors and rejected writes never count as saved signups', async () => {
  for (const result of [{ errors: [{ message: 'denied' }] }, { data: { metaobjectUpsert: { metaobject: null, userErrors: [{ message: 'invalid' }] } } }]) {
    await assert.rejects(saveLaunchSignup('visitor@example.org', env, async (url, options) => {
      if (url.endsWith('/access_token')) return Response.json({ access_token: 'private-token' });
      if (JSON.parse(options.body).query.includes('metaobjectDefinitionByType')) return Response.json({ data: { metaobjectDefinitionByType: { access: { storefront: 'NONE' } } } });
      return Response.json(result);
    }));
  }
});
