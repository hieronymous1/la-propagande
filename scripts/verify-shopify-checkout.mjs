import { writeFile } from 'node:fs/promises';

// Creates a cart with one available variant; never submits checkout or places an order.
const env = process.env;
async function query(query, variables) {
  const response = await fetch(`https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_STOREFRONT_API_VERSION || '2024-01'}/graphql.json`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN },
    body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(20000),
  });
  const result = await response.json();
  if (!response.ok || result.errors) throw new Error(JSON.stringify(result.errors || response.status));
  return result.data;
}
const products = await query('{shop{primaryDomain{url}} products(first:20){nodes{title variants(first:20){nodes{id availableForSale}}}}}');
const product = products.products.nodes.find(product => product.variants.nodes.some(variant => variant.availableForSale));
if (!product) throw new Error('No available variant to verify');
const variant = product.variants.nodes.find(variant => variant.availableForSale);
const result = await query('mutation($variant:ID!){cartCreate(input:{lines:[{merchandiseId:$variant,quantity:1}]}){cart{checkoutUrl totalQuantity} userErrors{message}}}', { variant: variant.id });
if (!result.cartCreate.cart || result.cartCreate.userErrors.length) throw new Error(JSON.stringify(result.cartCreate.userErrors));
const checkoutUrl = result.cartCreate.cart.checkoutUrl;
await writeFile('/tmp/propagande-test-checkout-url.txt', checkoutUrl, { mode: 0o600 });
const response = await fetch(checkoutUrl, { signal: AbortSignal.timeout(20000) });
const html = await response.text();
const final = new URL(response.url);
console.log(JSON.stringify({ primaryDomain: products.shop.primaryDomain.url, product: product.title, quantity: result.cartCreate.cart.totalQuantity, checkoutHost: new URL(checkoutUrl).host, finalHost: final.host, finalPath: final.pathname, status: response.status, title: html.match(/<title>([\s\S]*?)<\/title>/)?.[1], passwordGate: /\/password(?:\?|$)/.test(response.url), checkoutPage: /\/checkouts\//.test(final.pathname) }, null, 2));
