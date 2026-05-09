import { shopifyFetch } from '../shopify';
import type { Product, ProductMeta, ProductStatus } from '../types';

const CONTENT_NAMESPACE = process.env.SHOPIFY_CONTENT_NAMESPACE || 'lap';

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  productType
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 10) {
    edges {
      node {
        url
        altText
        width
        height
      }
    }
  }
  variants(first: 20) {
    edges {
      node {
        id
        title
        availableForSale
        price {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  itemCode: metafield(namespace: "${CONTENT_NAMESPACE}", key: "item_code") {
    value
  }
  statusMeta: metafield(namespace: "${CONTENT_NAMESPACE}", key: "status") {
    value
  }
  origin: metafield(namespace: "${CONTENT_NAMESPACE}", key: "origin") {
    value
  }
  summary: metafield(namespace: "${CONTENT_NAMESPACE}", key: "summary") {
    value
  }
  category: metafield(namespace: "${CONTENT_NAMESPACE}", key: "category") {
    value
  }
  subcategory: metafield(namespace: "${CONTENT_NAMESPACE}", key: "subcategory") {
    value
  }
  collection: metafield(namespace: "${CONTENT_NAMESPACE}", key: "collection") {
    value
  }
  shortDescription: metafield(namespace: "${CONTENT_NAMESPACE}", key: "short_description") {
    value
  }
  featured: metafield(namespace: "${CONTENT_NAMESPACE}", key: "featured") {
    value
  }
  transmission: metafield(namespace: "${CONTENT_NAMESPACE}", key: "transmission") {
    value
  }
  drop: metafield(namespace: "${CONTENT_NAMESPACE}", key: "drop") {
    value
  }
  fileNotes: metafield(namespace: "${CONTENT_NAMESPACE}", key: "file_notes") {
    value
  }
`;

interface MetafieldValue {
  value: string | null;
}

type RawProduct = Product & {
  itemCode?: MetafieldValue | null;
  statusMeta?: MetafieldValue | null;
  origin?: MetafieldValue | null;
  summary?: MetafieldValue | null;
  category?: MetafieldValue | null;
  subcategory?: MetafieldValue | null;
  collection?: MetafieldValue | null;
  shortDescription?: MetafieldValue | null;
  featured?: MetafieldValue | null;
  transmission?: MetafieldValue | null;
  drop?: MetafieldValue | null;
  fileNotes?: MetafieldValue | null;
};

interface GetProductsData {
  products: {
    edges: { node: RawProduct }[];
  };
}

interface GetProductByHandleData {
  productByHandle: RawProduct | null;
}

function fieldValue(field?: MetafieldValue | null): string | undefined {
  return field?.value?.trim() || undefined;
}

function parseStatus(value?: string): ProductStatus | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (
    normalized === 'AVAILABLE' ||
    normalized === 'LIMITED' ||
    normalized === 'SOLD_OUT' ||
    normalized === 'COMING_SOON' ||
    normalized === 'ARCHIVE'
  ) {
    return normalized;
  }
  return undefined;
}

function parseFeatured(value?: string): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return undefined;
}

function withLpMeta(product: RawProduct): Product {
  const meta: ProductMeta = {
    itemCode: fieldValue(product.itemCode) ?? product.lpMeta?.itemCode ?? '',
    status: parseStatus(fieldValue(product.statusMeta)) ?? product.lpMeta?.status ?? 'AVAILABLE',
    origin: fieldValue(product.origin) ?? product.lpMeta?.origin ?? 'HYBRID NODE',
    summary: fieldValue(product.summary) ?? product.lpMeta?.summary ?? product.description ?? '',
  };

  const category = fieldValue(product.category);
  if (category === 'tops' || category === 'bottoms' || category === 'accessories' || category === 'custom-jackets') {
    meta.category = category;
  } else if (product.lpMeta?.category) {
    meta.category = product.lpMeta.category;
  }

  const subcategory = fieldValue(product.subcategory);
  if (subcategory) meta.subcategory = subcategory;
  else if (product.lpMeta?.subcategory) meta.subcategory = product.lpMeta.subcategory;

  const collection = fieldValue(product.collection);
  if (collection) meta.collection = collection;
  else if (product.lpMeta?.collection) meta.collection = product.lpMeta.collection;

  const shortDescription = fieldValue(product.shortDescription);
  if (shortDescription) meta.shortDescription = shortDescription;
  else if (product.lpMeta?.shortDescription) meta.shortDescription = product.lpMeta.shortDescription;

  const featured = parseFeatured(fieldValue(product.featured));
  if (featured !== undefined) meta.featured = featured;
  else if (product.lpMeta?.featured !== undefined) meta.featured = product.lpMeta.featured;

  const transmission = fieldValue(product.transmission);
  if (transmission) meta.transmission = transmission;
  else if (product.lpMeta?.transmission) meta.transmission = product.lpMeta.transmission;

  const drop = fieldValue(product.drop);
  if (drop) meta.drop = drop;
  else if (product.lpMeta?.drop) meta.drop = product.lpMeta.drop;

  const fileNotes = fieldValue(product.fileNotes);
  if (fileNotes) meta.fileNotes = fileNotes;
  else if (product.lpMeta?.fileNotes) meta.fileNotes = product.lpMeta.fileNotes;

  return { ...product, lpMeta: meta };
}

export async function getProducts(): Promise<Product[]> {
  const query = `
    query GetProducts {
      products(first: 50) {
        edges {
          node {
            ${PRODUCT_FIELDS}
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<GetProductsData>({ query });
    return data.products.edges.map((edge) => withLpMeta(edge.node));
  } catch {
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        ${PRODUCT_FIELDS}
      }
    }
  `;

  try {
    const data = await shopifyFetch<GetProductByHandleData, { handle: string }>({
      query,
      variables: { handle },
    });

    return data.productByHandle ? withLpMeta(data.productByHandle) : null;
  } catch {
    return null;
  }
}
