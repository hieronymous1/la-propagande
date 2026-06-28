import { ensurePlaceholderProducts, getFallbackProduct, splitDescriptionAndFileNotes } from '../site';
import { shopifyFetch } from '../shopify';
import { sanitizeRichHtml, shouldUseShopifyFallbacks } from '../runtime';
import { extractProductFallbackMeta, parseFeatured, parseProductCategory, parseProductStatus } from '../product-meta';
import type { Product, ProductCategory, ProductMeta, ProductStatus } from '../types';

const CONTENT_NAMESPACE = process.env.SHOPIFY_CONTENT_NAMESPACE || 'lap';

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  tags
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
  tags?: string[];
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

interface ProductFallbackMeta {
  itemCode?: string;
  status?: string;
  origin?: string;
  summary?: string;
  category?: string;
  subcategory?: string;
  collection?: string;
  shortDescription?: string;
  featured?: string;
  transmission?: string;
  drop?: string;
  fileNotes?: string;
}

interface ProductFallbackResult {
  descriptionHtml: string;
  meta: ProductFallbackMeta;
}

const readProductFallbackMeta = extractProductFallbackMeta as (input: {
  descriptionHtml: string;
  tags: string[];
}) => ProductFallbackResult;

function fieldValue(field?: MetafieldValue | null): string | undefined {
  return field?.value?.trim() || undefined;
}

function hasAvailableVariant(product: RawProduct): boolean {
  return product.variants.edges.some((edge) => edge.node.availableForSale);
}

function withLpMeta(product: RawProduct): Product {
  const fallback = readProductFallbackMeta({
    descriptionHtml: product.descriptionHtml,
    tags: product.tags ?? [],
  });
  const descriptionContent = splitDescriptionAndFileNotes(
    fallback.descriptionHtml,
    fieldValue(product.fileNotes) ?? fallback.meta.fileNotes ?? product.lpMeta?.fileNotes
  );
  const descriptionHtml = sanitizeRichHtml(descriptionContent.descriptionHtml);
  const summary =
    fieldValue(product.summary) ??
    fallback.meta.summary ??
    product.lpMeta?.summary ??
    fieldValue(product.shortDescription) ??
    fallback.meta.shortDescription ??
    product.lpMeta?.shortDescription ??
    '';
  const meta: ProductMeta = {
    itemCode: fieldValue(product.itemCode) ?? fallback.meta.itemCode ?? product.lpMeta?.itemCode ?? `LP-${product.handle.slice(0, 8).toUpperCase()}`,
    status:
      (parseProductStatus(fieldValue(product.statusMeta) ?? fallback.meta.status) as ProductStatus | undefined) ??
      product.lpMeta?.status ??
      (hasAvailableVariant(product) ? 'AVAILABLE' : 'SOLD_OUT'),
    origin: fieldValue(product.origin) ?? fallback.meta.origin ?? product.lpMeta?.origin ?? 'HYBRID NODE',
    summary,
    description: descriptionHtml || product.lpMeta?.description,
  };

  const category = parseProductCategory(fieldValue(product.category) ?? fallback.meta.category) as ProductCategory | undefined;
  if (category) {
    meta.category = category;
  } else if (product.lpMeta?.category) {
    meta.category = product.lpMeta.category;
  }

  const subcategory = fieldValue(product.subcategory) ?? fallback.meta.subcategory;
  if (subcategory) meta.subcategory = subcategory;
  else if (product.lpMeta?.subcategory) meta.subcategory = product.lpMeta.subcategory;

  const collection = fieldValue(product.collection) ?? fallback.meta.collection;
  if (collection) meta.collection = collection;
  else if (product.lpMeta?.collection) meta.collection = product.lpMeta.collection;

  const shortDescription = fieldValue(product.shortDescription) ?? fallback.meta.shortDescription;
  if (shortDescription) meta.shortDescription = shortDescription;
  else if (product.lpMeta?.shortDescription) meta.shortDescription = product.lpMeta.shortDescription;

  const featured = parseFeatured(fieldValue(product.featured) ?? fallback.meta.featured);
  if (featured !== undefined) meta.featured = featured;
  else if (product.lpMeta?.featured !== undefined) meta.featured = product.lpMeta.featured;

  const transmission = fieldValue(product.transmission) ?? fallback.meta.transmission;
  if (transmission) meta.transmission = transmission;
  else if (product.lpMeta?.transmission) meta.transmission = product.lpMeta.transmission;

  const drop = fieldValue(product.drop) ?? fallback.meta.drop;
  if (drop) meta.drop = drop;
  else if (product.lpMeta?.drop) meta.drop = product.lpMeta.drop;

  const fileNotes = fieldValue(product.fileNotes) ?? fallback.meta.fileNotes;
  if (fileNotes) meta.fileNotes = fileNotes;
  else if (descriptionContent.fileNotes) meta.fileNotes = descriptionContent.fileNotes;
  else if (product.lpMeta?.fileNotes) meta.fileNotes = product.lpMeta.fileNotes;

  return { ...product, descriptionHtml, lpMeta: meta };
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
    const data = await shopifyFetch<GetProductsData>({ query, operationName: 'GetProducts' });
    const products = data.products.edges.map((edge) => withLpMeta(edge.node));
    return shouldUseShopifyFallbacks() ? ensurePlaceholderProducts(products) : products;
  } catch (error) {
    if (shouldUseShopifyFallbacks()) return ensurePlaceholderProducts([]);
    throw error;
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
      operationName: 'GetProductByHandle',
    });

    if (data.productByHandle) return withLpMeta(data.productByHandle);
    return shouldUseShopifyFallbacks() ? getFallbackProduct(handle) : null;
  } catch (error) {
    if (shouldUseShopifyFallbacks()) return getFallbackProduct(handle);
    throw error;
  }
}
