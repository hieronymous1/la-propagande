import Image from 'next/image';
import InstagramPost from '@/components/blog/InstagramPost';
import { Panel, PanelTitleBar } from '@/components/system/Primitives';
import { INSTAGRAM_POSTS } from '@/lib/instagram-posts';

export default function InstagramFeed() {
  return (
    <section aria-label="Posts from both Instagram accounts" className="space-y-4">
      {INSTAGRAM_POSTS.map((post) => (
        <Panel key={post.id} ticks className="overflow-hidden" data-blog-card>
          <PanelTitleBar title={post.publishedAt.split('-').reverse().join('.')} meta="INSTAGRAM" />
          <div className="grid md:grid-cols-2">
            <a href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${post.title} on Instagram`} className="lp-focus-ring lp-media relative block aspect-[4/3] border-0 md:aspect-auto md:min-h-[380px]">
              <Image src={post.image} alt={post.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
            </a>
            <div className="flex flex-col justify-between gap-6 border-t border-[var(--lp-color-border-subtle)] p-4 md:border-l md:border-t-0 md:p-8">
              <div className="space-y-4">
                <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">@{post.account}</p>
                <h2 className="lp-title lp-title-xl m-0 text-[var(--lp-color-text-strong)]"><a href={post.url} target="_blank" rel="noopener noreferrer" className="lp-focus-ring hover:text-[var(--lp-color-primary-300)]">{post.title}</a></h2>
                {'credit' in post ? <p className="lp-body lp-body-sm m-0">{post.credit}</p> : null}
              </div>
              <InstagramPost url={post.url} title={post.title} />
            </div>
          </div>
        </Panel>
      ))}
    </section>
  );
}
