import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import nextConfig from '../next.config.mjs';

const headerMap = async () => {
  const rules = await nextConfig.headers();
  const catchAll = rules.find((rule) => rule.source === '/:path*');
  assert.ok(catchAll, 'security headers apply to every path');
  return Object.fromEntries(catchAll.headers.map(({ key, value }) => [key.toLowerCase(), value]));
};

test('security headers: anti-framing, nosniff, referrer and permissions policy are enforced', async () => {
  const headers = await headerMap();
  assert.equal(nextConfig.poweredByHeader, false);
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.equal(headers['content-security-policy'], "frame-ancestors 'none'", 'only frame-ancestors is enforced for now');
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
    assert.match(headers['permissions-policy'], new RegExp(`(^|, )${feature}=\\(\\)`), feature);
  }
});

test('CSP is report-only and covers every external origin the site uses', async () => {
  const headers = await headerMap();
  const csp = headers['content-security-policy-report-only'];
  assert.ok(csp, 'report-only CSP present');
  const directives = Object.fromEntries(csp.split(';').map((part) => part.trim().split(/\s+/)).map(([name, ...values]) => [name, values]));
  assert.deepEqual(directives['default-src'], ["'self'"]);
  assert.deepEqual(directives['frame-ancestors'], ["'none'"]);
  assert.deepEqual(directives['object-src'], ["'none'"]);
  assert.deepEqual(directives['base-uri'], ["'self'"]);
  assert.ok(directives['script-src'].includes("'self'"));
  assert.ok(directives['script-src'].includes("'unsafe-inline'"), 'Next 14 inline bootstrap scripts');
  assert.ok(directives['style-src'].includes("'unsafe-inline'"));
  for (const source of ["'self'", 'data:', 'blob:', 'https://cdn.shopify.com', 'https://www.instagram.com']) {
    assert.ok(directives['img-src'].includes(source), `img-src ${source}`);
  }
  // Every next/image remote host is also allowed for direct <img> in Shopify rich HTML.
  for (const { hostname } of nextConfig.images.remotePatterns) {
    const cspHost = `https://${hostname.replace(/^\*\*\./, '*.')}`;
    assert.ok(directives['img-src'].includes(cspHost), `img-src ${cspHost}`);
  }
  assert.ok(directives['frame-src'].includes('https://www.instagram.com'), 'Instagram embeds');
  assert.ok(directives['font-src'].includes("'self'"));
  assert.ok(directives['media-src'].includes("'self'"));
  assert.ok(directives['connect-src'].includes("'self'"));
});

function loadCommerce(value) {
  const { outputText } = ts.transpileModule(readFileSync(new URL('../lib/commerce.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const env = value === undefined ? {} : { NEXT_PUBLIC_COMMERCE_ENABLED: value };
  vm.runInNewContext(outputText, { exports, process: { env } });
  return exports.COMMERCE_ENABLED;
}

test('commerce fails closed: only the exact string "true" enables ordering', () => {
  assert.equal(loadCommerce(undefined), false, 'unset');
  assert.equal(loadCommerce(''), false, 'empty');
  assert.equal(loadCommerce('false'), false);
  assert.equal(loadCommerce('FALSE'), false);
  assert.equal(loadCommerce('0'), false);
  assert.equal(loadCommerce('ture'), false, 'typo');
  assert.equal(loadCommerce('True'), false);
  assert.equal(loadCommerce('true'), true);
});

test('.env.example ships commerce disabled', () => {
  const example = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  assert.match(example, /^NEXT_PUBLIC_COMMERCE_ENABLED=false$/m);
});

test('Shopify API version fallback stays in sync with the documented .env.example value', () => {
  const source = readFileSync(new URL('../lib/shopify.ts', import.meta.url), 'utf8');
  const example = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  for (const name of ['SHOPIFY_STOREFRONT_API_VERSION', 'SHOPIFY_ADMIN_API_VERSION']) {
    const documented = new RegExp(`^${name}=(\\S+)$`, 'm').exec(example)?.[1];
    const fallback = new RegExp(`process\\.env\\.${name} \\?\\? process\\.env\\.SHOPIFY_API_VERSION \\?\\? '([^']+)'`).exec(source)?.[1];
    assert.ok(documented && fallback, name);
    assert.equal(fallback, documented, name);
  }
});
