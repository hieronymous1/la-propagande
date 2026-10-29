import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';
import { getBlogPosts } from '@/lib/queries/blog';
import { formatTxDate, getTransmission } from '@/lib/transmission';
import InstagramPost from '@/components/blog/InstagramPost';
import InstagramFeed from '@/components/blog/InstagramFeed';
import { INSTAGRAM_POSTS } from '@/lib/instagram-posts';
import { CTA_LINKS } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Posts, pop-ups and collaborations from La Propagande and the archive, Paris ↔ Beirut.',
};

export default async function BlogPage() {
  const entries = await getBlogPosts('news');
  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="BLOG.log" title="Blog" strip={`PARIS ↔ BEIRUT · ${entries.length + INSTAGRAM_POSTS.length} POSTS`} />
      <section className="space-y-3" aria-label="Instagram posts">
        <div className="flex flex-wrap gap-2">{CTA_LINKS.filter(link => ['Instagram', 'Archive Insta'].includes(link.label)).map(link => <a key={link.label} className="lp-btn lp-btn--sm" href={link.href} target="_blank" rel="noopener noreferrer">{link.label === 'Instagram' ? '@_LAPROPAGANDE' : '@LAPROPAGANDE.PSYOPS'} ↗</a>)}</div>
        {entries.some(entry => entry.instagramUrl) ? <div className="grid gap-4 md:grid-cols-2">{entries.filter(entry => entry.instagramUrl).map(entry => <InstagramPost key={entry.id} url={entry.instagramUrl!} title={entry.title} />)}</div> : null}
      </section>
      <InstagramFeed />
      {entries.map((post, index) => {
        const tx = getTransmission(post);
        return (
          <Link key={post.id} href={`/blog/${post.handle}`} className="group block lp-focus-ring" data-testid={index === 0 ? 'events-featured-post' : `events-post-${post.handle}`}>
            <Panel ticks interactive reveal={index} className="overflow-hidden" data-blog-card>
              <PanelTitleBar title={formatTxDate(post.publishedAt)} meta={tx.channel} />
              <div className="grid md:grid-cols-2">
                {post.image ? <div className="lp-media relative aspect-[4/3] border-0 md:aspect-auto md:min-h-[380px]"><Image src={post.image.url} alt={post.image.altText ?? post.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" priority={index === 0} /></div> : null}
                <div className={`flex flex-col justify-between gap-6 p-4 md:p-8 ${post.image ? 'border-t border-[var(--lp-color-border-subtle)] md:border-l md:border-t-0' : 'md:col-span-2'}`}>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2"><StatusChip label={tx.channel} tone="accent" />{tx.location ? <StatusChip label={tx.location} /> : null}</div>
                    <h2 className="lp-title lp-title-xl m-0 text-[var(--lp-color-text-strong)] transition-colors group-hover:text-[var(--lp-color-primary-300)]">{post.title}</h2>
                    {post.excerpt ? <p className="lp-body lp-body-lg m-0">{post.excerpt}</p> : null}
                  </div>
                  <span className="lp-btn lp-btn--primary self-start">READ POST <span className="lp-btn__arrow">&gt;</span></span>
                </div>
              </div>
            </Panel>
          </Link>
        );
      })}
      {entries.length === 0 ? <Panel><div className="p-4"><p className="lp-body m-0">Follow both Instagram accounts above for the latest posts.</p></div></Panel> : null}
    </div>
  );
}
