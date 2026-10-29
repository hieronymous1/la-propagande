import Image from 'next/image';
import Link from 'next/link';
import Ticker from '@/components/layout/Ticker';
import { FOOTER_LINKS } from '@/lib/site';

const ROUTES: [string, string][] = [
  ['Store', '/products'],
  ['Custom Jackets', '/custom-jackets'],
  ['Blog', '/blog'],
  ['About', '/about'],
  ['Locations', '/locations'],
  ['Contact us', '/contact'],
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-[var(--lp-color-border-accent)] bg-[var(--lp-color-bg-absolute)]">
      <Ticker className="border-b border-[var(--lp-color-border-subtle)]" />

      <div className="lp-shell grid gap-6 py-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div className="space-y-3 relative">
          <Link href="/" className="inline-flex min-h-[44px] items-center gap-3 lp-focus-ring">
            <span className="relative block h-[44px] w-[32px] overflow-hidden"><Image src="/images/lp-logo-red.png" alt="" width={1888} height={1334} sizes="72px" className="absolute left-1/2 top-1/2 h-[50px] w-[72px] max-w-none -translate-x-1/2 -translate-y-1/2 brightness-150" /></span>
            <Image src="/images/lp-text-logo-cropped.png" alt="La Propagande" width={2732} height={609} className="lp-wordmark h-auto w-[150px] invert" />
          </Link>
          <p className="lp-log m-0">© {year}</p>
          <div className="lp-body lp-body-sm max-w-[40ch] space-y-3 text-[var(--lp-color-text-muted)]">
            <p className="m-0">Underground clothing brand for the rebel minds.</p>
            <p className="m-0">Streetwear • Vintage Militaria &amp; Workwear • Custom jackets</p>
            <p className="m-0">From Beirut to Paris, for the World.</p>
          </div>
        </div>

        <nav aria-label="Footer" className="space-y-2">
          <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">Routes</p>
          <ul className="m-0 list-none space-y-1 p-0">
            {ROUTES.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="lp-ui inline-flex min-h-[32px] items-center lp-tap gap-2 text-[var(--lp-color-text-muted)] transition-colors duration-150 hover:text-[var(--lp-color-text-strong)]">
                  <span className="text-[var(--lp-color-primary-600)]">&gt;</span> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2">
          <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">Channels</p>
          <ul className="m-0 list-none space-y-1 p-0">
            {FOOTER_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="lp-ui inline-flex min-h-[32px] items-center lp-tap gap-2 text-[var(--lp-color-text-muted)] transition-colors duration-150 hover:text-[var(--lp-color-text-strong)]">
                  <span className="text-[var(--lp-color-primary-600)]">&gt;</span> {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-4 pt-3">
            {[
              ['TERMS', '/terms'],
              ['PRIVACY', '/privacy'],
              ['RETURNS', '/returns'],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="lp-log inline-flex min-h-[32px] items-center lp-tap hover:text-[var(--lp-color-text-strong)]">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
