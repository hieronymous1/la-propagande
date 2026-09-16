import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';
import { getBlogPosts } from '@/lib/queries/blog';
import { formatTxDate, getTransmission } from '@/lib/transmission';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Pop-ups, raves, showroom windows and collaborations — the La Propagande transmission feed, Paris ↔ Beirut.',
};

export default async function BlogPage() {
  const entries = await getBlogPosts('news');
  const featured = entries[0] ?? null;
  const queue = featured ? entries.slice(1) : entries;
  const featuredTx = featured ? getTransmission(featured) : null;

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="EVENTS.log" title="Transmissions" strip={`CHANNEL PARIS ↔ BEIRUT · ${entries.length} RECEIVED · FEED MODE: BULLETIN`} />

      {featured && featuredTx ? (
        <Link href={`/blog/${featured.handle}`} className="group block lp-focus-ring" data-testid="events-featured-post">
          <Panel ticks accent interactive reveal={0} className="overflow-hidden">
            <PanelTitleBar title={`PINNED · TX-${featuredTx.id}`} meta={featuredTx.isLive ? 'LIVE' : featuredTx.status} />
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="lp-media lp-media--zoom relative aspect-[4/3] border-0 md:aspect-auto md:min-h-[420px]">
                {featured.image ? (
                  <Image src={featured.image.url} alt={featured.image.altText ?? featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
                ) : (
                  <Image src="/images/brand/photo-night-fire-1.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-70" />
                )}
                <span className="lp-display absolute bottom-3 left-3 text-[clamp(40px,8vw,88px)] leading-none text-[var(--lp-color-text-strong)] drop-shadow-[2px_2px_0_#050505]">
                  {formatTxDate(featured.publishedAt)}
                </span>
              </div>
              <div className="flex flex-col justify-between gap-6 p-4 md:p-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusChip label={featuredTx.channel} tone="accent" />
                    <StatusChip label={featuredTx.category} />
                    {featuredTx.location ? <StatusChip label={featuredTx.location} dot tone="success" /> : null}
                  </div>
                  <h2 className="lp-display lp-display-lg m-0 text-[var(--lp-color-text-strong)] transition-colors duration-150 group-hover:text-[var(--lp-color-primary-300)]">{featured.title}</h2>
                  <p className="lp-body m-0">{featured.excerpt || 'Transmission record available.'}</p>
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
                    className="group grid gap-3 p-3 transition-colors duration-150 hover:bg-[rgba(142,17,17,0.08)] md:grid-cols-[120px_minmax(0,1fr)_200px] md:items-center md:gap-5 md:p-4"
                    data-testid={`events-post-${post.handle}`}
                    style={{ ['--i' as string]: index }}
                  >
                    <div className="flex items-center gap-3 md:block">
                      <span className="lp-display block text-[32px] leading-none text-[var(--lp-color-text-strong)]">{formatTxDate(post.publishedAt).slice(0, 5)}</span>
                      <span className="lp-log block">20{formatTxDate(post.publishedAt).slice(6)} · TX-{tx.id}</span>
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap gap-2">
                        <StatusChip label={tx.channel} tone="accent" />
                        {tx.location ? <StatusChip label={tx.location} /> : null}
                        <StatusChip label={tx.status} tone={tx.isLive ? 'success' : 'neutral'} dot={tx.isLive} />
                      </div>
                      <h3 className="lp-display lp-display-md m-0 text-[var(--lp-color-text-strong)] transition-colors duration-150 group-hover:text-[var(--lp-color-primary-300)]">{post.title}</h3>
                      <p className="lp-body lp-body-sm m-0 line-clamp-2 text-[var(--lp-color-text-muted)]">{post.excerpt || 'Transmission summary pending.'}</p>
                    </div>
                    <div className="lp-media lp-media--zoom relative aspect-[16/10] md:aspect-[4/3]">
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
