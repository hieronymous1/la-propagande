import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';
import { getBlogPostByHandle, getBlogPosts } from '@/lib/queries/blog';

interface BlogPostPageProps {
  params: { handle: string };
}

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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [article, allPosts] = await Promise.all([getBlogPostByHandle('news', params.handle), getBlogPosts('news')]);

  if (!article) {
    notFound();
  }

  const related = allPosts.filter((post) => post.handle !== article.handle).slice(0, 3);
  const gallery = article.lpGallery?.length ? article.lpGallery : article.image ? [article.image] : [];

  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>
        TRANSMISSION ID: {article.lpMeta?.transmissionId ?? article.id.toUpperCase()} / RECEIVED: {formatDate(article.publishedAt)} / CHANNEL:{' '}
        {sanitizeMeta(article.lpMeta?.channel, article.tags[0] ?? 'BULLETIN')} / CATEGORY: {sanitizeMeta(article.tags[0] ?? article.lpMeta?.channel, 'EVENT')}
      </StatusStrip>

      <Panel data-testid="event-detail-main">
        <PanelTitleBar title={article.title.toUpperCase()} meta={`SOURCE: ${sanitizeMeta(article.lpMeta?.source, article.author.name.toUpperCase())}`} />
        <div className="space-y-3 p-[10px]">
          {gallery[0] ? (
            <div className="relative min-h-[320px] overflow-hidden border border-[var(--lp-color-border-subtle)] md:min-h-[520px]">
              <Image src={gallery[0].url} alt={gallery[0].altText ?? article.title} fill sizes="100vw" className="object-cover" />
            </div>
          ) : null}

          <p className="m-0 text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">{article.excerpt || 'Transmission summary unavailable.'}</p>

          <div className="space-y-3 text-[14px] leading-[1.6] text-[var(--lp-color-text-main)]" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

          {gallery.length > 1 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {gallery.slice(1).map((image, index) => (
                <div key={`${image.url}-${index}`} className="relative min-h-[220px] overflow-hidden border border-[var(--lp-color-border-subtle)]">
                  <Image src={image.url} alt={image.altText ?? `${article.title} ${index + 2}`} fill sizes="50vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel data-testid="event-detail-meta">
        <PanelTitleBar title="UTILITY METADATA BLOCK" meta="TRANSMISSION RECORD" />
        <div className="space-y-1 p-[10px]">
          <p className="lp-log m-0 text-[10px]">TRANSMISSION ID: {article.lpMeta?.transmissionId ?? article.id.toUpperCase()}</p>
          <p className="lp-log m-0 text-[10px]">RECEIVED: {formatDate(article.publishedAt)}</p>
          <p className="lp-log m-0 text-[10px]">CATEGORY: {sanitizeMeta(article.tags[0] ?? article.lpMeta?.channel, 'EVENT')}</p>
          <p className="lp-log m-0 text-[10px]">SOURCE: {sanitizeMeta(article.lpMeta?.source, article.author.name.toUpperCase())}</p>
          <p className="lp-log m-0 text-[10px]">STATUS: {statusLabel(article.lpMeta?.status)}</p>
          <p className="lp-log m-0 text-[10px]">LOCATION: {sanitizeMeta(article.lpMeta?.location, 'PARIS')}</p>
        </div>
      </Panel>

      <Panel>
        <PanelTitleBar title="RELATED TRANSMISSIONS" meta="QUEUE" />
        <div className="flex flex-wrap gap-2 p-[10px]">
          {related.length > 0 ? (
            related.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.handle}`}
                className="lp-focus-ring lp-log border border-[var(--lp-color-border-default)] px-2 py-2 text-[10px] hover:border-[var(--lp-color-border-accent)]"
              >
                {post.title.toUpperCase()} {'>'}
              </Link>
            ))
          ) : (
            <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">NO RELATED TRANSMISSIONS AVAILABLE.</p>
          )}
        </div>
      </Panel>

      <Link
        href="/blog"
        className="lp-focus-ring inline-flex items-center gap-2 border border-[var(--lp-color-border-default)] px-2 py-2 lp-log text-[10px] hover:border-[var(--lp-color-border-accent)]"
      >
        {'>'} RETURN TO EVENTS FEED
      </Link>
    </div>
  );
}
