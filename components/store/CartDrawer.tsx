'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from './CartProvider';
import type { CartLine } from '@/lib/types';
import { formatPrice } from '@/lib/product-options';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const lines: CartLine[] = cart?.lines.edges.map((e) => e.node) ?? [];
  const subtotal = cart?.cost.subtotalAmount;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  useEffect(() => {
    if (!isOpen) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const node = panelRef.current;
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])') ?? []);
    window.setTimeout(() => focusables()[0]?.focus(), 30);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCart();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      restoreFocus.current?.focus?.();
    };
  }, [isOpen, closeCart]);

  return (
    <>
      {isOpen ? <div className="lp-drawer-backdrop" onClick={closeCart} aria-hidden="true" /> : null}

      <div ref={panelRef} className="lp-drawer" data-open={isOpen ? 'true' : 'false'} aria-label="Cart" role="dialog" aria-modal="true" aria-hidden={!isOpen} inert={isOpen ? undefined : ('' as unknown as boolean)}>
        <div className="lp-panel-title min-h-[var(--lp-topbar-h)]">
          <span className="lp-panel-title__name">CART · {String(count).padStart(2, '0')}</span>
          <button onClick={closeCart} className="lp-btn lp-btn--sm" aria-label="Close cart">
            CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <Image src="/images/brand/sigil-square.webp" alt="" width={120} height={100} className="w-[110px] opacity-60 saturate-0" />
              <div>
                <p className="lp-display lp-display-sm m-0 text-[var(--lp-color-text-strong)]">Buffer empty</p>
                <p className="lp-body lp-body-sm m-0 mt-1 text-[var(--lp-color-text-muted)]">Nothing queued for checkout yet.</p>
              </div>
              <Link href="/products" onClick={closeCart} className="lp-btn lp-btn--primary">
                ENTER STORE <span className="lp-btn__arrow">&gt;</span>
              </Link>
            </div>
          ) : (
            <ul className="m-0 list-none space-y-2 p-0">
              {lines.map((line) => {
                const image = line.merchandise.product.images.edges[0]?.node ?? null;
                const lineTotal = (parseFloat(line.merchandise.price.amount) * line.quantity).toFixed(2);
                return (
                  <li key={line.id} className="lp-panel lp-reveal flex gap-3 p-2">
                    <Link href={`/products/${line.merchandise.product.handle}`} onClick={closeCart} className="lp-media relative block h-20 w-16 shrink-0">
                      {image ? <Image src={image.url} alt={image.altText ?? line.merchandise.product.title} fill className="object-cover" sizes="64px" /> : null}
                    </Link>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="lp-label m-0 truncate text-[var(--lp-color-text-strong)]">{line.merchandise.product.title}</p>
                          <p className="lp-log m-0">{line.merchandise.title === 'Default Title' ? 'ONE SIZE' : line.merchandise.title}</p>
                        </div>
                        <p className="lp-label m-0 whitespace-nowrap text-[var(--lp-color-primary-300)]">{formatPrice(lineTotal, line.merchandise.price.currencyCode)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center border border-[var(--lp-color-border-default)]" role="group" aria-label="Quantity">
                          <button onClick={() => updateQuantity(line.id, line.quantity - 1)} className="lp-btn lp-btn--ghost h-9 w-9 border-0 border-r border-[var(--lp-color-border-default)] p-0" aria-label="Decrease quantity">
                            −
                          </button>
                          <span className="lp-ui lp-tabular w-9 text-center">{line.quantity}</span>
                          <button onClick={() => updateQuantity(line.id, line.quantity + 1)} className="lp-btn lp-btn--ghost h-9 w-9 border-0 border-l border-[var(--lp-color-border-default)] p-0" aria-label="Increase quantity">
                            +
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(line.id)} className="lp-btn lp-btn--ghost lp-btn--sm ml-auto" aria-label={`Remove ${line.merchandise.product.title}`}>
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && subtotal ? (
          <div className="space-y-3 border-t border-[var(--lp-color-border-accent)] bg-[var(--lp-color-bg-2)] p-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
            <dl className="lp-meta m-0">
              <dt>Items</dt>
              <dd className="lp-tabular">{count}</dd>
              <dt>Subtotal</dt>
              <dd className="lp-display lp-display-sm text-[var(--lp-color-text-strong)]">{formatPrice(subtotal.amount, subtotal.currencyCode)}</dd>
            </dl>
            <p className="lp-log m-0">SHIPPING AND TAXES CALCULATED AT CHECKOUT</p>
            <a href={cart?.checkoutUrl ?? '#'} className="lp-btn lp-btn--primary lp-btn--lg lp-btn--block">
              GO TO CHECKOUT <span className="lp-btn__arrow">&gt;</span>
            </a>
          </div>
        ) : null}
      </div>
    </>
  );
}
