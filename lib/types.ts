export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export type ProductStatus = 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | 'COMING_SOON' | 'ARCHIVE';
export type ProductCategory = 'tops' | 'bottoms' | 'accessories' | 'custom-jackets';

export interface ProductVariant {
  id: string;
  title: string;
  price: MoneyV2;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
}

export interface ProductMeta {
  itemCode: string;
  status: ProductStatus;
  origin: string;
  summary: string;
  description?: string;
  category?: ProductCategory;
  subcategory?: string;
  collection?: string;
  shortDescription?: string;
  featured?: boolean;
  transmission?: string;
  drop?: string;
  fileNotes?: string;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  lpMeta?: ProductMeta;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ProductVariant }[] };
}

export interface ArticleMeta {
  transmissionId: string;
  channel: string;
  status: string;
  location: string;
  source: string;
}

export interface Article {
  id: string;
  title: string;
  handle: string;
  excerpt: string | null;
  contentHtml: string;
  publishedAt: string;
  image: ShopifyImage | null;
  lpGallery?: ShopifyImage[];
  lpMeta?: ArticleMeta;
  tags: string[];
  author: { name: string };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: MoneyV2;
    product: { title: string; handle: string; images: { edges: { node: ShopifyImage }[] } };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: MoneyV2;
    subtotalAmount: MoneyV2;
  };
  lines: { edges: { node: CartLine }[] };
}

export interface AboutSection {
  id: string;
  label: string;
  body: string;
}

export interface LocationEntry {
  id: string;
  title: string;
  kind: 'showroom' | 'selling_point';
  address: string;
  note?: string;
  dateRange?: string;
  hours?: string;
}
