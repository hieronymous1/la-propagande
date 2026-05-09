'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import CommandInput from '@/components/system/CommandInput';
import { useCart } from '@/components/store/CartProvider';

const NAV_LINKS = [
  { label: 'Store', href: '/store' },
  { label: 'Events', href: '/events' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-[var(--lp-z-header)] border-b border-[var(--lp-color-border-accent)] bg-[rgba(5,5,5,0.9)] backdrop-blur-[2px]">
        <div className="lp-shell grid items-center gap-[10px] py-[10px] md:grid-cols-[auto_1fr_auto] md:gap-4 md:py-[10px]">
          <div className="group relative z-0 flex items-center gap-2">
            <Link href="/" className="relative lp-focus-ring inline-flex min-h-[36px] items-center gap-[6px]">
              <Image src="/images/lp-logo-red.png" alt="La Propagande home" width={34} height={34} priority className="h-[32px] w-[32px] object-contain" />
              <span className="lp-log inline-flex shrink-0 items-center gap-[5px] whitespace-nowrap text-[10px] text-[var(--lp-color-text-muted)]">
                <span>SIGNAL:</span>
                <span aria-hidden className="lp-signal-meter">
                  <span className="lp-signal-bar lp-signal-bar-1" />
                  <span className="lp-signal-bar lp-signal-bar-2" />
                  <span className="lp-signal-bar lp-signal-bar-3" />
                </span>
              </span>
              <span className="pointer-events-none absolute -bottom-7 left-0 hidden border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] px-2 py-1 lp-log text-[10px] text-[var(--lp-color-text-muted)] group-hover:block md:group-hover:block">
                RETURN TO ROOT
              </span>
            </Link>
          </div>

          <div className="relative z-10 hidden justify-self-center md:block">
            <CommandInput
              compact
              showLabel={false}
              className="w-[min(520px,34vw)] lg:w-[min(620px,42vw)]"
              onOpenCart={openCart}
            />
          </div>

          <div className="hidden items-center justify-end gap-2 md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(`${link.href}/`) ||
                (link.href === '/store' && pathname.startsWith('/products')) ||
                (link.href === '/events' && pathname.startsWith('/blog'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`lp-focus-ring lp-exec-hit lp-log inline-flex min-h-[40px] items-center justify-center border px-2 py-[7px] text-center text-[9px] uppercase tracking-[0.05em] transition-all duration-[120ms] xl:w-[124px] xl:text-[10px] xl:px-[10px] ${
                    active
                      ? 'border-[var(--lp-color-border-accent-bright)] text-[var(--lp-color-primary-200)] opacity-100'
                      : 'border-[var(--lp-color-border-default)] text-[var(--lp-color-text-muted)] opacity-[0.88] hover:border-[var(--lp-color-border-accent)] hover:text-[var(--lp-color-text-strong)] hover:opacity-100 hover:translate-x-[1px]'
                  }`}
                >
                  {link.label.toUpperCase()}
                </Link>
              );
            })}

            <button
              onClick={openCart}
              className="lp-focus-ring lp-exec-hit lp-log inline-flex min-h-[40px] items-center justify-center border border-[var(--lp-color-border-default)] px-2 py-[7px] text-center text-[9px] uppercase tracking-[0.05em] hover:border-[var(--lp-color-border-accent)] hover:text-[var(--lp-color-text-strong)] xl:w-[124px] xl:text-[10px] xl:px-[10px]"
              aria-label="Open cart"
            >
              CART[{String(cartCount).padStart(2, '0')}]
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 md:hidden">
            <button
              onClick={openCart}
              className="lp-focus-ring lp-exec-hit lp-log min-h-[44px] flex-1 border border-[var(--lp-color-border-default)] px-2 py-[6px] text-[10px]"
              aria-label="Open cart"
            >
              CART[{String(cartCount).padStart(2, '0')}]
            </button>
            <button
              onClick={() => setMenuOpen((current) => !current)}
              className="lp-focus-ring lp-exec-hit lp-log min-h-[44px] flex-1 border border-[var(--lp-color-border-default)] px-2 py-[6px] text-[10px]"
              aria-label="Toggle menu"
            >
              MENU
            </button>
          </div>
        </div>

        <div className="lp-shell pb-3 pt-0 md:hidden">
          <CommandInput compact showLabel={false} className="w-full" onOpenCart={openCart} />
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-[var(--lp-z-overlay)] bg-[rgba(0,0,0,0.92)] p-3 md:hidden">
          <div className="lp-panel mx-auto flex max-w-[520px] flex-col gap-2 p-3">
            <div className="lp-panel-title">
              <span className="font-lp-ui text-[12px] uppercase text-[var(--lp-color-text-strong)]">COMMAND.SHEET</span>
              <button onClick={() => setMenuOpen(false)} className="lp-log text-[10px] hover:text-[var(--lp-color-primary-200)]">
                CLOSE
              </button>
            </div>
            <CommandInput compact label="SEARCH / COMMAND" onOpenCart={openCart} />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="lp-focus-ring lp-exec-hit lp-log min-h-[46px] border border-[var(--lp-color-border-default)] px-3 py-3 text-[11px] uppercase tracking-[0.05em] hover:border-[var(--lp-color-border-accent)]"
              >
                {'> '}
                {link.label.toUpperCase()}
              </Link>
            ))}
            <p className="lp-log m-0 border border-[var(--lp-color-border-subtle)] px-3 py-2 text-[10px] text-[var(--lp-color-text-muted)]">
              TYPE HELP TO VIEW COMMANDS
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
