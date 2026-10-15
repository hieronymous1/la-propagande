import LandingOS from '@/components/home/LandingOS';
import { getBlogPosts } from '@/lib/queries/blog';
import { getProducts } from '@/lib/queries/products';
import { getProductCatalogMeta } from '@/lib/site';
import { getTransmission } from '@/lib/transmission';
import Image from 'next/image';
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
    <section className="lp-shell lp-page-pad space-y-4" aria-label="La Propagande manifesto">
      {heading ? <h2 className="lp-title lp-title-lg m-0">{heading}</h2> : null}
      {intro ? <p className="lp-body m-0 whitespace-pre-line">{intro}</p> : null}
      <Image src="/images/client/manifesto.webp" alt="For the dreamers of yesterday. For the visionaries of tomorrow. For those who dare to do different. For the misfits who turn chaos into beauty. For the rockstars born in the wrong century. For the rebel minds, defiant and untamed. Welcome to the revolution." width={1200} height={1821} sizes="(max-width: 768px) 100vw, 640px" className="mx-auto h-auto w-full max-w-[640px]" />
    </section>
  </>;
}
