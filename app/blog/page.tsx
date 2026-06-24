import Image from 'next/image';
import Link from 'next/link';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';
import { getBlogPosts } from '@/lib/queries/blog';

export const dynamic = 'force-dynamic';

function formatDate(value: string): string {
  const date = new Date(value);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}.${dd}.${yy}`;
}

function sanitizeMeta(value: string | undefined, fallback: string): string {
  const resolved = value || fallback;
  return resolved.replace(/archive/gi, 'recovery');
}

function statusLabel(value: string | undefined): string {
  const resolved = value || 'ACTIVE';
  return resolved.toUpperCase() === 'ARCHIVE' ? 'COMPLETE' : sanitizeMeta(resolved, 'ACTIVE');
}

export default async function BlogPage() {
  const entries = await getBlogPosts('news');
  const featured = entries[0] ?? null;
  const queue = featured ? entries.slice(1) : entries;

  return (
    <div className="lp-shell space-y-3 py-4">
      <Panel>
        <PanelTitleBar title="EVENTS.log" meta="TRANSMISSION FEED" />
        <div className="p-[10px]">
          <StatusStrip>RECEIVED: LIVE / CHANNEL: PARIS {'<->'} BEIRUT / STATUS: ACTIVE / FEED MODE: BULLETIN</StatusStrip>
        </div>
      </Panel>

      {featured ? (
        <Link href={`/blog/${featured.handle}`} className="block lp-focus-ring" data-testid="events-featured-post">
          <Panel className="overflow-hidden border-[var(--lp-color-border-accent)]">
            <PanelTitleBar title={`PINNED // ${featured.title.toUpperCase()}`} meta={`TRANSMISSION ID: ${featured.lpMeta?.transmissionId ?? featured.id.toUpperCase()}`} />
            <div className="grid gap-2 p-[10px] md:grid-cols-[0.9fr_1.1fr]">
              {featured.image ? (
                <div className="relative min-h-[280px] overflow-hidden border border-[var(--lp-color-border-subtle)]">
                  <Image src={featured.image.url} alt={featured.image.altText ?? featured.title} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
                </div>
              ) : null}
              <div className="space-y-2">
                <p className="lp-log m-0 text-[10px]">RECEIVED: {formatDate(featured.publishedAt)}</p>
                <p className="lp-log m-0 text-[10px]">CHANNEL: {sanitizeMeta(featured.lpMeta?.channel, featured.tags[0] ?? 'BULLETIN')}</p>
                <p className="lp-log m-0 text-[10px]">CATEGORY: {sanitizeMeta(featured.tags[0] ?? featured.lpMeta?.channel, 'EVENT')}</p>
                <p className="lp-log m-0 text-[10px]">STATUS: {statusLabel(featured.lpMeta?.status)}</p>
                <p className="lp-log m-0 text-[10px]">LOCATION: {sanitizeMeta(featured.lpMeta?.location, 'PARIS')}</p>
                <p className="m-0 text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">{featured.excerpt || 'Transmission record available.'}</p>
              </div>
            </div>
          </Panel>
        </Link>
      ) : null}

      <div className="grid gap-2">
        {queue.map((post) => (
          <Link key={post.id} href={`/blog/${post.handle}`} className="block lp-focus-ring" data-testid={`events-post-${post.handle}`}>
            <Panel className="transition-colors hover:border-[var(--lp-color-border-accent-bright)]">
              <div className="grid min-h-[110px] gap-2 p-[10px] md:grid-cols-[84px_1fr_160px] md:items-start">
                <p className="lp-log m-0 text-[10px] text-[var(--lp-color-primary-100)]">{formatDate(post.publishedAt)}</p>
                <div className="space-y-1">
                  <span className="lp-log inline-flex h-[18px] items-center border border-[var(--lp-color-border-default)] px-2 text-[10px]">
                    {sanitizeMeta(post.lpMeta?.channel, post.tags[0] ?? 'BULLETIN')}
                  </span>
                  <p className="font-lp-ui m-0 text-[18px] uppercase leading-[1.08] text-[var(--lp-color-text-strong)]">{post.title}</p>
                  <p className="m-0 text-[13px] leading-[1.4] text-[var(--lp-color-text-main)]">{post.excerpt || 'Transmission summary pending.'}</p>
                  <p className="lp-log m-0 text-[10px] md:hidden">
                    {formatDate(post.publishedAt)} / {sanitizeMeta(post.lpMeta?.channel, post.tags[0] ?? 'BULLETIN')} / {sanitizeMeta(post.lpMeta?.location, 'PARIS')}
                  </p>
                  <p className="lp-log m-0 hidden text-[10px] md:block">
                    RECEIVED: {formatDate(post.publishedAt)} / CHANNEL: {sanitizeMeta(post.lpMeta?.channel, post.tags[0] ?? 'BULLETIN')} / CATEGORY: {sanitizeMeta(post.tags[0] ?? post.lpMeta?.channel, 'EVENT')} / STATUS: {statusLabel(post.lpMeta?.status)} / LOCATION: {sanitizeMeta(post.lpMeta?.location, 'PARIS')} / TRANSMISSION ID:{' '}
                    {post.lpMeta?.transmissionId ?? post.id.toUpperCase()}
                  </p>
                </div>
                {post.image ? (
                  <div className="relative h-[104px] overflow-hidden border border-[var(--lp-color-border-subtle)]">
                    <Image src={post.image.url} alt={post.image.altText ?? post.title} fill sizes="160px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-[104px] items-center justify-center border border-[var(--lp-color-border-subtle)]">
                    <span className="lp-log text-[10px]">NO FLYER</span>
                  </div>
                )}
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
