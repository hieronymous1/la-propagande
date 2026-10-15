import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the same option selection helpers used by ProductDetail.
const { outputText } = ts.transpileModule(readFileSync(resolve('lib/product-options.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const exports = {};
vm.runInNewContext(outputText, { exports });
const product = {
  variants: { edges: [
    { node: { id: 'small-black', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'S' }, { name: 'Color', value: 'Black' }], price: { amount: '40', currencyCode: 'USD' } } },
    { node: { id: 'large-black', availableForSale: false, selectedOptions: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'Black' }], price: { amount: '45', currencyCode: 'USD' } } },
    { node: { id: 'large-white', availableForSale: true, selectedOptions: [{ name: 'Size', value: 'L' }, { name: 'Color', value: 'White' }], price: { amount: '50', currencyCode: 'USD' } } },
  ] },
};

test('product size and color select the corresponding variant and price', () => {
  assert.equal(exports.findVariant(product, { Size: 'S', Color: 'Black' }).id, 'small-black');
  const changed = exports.findVariant(product, { Size: 'L', Color: 'White' });
  assert.equal(changed.id, 'large-white');
  assert.equal(changed.price.amount, '50');
  assert.equal(exports.findVariant(product, { Size: 'M', Color: 'Black' }), null);
});

test('availability follows the other selected option rather than unrelated stock', () => {
  assert.equal(exports.isValueAvailable(product, { Size: 'S', Color: 'Black' }, 'Size', 'L'), false);
  assert.equal(exports.isValueAvailable(product, { Size: 'S', Color: 'White' }, 'Size', 'L'), true);
});
