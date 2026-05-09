'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useCart } from './CartProvider';
import type { CartLine } from '@/lib/types';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart } = useCart();

  const lines: CartLine[] = cart?.lines.edges.map((e) => e.node) ?? [];
  const subtotal = cart?.cost.subtotalAmount;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  return (
    <>
      {isOpen ? <div className="fixed inset-0 z-[199] bg-black/70" onClick={closeCart} aria-hidden="true" /> : null}

      <div
        className={`fixed right-0 top-0 z-[200] h-full w-[calc(100%-2rem)] border-l border-[var(--lp-color-border-accent)] bg-[var(--lp-color-bg-2)] transition-transform duration-200 sm:w-[360px] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Cart"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col">
          <div className="lp-panel-title">
            <span className="font-lp-ui text-[11px] uppercase text-[var(--lp-color-text-strong)]">CART</span>
            <button onClick={closeCart} className="lp-log text-[10px] hover:text-[var(--lp-color-primary-100)]" aria-label="Close cart">
              CLOSE
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {lines.length === 0 ? (
              <div className="space-y-1 text-center">
                <p className="m-0 text-[14px] text-[var(--lp-color-text-main)]">Your cart is empty</p>
                <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">Pick pieces from the Store to start checkout.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {lines.map((line) => {
                  const image = line.merchandise.product.images.edges[0]?.node ?? null;
                  return (
                    <li key={line.id} className="border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] p-2">
                      <div className="flex gap-2">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-[var(--lp-color-border-subtle)]">
                          {image ? (
                            <Image src={image.url} alt={image.altText ?? line.merchandise.product.title} fill className="object-cover" sizes="56px" />
                          ) : (
                            <div className="h-full w-full bg-[var(--lp-color-bg-3)]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-strong)]">{line.merchandise.product.title}</p>
                          <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">{line.merchandise.title}</p>
                          <p className="lp-log m-0 text-[10px] text-[var(--lp-color-primary-100)]">
                            {line.merchandise.price.currencyCode} {parseFloat(line.merchandise.price.amount).toFixed(2)}
                          </p>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(line.id, line.quantity - 1)}
                              className="h-6 w-6 border border-[var(--lp-color-border-default)] text-[var(--lp-color-text-main)] hover:border-[var(--lp-color-border-accent)]"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="lp-log w-5 text-center text-[10px]">{line.quantity}</span>
                            <button
                              onClick={() => updateQuantity(line.id, line.quantity + 1)}
                              className="h-6 w-6 border border-[var(--lp-color-border-default)] text-[var(--lp-color-text-main)] hover:border-[var(--lp-color-border-accent)]"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(line.id)}
                              className="ml-auto lp-log border border-[var(--lp-color-border-default)] px-2 py-[2px] text-[9px] hover:border-[var(--lp-color-border-accent)]"
                              aria-label="Remove item"
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {lines.length > 0 && subtotal ? (
            <div className="space-y-2 border-t border-[var(--lp-color-border-default)] p-3">
              <p className="m-0 text-[12px] text-[var(--lp-color-text-main)]">
                Subtotal: {subtotal.currencyCode} {parseFloat(subtotal.amount).toFixed(2)}
              </p>
              <a
                href={cart?.checkoutUrl ?? '#'}
                className="lp-focus-ring block border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.22)] px-2 py-3 text-center lp-log text-[10px] text-[var(--lp-color-text-strong)] hover:border-[var(--lp-color-border-accent-bright)]"
              >
                GO TO CHECKOUT
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
