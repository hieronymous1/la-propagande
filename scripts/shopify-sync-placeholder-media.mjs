const domain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? process.env.SHOPIFY_API_VERSION ?? '2024-01';
const siteOrigin = (process.env.SHOPIFY_SITE_ORIGIN ?? 'https://lapropagande.com').replace(/\/$/, '');

if (!domain) {
  throw new Error('SHOPIFY_STORE_DOMAIN is required');
}

if (!accessToken) {
  throw new Error('SHOPIFY_ADMIN_API_ACCESS_TOKEN or SHOPIFY_ADMIN_ACCESS_TOKEN is required');
}

const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;
const placeholderPaths = [
  '/images/placeholders/product-01.svg',
  '/images/placeholders/product-02.svg',
  '/images/placeholders/product-03.svg',
  '/images/placeholders/product-04.svg',
  '/images/placeholders/product-05.svg',
  '/images/placeholders/product-06.svg',
];

async function shopifyAdminFetch(query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin API request failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(', '));
  }

  return json.data;
}

function pickPlaceholder(handle) {
  let total = 0;
  for (const char of handle) total += char.charCodeAt(0);
  return `${siteOrigin}${placeholderPaths[total % placeholderPaths.length]}`;
}

async function fetchProducts() {
  const query = `
    query ProductsForPlaceholderSync {
      products(first: 100) {
        edges {
          node {
            id
            handle
            title
            media(first: 10) {
              edges {
                node {
                  __typename
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyAdminFetch(query);
  return data.products.edges.map((edge) => edge.node);
}

async function attachPlaceholder(product) {
  const mutation = `
    mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          alt
          mediaContentType
          status
        }
        mediaUserErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId: product.id,
    media: [
      {
        alt: `${product.title} placeholder image`,
        mediaContentType: 'IMAGE',
        originalSource: pickPlaceholder(product.handle),
      },
    ],
  };

  const data = await shopifyAdminFetch(mutation, variables);
  const errors = data.productCreateMedia.mediaUserErrors ?? [];
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join(', '));
  }
}

async function main() {
  const products = await fetchProducts();
  const missingMedia = products.filter(
    (product) => !product.media.edges.some((edge) => edge.node.__typename === 'MediaImage')
  );

  if (missingMedia.length === 0) {
    console.log('No products are missing image media.');
    return;
  }

  for (const product of missingMedia) {
    await attachPlaceholder(product);
    console.log(`Attached placeholder media to ${product.handle}`);
  }

  console.log(`Updated ${missingMedia.length} products.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
