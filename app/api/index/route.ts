import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/queries/products';
import { getBlogPosts } from '@/lib/queries/blog';
import { getProductCatalogMeta } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface IndexEntry {
  kind: 'product' | 'event';
  title: string;
  handle: string;
  href: string;
  meta: string;
  image: string | null;
}

export async function GET() {
  try {
    const [products, posts] = await Promise.all([getProducts(), getBlogPosts('news')]);

    const entries: IndexEntry[] = [
      ...products.map((product) => {
        const meta = getProductCatalogMeta(product);
        const price = product.priceRange.minVariantPrice;
        return {
          kind: 'product' as const,
          title: product.title,
          handle: product.handle,
          href: `/products/${product.handle}`,
          meta: `${product.lpMeta?.itemCode ?? meta.category.toUpperCase()} / ${parseFloat(price.amount).toFixed(0)} ${price.currencyCode}`,
          image: product.images.edges[0]?.node.url ?? null,
        };
      }),
      ...posts.map((post) => ({
        kind: 'event' as const,
        title: post.title,
        handle: post.handle,
        href: `/blog/${post.handle}`,
        meta: `${post.lpMeta?.transmissionId ?? 'TX'} / ${new Date(post.publishedAt).toISOString().slice(0, 10)}`,
        image: post.image?.url ?? null,
      })),
    ];

    return NextResponse.json({ entries }, { headers: { 'Cache-Control': 'private, max-age=120' } });
  } catch (error) {
    console.error('[Index API] failed:', error);
    return NextResponse.json({ entries: [] }, { status: 200 });
  }
}
