import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PRODUCT_FIELD_ALIASES = [
  'itemCode',
  'statusMeta',
  'origin',
  'summary',
  'category',
  'subcategory',
  'collection',
  'shortDescription',
  'featured',
  'transmission',
  'drop',
  'fileNotes',
];

const PRODUCT_FIELD_KEYS = [
  'item_code',
  'status',
  'origin',
  'summary',
  'category',
  'subcategory',
  'collection',
  'short_description',
  'featured',
  'transmission',
  'drop',
  'file_notes',
];

const ARTICLE_FIELD_KEYS = [
  'transmission_id',
  'channel',
  'status',
  'location',
  'source',
  'gallery',
];

const dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = resolve(dirname, '..');

const REQUIRED_ADMIN_SCOPES = [
  'read_metaobject_definitions',
  'write_metaobject_definitions',
  'read_metaobjects',
  'write_metaobjects',
  'read_products',
  'write_products',
  'read_content',
  'write_content',
];

function loadEnvFile(path = resolve(projectRoot, '.env.local')) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    const value = rawValue.trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function envFlag(name) {
  return process.env[name] ? 'set' : 'missing';
}

async function shopifyFetch({ endpoint, tokenHeader, token, query, variables }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [tokenHeader]: token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join('; '));
  }

  return json.data;
}

