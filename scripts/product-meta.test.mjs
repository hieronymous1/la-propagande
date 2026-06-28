import assert from 'node:assert/strict';
import test from 'node:test';

import { extractProductFallbackMeta, parseProductCategory, parseProductStatus, parseFeatured } from '../lib/product-meta.js';

test('parseProductCategory accepts Shopify editor labels', () => {
  assert.equal(parseProductCategory('Tops'), 'tops');
  assert.equal(parseProductCategory('Bottoms'), 'bottoms');
  assert.equal(parseProductCategory('Accessories'), 'accessories');
  assert.equal(parseProductCategory('Custom Jackets'), 'custom-jackets');
});

test('parseProductStatus accepts Shopify editor labels', () => {
  assert.equal(parseProductStatus('Available'), 'AVAILABLE');
  assert.equal(parseProductStatus('In Stock'), 'AVAILABLE');
  assert.equal(parseProductStatus('Sold Out'), 'SOLD_OUT');
  assert.equal(parseProductStatus('Made to Order'), 'COMING_SOON');
});

test('parseFeatured accepts common editor values', () => {
  assert.equal(parseFeatured('true'), true);
  assert.equal(parseFeatured('Yes'), true);
  assert.equal(parseFeatured('0'), false);
  assert.equal(parseFeatured('No'), false);
});

test('extractProductFallbackMeta reads LP fields from product tags', () => {
  assert.deepEqual(
    extractProductFallbackMeta({
      tags: [
        'lp_item_code: LP-001',
        'lp_status: Available',
        'lp_origin: Lebanon',
        'lp_category: Tops',
        'lp_subcategory: Tees',
        'lp_collection: WAKE UP!',
        'lp_transmission: F*CK THE SYSTEM',
        'lp_drop: 01',
        'lp_featured: yes',
      ],
      descriptionHtml: '<p>Body</p>',
    }).meta,
    {
      itemCode: 'LP-001',
      status: 'Available',
      origin: 'Lebanon',
      category: 'Tops',
      subcategory: 'Tees',
      collection: 'WAKE UP!',
      transmission: 'F*CK THE SYSTEM',
      drop: '01',
      featured: 'yes',
    }
  );
});

test('extractProductFallbackMeta reads and removes LP data block from product description', () => {
  const result = extractProductFallbackMeta({
    tags: [],
    descriptionHtml: [
      '<p>Main product copy.</p>',
      '<p>LP DATA:<br>summary: In between regular &amp; relaxed fit<br>short_description: Regular tee fit<br>file_notes: F*CK THE SYSTEM<br>END LP DATA</p>',
    ].join(''),
  });

  assert.equal(result.descriptionHtml, '<p>Main product copy.</p>');
  assert.deepEqual(result.meta, {
    summary: 'In between regular & relaxed fit',
    shortDescription: 'Regular tee fit',
    fileNotes: 'F*CK THE SYSTEM',
  });
});

test('extractProductFallbackMeta derives safe defaults from Shopify description copy', () => {
  const result = extractProductFallbackMeta({
    tags: [],
    descriptionHtml: [
      '<p>/Oversized T-Shirt/</p>',
      '<p>This T-shirt features an oversized fit with dropdown shoulders.</p>',
      '<p>Made in Lebanon</p>',
    ].join(''),
  });

  assert.equal(result.meta.summary, 'This T-shirt features an oversized fit with dropdown shoulders.');
  assert.equal(result.meta.shortDescription, 'Oversized T-Shirt');
  assert.equal(result.meta.origin, 'Lebanon');
});
