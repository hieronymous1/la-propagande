import Image from 'next/image';
import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/site';

const TICKER = [
  'THE OLD WORLD IS DYING',
  'AND THE NEW STRUGGLES TO BE BORN',
  'THE REVOLUTION WILL NOT BE TELEVISED',
  'YOUR MOVEMENTS WERE SOLD TO YOU',
  'DESIGNED · MARKETED · MANIPULATED · AND USED AGAINST YOU',
  'PARIS ↔ BEIRUT',
];

const ROUTES: [string, string][] = [
  ['Store', '/products'],
  ['Custom Jackets', '/custom-jackets'],
  ['Events', '/blog'],
  ['About', '/about'],
  ['Locations', '/locations'],
  ['Connect', '/contact'],
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-[var(--lp-color-border-accent)] bg-[var(--lp-color-bg-absolute)]">
      <div className="lp-ticker border-b border-[var(--lp-color-border-subtle)] py-2" aria-hidden="true">
        <div className="lp-ticker__track lp-label text-[var(--lp-color-primary-400)]">
          {[...TICKER, ...TICKER].map((line, i) => (
            <span key={`${line}-${i}`} className="flex items-center gap-10">
              {line}
              <span className="h-[6px] w-[6px] bg-[var(--lp-color-primary-700)]" />
            </span>
          ))}
        </div>
      </div>

      <div className="lp-shell grid gap-6 py-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 lp-focus-ring">
            <Image src="/images/lp-logo-red.png" alt="" width={40} height={40} className="h-[36px] w-[36px] object-contain" />
            <span className="lp-display lp-display-sm text-[var(--lp-color-text-strong)]">La Propagande</span>
          </Link>
          <p className="lp-body lp-body-sm m-0 max-w-[40ch] text-[var(--lp-color-text-muted)]">
            Born from revolt and war. A cultural archive that also contains a store, events and a network of nodes between Paris and Beirut.
          </p>
          <p className="lp-log m-0">NODE LP_PAR-BEY_01 · SIGNAL STABLE · © {year}</p>
        </div>

        <nav aria-label="Footer" className="space-y-2">
          <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">Routes</p>
          <ul className="m-0 list-none space-y-1 p-0">
            {ROUTES.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="lp-ui inline-flex min-h-[32px] items-center gap-2 text-[var(--lp-color-text-muted)] transition-colors duration-150 hover:text-[var(--lp-color-text-strong)]">
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
                <a href={href} target="_blank" rel="noopener noreferrer" className="lp-ui inline-flex min-h-[32px] items-center gap-2 text-[var(--lp-color-text-muted)] transition-colors duration-150 hover:text-[var(--lp-color-text-strong)]">
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
              <Link key={href} href={href} className="lp-log inline-flex min-h-[32px] items-center hover:text-[var(--lp-color-text-strong)]">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
