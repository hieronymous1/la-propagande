// Read-only audit; writes no customer, catalog or CMS records.
const env = process.env;
const endpoint = `https://${env.SHOPIFY_STORE_DOMAIN}/api/${env.SHOPIFY_STOREFRONT_API_VERSION || '2024-01'}/graphql.json`;
async function query(query) {
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': env.SHOPIFY_STOREFRONT_ACCESS_TOKEN }, body: JSON.stringify({ query }), signal: AbortSignal.timeout(20000) });
  return response.json();
}
const results = await Promise.allSettled([
  query('{blog(handle:"news"){articles(first:30){nodes{title handle contentHtml tags}}}}'),
  query('{metaobjects(type:"archive_entry",first:100){nodes{handle fields{key value}}}}'),
  query('{metaobjects(type:"about_section",first:100){nodes{handle fields{key value}}}}'),
]);
for (let i = 0; i < results.length; i++) {
  const result = results[i];
  console.log(JSON.stringify({ kind: ['blog', 'archive', 'about'][i], result: result.status === 'fulfilled' ? result.value : String(result.reason) }));
}
