import Image from 'next/image';
import Link from 'next/link';
import { FALLBACK_ARTICLES } from '@/lib/site';

export default function Activations() {
  return (
    <section className="bg-lp-red px-4 pb-[60px] pt-[60px] md:px-[120px]">
      <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2">
        {FALLBACK_ARTICLES.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.handle}`}
            className="group flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-vhs-gothic text-[18px] uppercase leading-[1.1] text-lp-white md:text-[22px]">
                  {article.title}
                </h2>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-retro-computer text-[12px] uppercase tracking-[0.12em] text-black">
                  {new Date(article.publishedAt).getFullYear()}
                </div>
                <div className="font-retro-computer text-[12px] uppercase tracking-[0.12em] text-black">
                  View project
                </div>
              </div>
            </div>

            <div className="relative aspect-[1.3] overflow-hidden bg-black/20">
              {article.image ? (
                <Image
                  src={article.image.url}
                  alt={article.image.altText ?? article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
