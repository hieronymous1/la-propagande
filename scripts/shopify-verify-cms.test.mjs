import assert from 'node:assert/strict';
import test from 'node:test';

import { summarizeCoverage } from './shopify-verify-cms.mjs';

test('summarizeCoverage reports filled metafields by key', () => {
  const products = [
    {
      itemCode: { value: 'LP-001' },
      summary: { value: 'Field jacket' },
      featured: { value: 'true' },
    },
    {
      itemCode: { value: '' },
      summary: null,
      featured: { value: 'false' },
    },
  ];

  assert.deepEqual(summarizeCoverage(products, ['itemCode', 'summary', 'featured']), {
    itemCode: { filled: 1, total: 2 },
    summary: { filled: 1, total: 2 },
    featured: { filled: 2, total: 2 },
  });
});
