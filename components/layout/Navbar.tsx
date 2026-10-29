'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { usePalette } from '@/components/system/CommandPalette';
import { useCart } from '@/components/store/CartProvider';

export const NAV_LINKS = [
  { label: 'Store', href: '/store', match: ['/store', '/products', '/custom-jackets'] },
  { label: 'Blog', href: '/blog', match: ['/blog', '/events'] },
  { label: 'About', href: '/about', match: ['/about'] },
  { label: 'Contact us', href: '/contact', match: ['/contact', '/locations'] },
] as const;

export function isActivePath(pathname: string, match: readonly string[]) {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function CartCount({ count }: { count: number }) {
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const id = window.setTimeout(() => setBump(false), 320);
    return () => window.clearTimeout(id);
  }, [count]);
  return (
    <span className={`inline-block transition-transform duration-200 ease-lp ${bump ? 'scale-125 text-[var(--lp-color-primary-300)]' : ''}`}>
      [{String(count).padStart(2, '0')}]
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const { open: openPalette } = usePalette();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);
  const [clock, setClock] = useState('');

  useEffect(() => {
    if (previousPathname.current !== pathname) setMenuOpen(false);
    previousPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    menuRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', onResize);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      desktop.removeEventListener('change', onResize);
      window.removeEventListener('keydown', onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().slice(11, 19));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <a href="#lp-main" className="lp-skip-link">
        Skip to content
      </a>

      <nav className="lp-topbar" aria-label="Primary">
        <div className="lp-shell flex h-[var(--lp-topbar-h)] items-center gap-3 md:gap-5">
          <Link href="/" className="lp-focus-ring relative inline-flex h-[48px] w-[40px] shrink-0 items-center justify-center overflow-hidden" aria-label="La Propagande — return to root">
            <Image
              src="/images/lp-logo-red.png"
              alt="La Propagande"
              width={1888}
              height={1334}
              sizes="80px"
              priority
              className="absolute h-[56px] w-[80px] max-w-none object-contain brightness-150"
            />
          </Link>

          <div className="hidden min-w-0 flex-1 md:flex lg:max-w-[560px]">
          <button
            type="button"
            onClick={() => openPalette()}
            className="lp-field lp-focus-ring min-h-[40px] w-full cursor-text items-center"
            aria-label="Open command palette"
          >
            <span className="lp-field__prefix">ROOT://LP&gt;</span>
            <span className="lp-ui-sm min-w-0 flex-1 truncate text-left text-[var(--lp-color-text-dim)]">Search products, events or type a command</span>
            <span className="lp-ui-sm mr-3 hidden gap-1 text-[var(--lp-color-text-dim)] lg:flex">
              <kbd className="border border-[var(--lp-color-border-subtle)] px-[5px] py-[1px]">⌘</kbd>
              <kbd className="border border-[var(--lp-color-border-subtle)] px-[5px] py-[1px]">K</kbd>
            </span>
          </button>
          </div>

          <div className="ml-auto hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="lp-nav-link hidden lg:inline-flex" data-active={isActivePath(pathname, link.match) ? 'true' : undefined}>
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="lp-btn lp-btn--sm lg:hidden" aria-expanded={menuOpen} aria-controls="lp-command-sheet">MENU</button>
            <button onClick={openCart} className="lp-btn lp-btn--sm ml-2" aria-label={`Open cart, ${cartCount} items`}>
              CART <CartCount count={cartCount} />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button onClick={openCart} className="lp-btn lp-btn--sm" aria-label={`Open cart, ${cartCount} items`}>
              CART <CartCount count={cartCount} />
            </button>
          </div>
        </div>
      </nav>

      {/* mobile handheld dock */}
      <div className="lp-dock md:hidden">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => openPalette()} className="lp-field lp-focus-ring min-h-[44px] min-w-0 flex-1 cursor-text" aria-label="Open command palette">
            <span className="lp-field__prefix">ROOT&gt;</span>
            <span className="lp-ui-sm min-w-0 flex-1 truncate text-left text-[var(--lp-color-text-dim)]">Search or command</span>
            <span className="lp-command-cursor mr-3 h-[14px] w-[7px]" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="lp-btn lp-btn--primary min-w-[88px]"
            aria-expanded={menuOpen}
            aria-controls="lp-command-sheet"
          >
            MENU
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div ref={menuRef} id="lp-command-sheet" className="lp-sheet lg:hidden" role="dialog" aria-modal="true" aria-label="Menu" onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button'));
          const first = items[0];
          const last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first?.focus();
          }
        }}>
          <div className="lp-shell flex h-[var(--lp-topbar-h)] shrink-0 items-center justify-between border-b border-[var(--lp-color-border-accent)]">
            <span className="lp-label text-[var(--lp-color-text-strong)]">COMMAND.SHEET</span>
            <span className="lp-log lp-tabular">{clock}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {[...NAV_LINKS.map((l) => ({ label: l.label, href: l.href, match: l.match as readonly string[] })), { label: 'Custom Jackets', href: '/custom-jackets', match: [] }, { label: 'Locations', href: '/locations', match: [] }].map(
              (link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="lp-sheet-link lp-reveal"
                  style={{ ['--i' as string]: i }}
                  data-active={isActivePath(pathname, link.match) ? 'true' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="lp-sheet-link__prefix">&gt;</span>
                  <span>{link.label}</span>
                </Link>
              )
            )}
          </div>
          <div className="lp-shell grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-[var(--lp-color-border-subtle)] py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                window.setTimeout(() => openPalette(), 80);
              }}
              className="lp-btn"
            >
              COMMAND LINE
            </button>
            <button type="button" onClick={() => setMenuOpen(false)} className="lp-btn lp-btn--primary min-w-[88px]">
              CLOSE
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
