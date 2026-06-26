import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  getSiteOrigin,
  sanitizeRichHtml,
  shouldUseShopifyFallbacks,
} from '../lib/runtime.js';
import {
  isAllowedRequestOrigin,
  normalizeCartId,
  normalizeCartLines,
} from '../lib/cart-validation.js';

test('site origin defaults to canonical lapropagande.net', () => {
  assert.equal(getSiteOrigin({}), 'https://www.lapropagande.net');
});

test('Shopify fallbacks are disabled unless explicitly enabled', () => {
  assert.equal(shouldUseShopifyFallbacks({}), false);
  assert.equal(shouldUseShopifyFallbacks({ ENABLE_SHOPIFY_FALLBACKS: 'true' }), true);
  assert.equal(shouldUseShopifyFallbacks({ ENABLE_SHOPIFY_FALLBACKS: '1' }), true);
});

test('sanitizes Shopify rich HTML before rendering', () => {
  const html = sanitizeRichHtml(
    '<p onclick="alert(1)">Safe <strong>copy</strong><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="https://cdn.shopify.com/x.jpg" onerror="alert(1)"></p>'
  );

  assert.equal(html.includes('<script'), false);
  assert.equal(html.includes('onclick'), false);
  assert.equal(html.includes('onerror'), false);
  assert.equal(html.includes('javascript:'), false);
  assert.equal(html.includes('<strong>copy</strong>'), true);
  assert.equal(html.includes('src="https://cdn.shopify.com/x.jpg"'), true);
});

test('cart validation rejects malformed ids and oversized quantities', () => {
  assert.equal(normalizeCartId('gid://shopify/Cart/abc123'), 'gid://shopify/Cart/abc123');
  assert.equal(normalizeCartId('not a gid'), null);

  assert.deepEqual(
    normalizeCartLines([
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 },
      { merchandiseId: 'not-a-gid', quantity: 2 },
      { merchandiseId: 'gid://shopify/ProductVariant/2', quantity: 100 },
    ]),
    [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 }]
  );
});

test('cart origin guard only allows same-site requests when origin is present', () => {
  assert.equal(isAllowedRequestOrigin(null, 'https://www.lapropagande.net'), true);
  assert.equal(isAllowedRequestOrigin('https://www.lapropagande.net', 'https://www.lapropagande.net'), true);
  assert.equal(isAllowedRequestOrigin('https://evil.example', 'https://www.lapropagande.net'), false);
});

test('Shopify runtime code does not accept public token aliases', () => {
  const source = readFileSync(new URL('../lib/shopify.ts', import.meta.url), 'utf8');

  assert.equal(source.includes('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'), false);
  assert.equal(source.includes('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN'), false);
});

test('canonical production URLs do not point at lapropagande.com', () => {
  for (const path of ['../app/sitemap.ts', '../app/robots.ts', '../scripts/shopify-sync-placeholder-media.mjs']) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.equal(source.includes('lapropagande.com'), false, path);
  }
});