async function getAccessScopes({ domain, token, apiVersion }) {
  const response = await fetch(`https://${domain}/admin/oauth/access_scopes.json`, {
    headers: {
      'X-Shopify-Access-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return (json.access_scopes ?? []).map((scope) => scope.handle);
}

async function getClientCredentialsAccessToken({ domain, clientId, clientSecret }) {
  if (!clientId || !clientSecret) return null;

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText} ${body}`);
  }

  const json = await response.json();
  if (!json.access_token) throw new Error('Client credentials response did not include an access_token');
  return json.access_token;
}

function fieldHasValue(field) {
  return Boolean(field?.value?.trim());
}

export function summarizeCoverage(products, aliases = PRODUCT_FIELD_ALIASES) {
  return aliases.reduce((summary, alias) => {
    summary[alias] = {
      filled: products.filter((product) => fieldHasValue(product[alias])).length,
      total: products.length,
    };
    return summary;
  }, {});
}

function metaobjectCount(data, key) {
  return data[key]?.edges?.length ?? 0;
}

function missingDefinitions(definitions, requiredKeys) {
  const existingKeys = new Set(definitions.map((definition) => definition.key));
  return requiredKeys.filter((key) => !existingKeys.has(key));
}

function missingStorefrontAccess(definitions) {
  return definitions
    .filter((definition) => definition.access?.storefront !== 'PUBLIC_READ')
    .map((definition) => definition.key);
}

async function verifyStorefront({ domain, token, apiVersion, namespace, aboutType, locationType, archiveType, blogHandle }) {
  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
  const common = {
    endpoint,
    token,
    tokenHeader: 'X-Shopify-Storefront-Access-Token',
  };

  const productsData = await shopifyFetch({
    ...common,
    variables: { namespace },
    query: `
      query VerifyProducts($namespace: String!) {
        products(first: 100) {
          edges {
            node {
              handle
              title
              images(first: 1) {
                edges { node { url } }
              }
              itemCode: metafield(namespace: $namespace, key: "item_code") { value }
              statusMeta: metafield(namespace: $namespace, key: "status") { value }
              origin: metafield(namespace: $namespace, key: "origin") { value }
              summary: metafield(namespace: $namespace, key: "summary") { value }
              category: metafield(namespace: $namespace, key: "category") { value }
              subcategory: metafield(namespace: $namespace, key: "subcategory") { value }
              collection: metafield(namespace: $namespace, key: "collection") { value }
              shortDescription: metafield(namespace: $namespace, key: "short_description") { value }
              featured: metafield(namespace: $namespace, key: "featured") { value }
              transmission: metafield(namespace: $namespace, key: "transmission") { value }
              drop: metafield(namespace: $namespace, key: "drop") { value }
              fileNotes: metafield(namespace: $namespace, key: "file_notes") { value }
            }
          }
        }
      }
    `,
  });

  const metaobjectsData = await shopifyFetch({
    ...common,
    variables: { aboutType, locationType, archiveType },
    query: `
      query VerifyMetaobjects($aboutType: String!, $locationType: String!, $archiveType: String!) {
        about: metaobjects(first: 100, type: $aboutType) {
          edges { node { id fields { key value } } }
        }
        locations: metaobjects(first: 100, type: $locationType) {
          edges { node { id fields { key value } } }
        }
        archive: metaobjects(first: 100, type: $archiveType) {
          edges { node { id fields { key value } } }
        }
      }
    `,
  });

  const blogData = await shopifyFetch({
    ...common,
    variables: { handle: blogHandle, namespace },
    query: `
      query VerifyBlog($handle: String!, $namespace: String!) {
        blog(handle: $handle) {
          articles(first: 20) {
            edges {
              node {
                handle
                title
                excerpt
                contentHtml
                image { url }
                transmissionId: metafield(namespace: $namespace, key: "transmission_id") { value }
                channelMeta: metafield(namespace: $namespace, key: "channel") { value }
                statusMeta: metafield(namespace: $namespace, key: "status") { value }
                locationMeta: metafield(namespace: $namespace, key: "location") { value }
                sourceMeta: metafield(namespace: $namespace, key: "source") { value }
              }
            }
          }
        }
      }
    `,
  });

  const products = productsData.products.edges.map((edge) => edge.node);
  const blogPosts = blogData.blog?.articles.edges.map((edge) => edge.node) ?? [];
  return {
    products,
    blogFound: Boolean(blogData.blog),
    blogPosts,
    blogPostsMissingImages: blogPosts.filter((post) => !post.image?.url),
    blogCoverage: summarizeCoverage(blogPosts, [
      'transmissionId',
      'channelMeta',
      'statusMeta',
      'locationMeta',
      'sourceMeta',
    ]),
    productsMissingImages: products.filter((product) => product.images.edges.length === 0),
    coverage: summarizeCoverage(products),
    metaobjectCounts: {
      about: metaobjectCount(metaobjectsData, 'about'),
      locations: metaobjectCount(metaobjectsData, 'locations'),
      archive: metaobjectCount(metaobjectsData, 'archive'),
    },
  };
}

async function verifyAdmin({ domain, token, apiVersion, namespace, aboutType, locationType, archiveType }) {
  const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;
  const data = await shopifyFetch({
    endpoint,
    token,
    tokenHeader: 'X-Shopify-Access-Token',
    variables: { namespace, aboutType, locationType, archiveType },
    query: `
      query VerifyAdminDefinitions($namespace: String!, $aboutType: String!, $locationType: String!, $archiveType: String!) {
        shop { name }
        productMetafields: metafieldDefinitions(first: 100, ownerType: PRODUCT, namespace: $namespace) {
          edges { node { key namespace type { name } access { storefront } } }
        }
        articleMetafields: metafieldDefinitions(first: 100, ownerType: ARTICLE, namespace: $namespace) {
          edges { node { key namespace type { name } access { storefront } } }
        }
        aboutDefinition: metaobjectDefinitionByType(type: $aboutType) { id type access { storefront } }
        locationDefinition: metaobjectDefinitionByType(type: $locationType) { id type access { storefront } }
        archiveDefinition: metaobjectDefinitionByType(type: $archiveType) { id type access { storefront } }
      }
    `,
  });

  const productDefinitions = data.productMetafields.edges.map((edge) => edge.node);
  const articleDefinitions = data.articleMetafields.edges.map((edge) => edge.node);
  return {
    shopName: data.shop.name,
    missingProductDefinitions: missingDefinitions(productDefinitions, PRODUCT_FIELD_KEYS),
    missingArticleDefinitions: missingDefinitions(articleDefinitions, ARTICLE_FIELD_KEYS),
    productDefinitionsMissingStorefrontAccess: missingStorefrontAccess(productDefinitions),
    articleDefinitionsMissingStorefrontAccess: missingStorefrontAccess(articleDefinitions),
    definitions: {
      about: {
        present: Boolean(data.aboutDefinition),
        storefrontPublic: data.aboutDefinition?.access?.storefront === 'PUBLIC_READ',
      },
      locations: {
        present: Boolean(data.locationDefinition),
        storefrontPublic: data.locationDefinition?.access?.storefront === 'PUBLIC_READ',
      },
      archive: {
        present: Boolean(data.archiveDefinition),
        storefrontPublic: data.archiveDefinition?.access?.storefront === 'PUBLIC_READ',
      },
    },
  };
}

function printCoverage(coverage) {
  for (const [alias, result] of Object.entries(coverage)) {
    console.log(`  ${alias}: ${result.filled}/${result.total}`);
  }
}

async function main() {
  loadEnvFile();

  const domain = requiredEnv('SHOPIFY_STORE_DOMAIN');
  const storefrontToken = requiredEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  const clientId = process.env.SHOPIFY_APP_CLIENT_ID ?? process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_APP_CLIENT_SECRET ?? process.env.SHOPIFY_CLIENT_SECRET;
  let adminToken =
    clientId && clientSecret
      ? null
      : process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const namespace = process.env.SHOPIFY_CONTENT_NAMESPACE ?? 'lap';
  const storefrontApiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? process.env.SHOPIFY_API_VERSION ?? '2024-01';
  const adminApiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? process.env.SHOPIFY_API_VERSION ?? '2024-01';
  const aboutType = process.env.SHOPIFY_ABOUT_METAOBJECT_TYPE ?? 'about_section';
  const locationType = process.env.SHOPIFY_LOCATION_METAOBJECT_TYPE ?? 'location_entry';
  const archiveType = process.env.SHOPIFY_ARCHIVE_METAOBJECT_TYPE ?? 'archive_entry';
  const blogHandle = process.env.SHOPIFY_BLOG_HANDLE ?? 'news';

  console.log(`Shopify CMS verification -> ${domain}`);
  console.log(`Env: storefront token ${envFlag('SHOPIFY_STOREFRONT_ACCESS_TOKEN')}, admin credentials ${adminToken || (clientId && clientSecret) ? 'set' : 'missing'}, namespace ${namespace}`);

  const storefront = await verifyStorefront({
    domain,
    token: storefrontToken,
    apiVersion: storefrontApiVersion,
    namespace,
    aboutType,
    locationType,
    archiveType,
    blogHandle,
  });

  console.log('\nStorefront API');
  console.log(`  products visible: ${storefront.products.length}`);
  console.log(`  products missing image media: ${storefront.productsMissingImages.length}`);
  console.log(`  about metaobjects: ${storefront.metaobjectCounts.about}`);
  console.log(`  location metaobjects: ${storefront.metaobjectCounts.locations}`);
  console.log(`  archive metaobjects: ${storefront.metaobjectCounts.archive}`);
  console.log(`  blog '${blogHandle}': ${storefront.blogFound ? `${storefront.blogPosts.length} post(s)` : 'missing'}`);
  console.log(`  blog posts missing image media: ${storefront.blogPostsMissingImages.length}`);
  console.log('  blog metafield coverage:');
  printCoverage(storefront.blogCoverage);
  console.log('  product metafield coverage:');
  printCoverage(storefront.coverage);

  if (!adminToken) {
    try {
      adminToken = await getClientCredentialsAccessToken({ domain, clientId, clientSecret });
      console.log('\nAdmin API');
      console.log('  using token generated from Shopify app client credentials');
    } catch (error) {
      console.log('\nAdmin API');
      console.log(`  skipped: unable to get Admin token from client credentials: ${error.message}`);
      return;
    }
  } else {
    console.log('\nAdmin API');
  }

  let scopes;
  try {
    scopes = await getAccessScopes({ domain, token: adminToken, apiVersion: adminApiVersion });
    const missingScopes = REQUIRED_ADMIN_SCOPES.filter((scope) => !scopes.includes(scope));
    console.log(`  required setup scope gaps: ${missingScopes.length ? missingScopes.join(', ') : 'none'}`);
    if (missingScopes.length) {
      console.log('  definition verification skipped until the Admin token has the required scopes');
      return;
    }
  } catch (error) {
    console.log(`  unable to read token scopes: ${error.message}`);
  }

  try {
    const admin = await verifyAdmin({
      domain,
      token: adminToken,
      apiVersion: adminApiVersion,
      namespace,
      aboutType,
      locationType,
      archiveType,
    });

    console.log(`  shop: ${admin.shopName}`);
    console.log(`  product definition gaps: ${admin.missingProductDefinitions.length ? admin.missingProductDefinitions.join(', ') : 'none'}`);
    console.log(`  product storefront access gaps: ${admin.productDefinitionsMissingStorefrontAccess.length ? admin.productDefinitionsMissingStorefrontAccess.join(', ') : 'none'}`);
    console.log(`  article definition gaps: ${admin.missingArticleDefinitions.length ? admin.missingArticleDefinitions.join(', ') : 'none'}`);
    console.log(`  article storefront access gaps: ${admin.articleDefinitionsMissingStorefrontAccess.length ? admin.articleDefinitionsMissingStorefrontAccess.join(', ') : 'none'}`);
    console.log(`  about definition: ${admin.definitions.about.present ? 'present' : 'missing'}${admin.definitions.about.present ? `, storefront ${admin.definitions.about.storefrontPublic ? 'PUBLIC_READ' : 'not public'}` : ''}`);
    console.log(`  location definition: ${admin.definitions.locations.present ? 'present' : 'missing'}${admin.definitions.locations.present ? `, storefront ${admin.definitions.locations.storefrontPublic ? 'PUBLIC_READ' : 'not public'}` : ''}`);
    console.log(`  archive definition: ${admin.definitions.archive.present ? 'present' : 'missing'}${admin.definitions.archive.present ? `, storefront ${admin.definitions.archive.storefrontPublic ? 'PUBLIC_READ' : 'not public'}` : ''}`);
  } catch (error) {
    console.log(`  unable to verify definitions: ${error.message}`);
    if (error.message.includes('read_metaobject_definitions')) {
      console.log('  required Admin token scope: read_metaobject_definitions');
    }
    if (error.message.includes('metafield')) {
      console.log('  required Admin token scopes for metafield definitions: read/write access to the owner resource, e.g. read_products/write_products and read_content/write_content');
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
