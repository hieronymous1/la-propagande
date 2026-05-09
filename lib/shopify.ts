const domain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const storefrontApiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? process.env.SHOPIFY_API_VERSION ?? '2024-01';
const adminApiVersion = process.env.SHOPIFY_ADMIN_API_VERSION ?? process.env.SHOPIFY_API_VERSION ?? '2024-01';

interface ShopifyFetchOptions<V> {
  query: string;
  variables?: V;
}

interface ShopifyResponse<T> {
  data: T;
  errors?: { message: string }[];
}

export async function shopifyFetch<T, V = Record<string, unknown>>({
  query,
  variables,
}: ShopifyFetchOptions<V>): Promise<T> {
  if (!domain) {
    throw new Error('SHOPIFY_STORE_DOMAIN environment variable is not set');
  }
  if (!storefrontAccessToken) {
    throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is not set');
  }

  const endpoint = `https://${domain}/api/${storefrontApiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Shopify API request failed: ${response.status} ${response.statusText}`
    );
  }

  const json = (await response.json()) as ShopifyResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`
    );
  }

  return json.data;
}

export async function shopifyAdminFetch<T, V = Record<string, unknown>>({
  query,
  variables,
}: ShopifyFetchOptions<V>): Promise<T> {
  if (!domain) {
    throw new Error('SHOPIFY_STORE_DOMAIN environment variable is not set');
  }
  if (!adminAccessToken) {
    throw new Error('SHOPIFY_ADMIN_API_ACCESS_TOKEN or SHOPIFY_ADMIN_ACCESS_TOKEN environment variable is not set');
  }

  const endpoint = `https://${domain}/admin/api/${adminApiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin API request failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as ShopifyResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(`Shopify Admin GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`);
  }

  return json.data;
}
