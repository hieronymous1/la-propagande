import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const validation = require('../lib/cart-validation.js');
const cart = { id: 'gid://shopify/Cart/test-cart', totalQuantity: 1 };
function loadRoute(path) {
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const imports = {
    '@/lib/commerce': { COMMERCE_ENABLED: true },
    'next/server': { NextResponse: Response },
    '@/lib/cart-validation': validation,
    '@/lib/runtime': { getSiteOrigin: () => 'https://www.lapropagande.net' },
    '@/lib/queries/cart': { createCart: async () => cart, addToCart: async () => cart },
  };
  vm.runInNewContext(outputText, { exports, URL, console, require: name => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  } });
  return exports;
}

for (const path of ['app/api/cart/route.ts', 'app/api/cart/lines/route.ts']) {
  const route = loadRoute(path);
  const endpoint = path.includes('/lines/') ? '/api/cart/lines' : '/api/cart';
  const request = (site, origin = site) => new Request(`${site}${endpoint}`, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'add', cartId: cart.id, lines: [{ merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 }] }),
  });
  test(`${endpoint} accepts same-origin cart requests on canonical, apex and preview hosts`, async () => {
    for (const site of ['https://www.lapropagande.net', 'https://lapropagande.net', 'https://lapropagande-preview.vercel.app']) {
      const response = await route.POST(request(site));
      assert.equal(response.status, 200, site);
      assert.equal((await response.json()).cart.id, cart.id);
    }
  });
  test(`${endpoint} rejects cross-site cart requests on every deployment`, async () => {
    for (const site of ['https://www.lapropagande.net', 'https://lapropagande-preview.vercel.app']) {
      assert.equal((await route.POST(request(site, 'https://other.example'))).status, 403);
    }
  });
}
