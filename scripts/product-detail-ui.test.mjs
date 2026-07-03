import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const source = readFileSync(resolve('components/product/ProductDetail.tsx'), 'utf8');

test('product detail renders variants as one controlled dropdown', () => {
  assert.match(source, /<select[\s\S]*value=\{selectedVariant\?\.id \?\? ''\}/);
  assert.match(source, /aria-label="Select variant"/);
  assert.match(source, /variants\.map\(\(variant\) => \(\s*<option/);
  assert.doesNotMatch(source, /variants\.map\(\(variant\) => \(\s*<button/);
});
