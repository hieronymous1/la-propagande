import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MetaList, Panel, PanelTitleBar, StatusChip, StatusStrip } from '@/components/system/Primitives';
import { getBlogPostByHandle, getBlogPosts } from '@/lib/queries/blog';
import { formatTxDate, formatTxDateLong, getTransmission } from '@/lib/transmission';
import InstagramPost from '@/components/blog/InstagramPost';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: { handle: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const article = await getBlogPostByHandle('news', params.handle);
  if (!article) return { title: 'Transmission not found' };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { title: article.title, description: article.excerpt ?? undefined, images: article.image ? [{ url: article.image.url }] : undefined },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [article, allPosts] = await Promise.all([getBlogPostByHandle('news', params.handle), getBlogPosts('news')]);

  if (!article) {
    notFound();
  }

  const tx = getTransmission(article);
  const related = allPosts.filter((post) => post.handle !== article.handle).slice(0, 3);
  const gallery = article.lpGallery?.length ? article.lpGallery : article.image ? [article.image] : [];

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <nav aria-label="Breadcrumb" className="lp-log flex flex-wrap items-center gap-2">
        <Link href="/blog" className="lp-tap hover:text-[var(--lp-color-text-strong)]">
          BLOG.log
        </Link>
        <span className="text-[var(--lp-color-text-dim)]">/</span>
        <span className="text-[var(--lp-color-text-main)]">TX-{tx.id}</span>
      </nav>

      <Panel ticks reveal={0} className="overflow-hidden" data-testid="event-detail-main">
        <PanelTitleBar title={`TRANSMISSION TX-${tx.id}`} meta={`RECEIVED ${formatTxDateLong(article.publishedAt)}`} />
        {gallery[0] ? (
          <div className="lp-media relative aspect-[16/9] border-0 border-b border-[var(--lp-color-border-subtle)] md:max-h-[560px]">
            <Image src={gallery[0].url} alt={gallery[0].altText ?? article.title} fill sizes="100vw" className="object-cover" priority />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.9))] p-4 md:p-6">
              <span className="lp-display block text-[clamp(40px,7vw,80px)] leading-none text-[var(--lp-color-text-strong)]">{formatTxDate(article.publishedAt)}</span>
            </div>
          </div>
        ) : null}
        <div className="grid gap-6 p-4 md:grid-cols-[minmax(0,68ch)_minmax(220px,1fr)] md:p-6">
          <article className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusChip label={tx.channel} tone="accent" />
              <StatusChip label={tx.category} />
              {tx.location ? <StatusChip label={tx.location} /> : null}
              <StatusChip label={tx.status} tone={tx.isLive ? "success" : "neutral"} dot={tx.isLive} />
            </div>
            <h1 className="lp-title lp-title-xl m-0 text-[var(--lp-color-text-strong)]">{article.title}</h1>
            {article.excerpt ? <p className="lp-body lp-body-lg m-0 text-[var(--lp-color-text-strong)]">{article.excerpt}</p> : null}
            <div className="lp-body lp-prose" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            {article.instagramUrl ? <InstagramPost url={article.instagramUrl} title={article.title} /> : null}
          </article>

          <aside className="space-y-3 md:border-l md:border-[var(--lp-color-border-subtle)] md:pl-6" data-testid="event-detail-meta">
            <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">Record</p>
            <MetaList
              fields={[
                { label: 'Transmission', value: `TX-${tx.id}` },
                { label: 'Received', value: formatTxDateLong(article.publishedAt) },
                { label: 'Channel', value: tx.channel },
                { label: 'Category', value: tx.category },
                { label: 'Status', value: tx.status },
                ...(tx.location ? [{ label: 'Location', value: tx.location }] : []),
                { label: 'Source', value: tx.source },
              ]}
            />
            <Link href="/locations" className="lp-btn lp-btn--sm lp-btn--block">
              ACCESS POINTS <span className="lp-btn__arrow">&gt;</span>
            </Link>
          </aside>
        </div>

        {gallery.length > 1 ? (
          <div className="grid gap-2 border-t border-[var(--lp-color-border-subtle)] p-2 sm:grid-cols-2 md:grid-cols-3">
            {gallery.slice(1).map((image, index) => (
              <div key={`${image.url}-${index}`} className="lp-media lp-media--zoom lp-media--glitch relative aspect-[4/3]">
                <Image src={image.url} alt={image.altText ?? `${article.title} ${index + 2}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </Panel>

      {related.length > 0 ? (
        <Panel reveal={1}>
          <PanelTitleBar title="RELATED TRANSMISSIONS" meta="QUEUE" />
          <div className="grid gap-2 p-2 md:grid-cols-3">
            {related.map((post) => {
              const rtx = getTransmission(post);
              return (
                <Link key={post.id} href={`/blog/${post.handle}`} className="group lp-focus-ring flex gap-3 border border-transparent p-2 transition-colors duration-150 hover:border-[var(--lp-color-border-default)]">
                  <span className="lp-media relative block h-16 w-20 shrink-0">{post.image ? <Image src={post.image.url} alt="" fill sizes="80px" className="object-cover" /> : null}</span>
                  <span className="min-w-0">
                    <span className="lp-title lp-title-sm block truncate text-[var(--lp-color-text-strong)] transition-colors group-hover:text-[var(--lp-color-primary-300)]">{post.title}</span>
                    <span className="lp-log block">
                      {formatTxDate(post.publishedAt)} · {rtx.channel}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/blog" className="lp-btn">
          &lt; RETURN TO FEED
        </Link>
        <StatusStrip>
          TX-{tx.id} · {tx.channel} · {tx.status}
        </StatusStrip>
      </div>
    </div>
  );
}
