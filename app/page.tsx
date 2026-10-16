import LandingOS from '@/components/home/LandingOS';
import { getBlogPosts } from '@/lib/queries/blog';
import { getProducts } from '@/lib/queries/products';
import { getProductCatalogMeta } from '@/lib/site';
import { getTransmission } from '@/lib/transmission';
import ManifestoBroadcast from '@/components/home/ManifestoBroadcast';
import { getAboutSections, splitAboutContent } from '@/lib/queries/content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [products, posts, about] = await Promise.all([getProducts().catch(() => []), getBlogPosts('news').catch(() => []), getAboutSections().catch(() => [])]);
  const { intro, heading } = splitAboutContent(about);

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
    live: getTransmission(post).isLive,
  }));

  return <>
    <LandingOS featured={featured} queue={queue} counts={{ products: products.length, posts: posts.length }} />
    {heading || intro ? (
      <section className="lp-shell lp-page-pad space-y-4" aria-label="About La Propagande">
        {heading ? <h2 className="lp-title lp-title-lg m-0">{heading}</h2> : null}
        {intro ? <p className="lp-body m-0 whitespace-pre-line">{intro}</p> : null}
      </section>
    ) : null}
    <ManifestoBroadcast />
  </>;
}
