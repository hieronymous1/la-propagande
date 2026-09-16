import LandingOS from '@/components/home/LandingOS';
import { getBlogPosts } from '@/lib/queries/blog';
import { getProducts } from '@/lib/queries/products';
import { getProductCatalogMeta } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, posts] = await Promise.all([getProducts().catch(() => []), getBlogPosts('news').catch(() => [])]);

  const featured = products
    .filter((product) => product.images.edges[0]?.node.url)
    .sort((a, b) => Number(Boolean(b.lpMeta?.featured)) - Number(Boolean(a.lpMeta?.featured)))
    .slice(0, 3)
    .map((product) => {
      const meta = getProductCatalogMeta(product);
      const price = product.priceRange.minVariantPrice;
      return {
        handle: product.handle,
        title: product.title,
        image: product.images.edges[0]!.node.url,
        price: `${parseFloat(price.amount).toFixed(0)} ${price.currencyCode}`,
        code: product.lpMeta?.itemCode ?? meta.category.toUpperCase(),
        status: meta.status,
      };
    });

  const queue = posts.slice(0, 4).map((post) => ({
    handle: post.handle,
    title: post.title,
    date: post.publishedAt,
    channel: post.lpMeta?.channel ?? post.tags[0] ?? 'BULLETIN',
    location: post.lpMeta?.location ?? '',
    image: post.image?.url ?? null,
  }));

  return <LandingOS featured={featured} queue={queue} counts={{ products: products.length, posts: posts.length }} />;
}
