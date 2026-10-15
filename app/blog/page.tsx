import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';
import { getBlogPosts } from '@/lib/queries/blog';
import { formatTxDate, getTransmission } from '@/lib/transmission';
import InstagramPost from '@/components/blog/InstagramPost';
import { FOOTER_LINKS } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Pop-ups, raves, showroom windows and collaborations — the La Propagande transmission feed, Paris ↔ Beirut.',
};

export default async function BlogPage() {
  const entries = await getBlogPosts('news');
  const featured = entries[0] ?? null;
  const queue = featured ? entries.slice(1) : entries;
  const featuredTx = featured ? getTransmission(featured) : null;

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="BLOG.log" title="Transmissions" strip={`CHANNEL PARIS ↔ BEIRUT · ${entries.length} RECEIVED · FEED MODE: BULLETIN`} />
      <section className="space-y-3" aria-label="Instagram posts">
        <a className="lp-btn" href={FOOTER_LINKS[0].href} target="_blank" rel="noopener noreferrer">FOLLOW @_LAPROPAGANDE ↗</a>
        {entries.some((entry) => entry.instagramUrl) ? <div className="grid gap-4 md:grid-cols-2">
          {entries.filter((entry) => entry.instagramUrl).map((entry) => <InstagramPost key={entry.id} url={entry.instagramUrl!} title={entry.title} />)}
        </div> : null}
      </section>

      {featured && featuredTx ? (
        <Link href={`/blog/${featured.handle}`} className="group block lp-focus-ring" data-testid="events-featured-post">
          <Panel ticks accent interactive reveal={0} className="overflow-hidden">
            <PanelTitleBar title={`PINNED · TX-${featuredTx.id}`} meta="LATEST" />
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="lp-media lp-media--zoom lp-media--glitch lp-media--scan relative aspect-[4/3] border-0 md:aspect-auto md:min-h-[440px]">
                {featured.image ? (
                  <Image src={featured.image.url} alt={featured.image.altText ?? featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
                ) : (
                  <Image src="/images/brand/photo-night-fire-1.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-70" />
                )}
                <span className="lp-display absolute bottom-0 left-0 z-[2] bg-[var(--lp-color-bg-absolute)] px-3 pb-1 pt-2 text-[clamp(36px,6vw,72px)] leading-none text-[var(--lp-color-text-strong)]">
                  {formatTxDate(featured.publishedAt)}
                </span>
              </div>
              <div className="flex flex-col justify-between gap-8 border-t border-[var(--lp-color-border-subtle)] p-4 md:border-l md:border-t-0 md:p-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <StatusChip label={featuredTx.channel} tone="accent" />
                    <StatusChip label={featuredTx.category} />
                    {featuredTx.location ? <StatusChip label={featuredTx.location} /> : null}
                    <StatusChip label={featuredTx.status} tone={featuredTx.isLive ? 'success' : 'neutral'} dot={featuredTx.isLive} />
                  </div>
                  <h2 className="lp-title lp-title-xl m-0 text-[var(--lp-color-text-strong)] transition-colors duration-150 group-hover:text-[var(--lp-color-primary-300)]">{featured.title}</h2>
                  <p className="lp-body lp-body-lg m-0 text-[var(--lp-color-text-main)]">{featured.excerpt || 'Transmission record available.'}</p>
                </div>
                <span className="lp-btn lp-btn--primary self-start">
                  OPEN TRANSMISSION <span className="lp-btn__arrow">&gt;</span>
                </span>
              </div>
            </div>
          </Panel>
        </Link>
      ) : null}

      {queue.length > 0 ? (
        <Panel reveal={1}>
          <PanelTitleBar title="FEED" meta={`${queue.length} EARLIER`} />
          <ul className="m-0 list-none p-0">
            {queue.map((post, index) => {
              const tx = getTransmission(post);
              return (
                <li key={post.id} className="border-b border-[var(--lp-color-border-subtle)] last:border-b-0">
                  <Link
                    href={`/blog/${post.handle}`}
                    className="group grid grid-cols-[minmax(0,1fr)_96px] gap-x-3 gap-y-2 p-3 transition-colors duration-150 hover:bg-[rgba(142,17,17,0.08)] md:grid-cols-[132px_minmax(0,1fr)_200px] md:items-center md:gap-6 md:p-5"
                    data-testid={`events-post-${post.handle}`}
                    style={{ ['--i' as string]: index }}
                  >
                    <div className="col-span-2 flex items-baseline gap-3 md:col-span-1 md:block">
                      <span className="lp-display block text-[34px] leading-none text-[var(--lp-color-text-strong)] md:text-[44px]">{formatTxDate(post.publishedAt).slice(0, 5)}</span>
                      <span className="lp-log block md:mt-2">20{formatTxDate(post.publishedAt).slice(6)} · TX-{tx.id}</span>
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <StatusChip label={tx.channel} tone="accent" />
                        {tx.location ? <StatusChip label={tx.location} /> : null}
                        <StatusChip label={tx.status} tone={tx.isLive ? 'success' : 'neutral'} dot={tx.isLive} />
                      </div>
                      <h3 className="lp-title lp-title-lg m-0 text-[var(--lp-color-text-strong)] transition-colors duration-150 group-hover:text-[var(--lp-color-primary-300)]">{post.title}</h3>
                      <p className="lp-body lp-body-sm m-0 line-clamp-2 text-[var(--lp-color-text-muted)]">{post.excerpt || 'Transmission summary pending.'}</p>
                    </div>
                    <div className="lp-media lp-media--zoom lp-media--glitch relative row-start-2 aspect-square self-start md:row-start-auto md:aspect-[4/3]">
                      {post.image ? (
                        <Image src={post.image.url} alt={post.image.altText ?? post.title} fill sizes="(max-width: 768px) 100vw, 200px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="lp-log">NO FLYER</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}

      {entries.length === 0 ? (
        <Panel>
          <PanelTitleBar title="NO TRANSMISSIONS" meta="QUEUE EMPTY" />
          <div className="p-4">
            <p className="lp-body m-0">Nothing has been received yet. Follow the channels for the next drop or pop-up window.</p>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
