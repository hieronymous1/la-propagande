'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { COMMERCE_ENABLED } from '@/lib/commerce';
import { useCart } from '@/components/store/CartProvider';
import { getProductCatalogMeta } from '@/lib/site';
import { formatPrice, getQuickAddSizes } from '@/lib/product-options';
import type { ChipTone } from '@/components/system/Primitives';

interface ProductCardProps {
  product: Product;
  index?: number;
  compact?: boolean;
}

function formatMetaLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function statusTone(status: string): ChipTone {
  if (status === 'AVAILABLE') return 'success';
  if (status === 'LIMITED' || status === 'ARCHIVE') return 'warning';
  if (status === 'COMING_SOON') return 'info';
  return 'locked';
}

function statusLabel(status: string): string {
  if (status === 'ARCHIVE') return 'LIMITED';
  if (status === 'COMING_SOON') return 'MADE TO ORDER';
  return status.replace('_', ' ');
}

export default function ProductCard({ product, index = 0, compact = false }: ProductCardProps) {
  const images = product.images.edges.map((edge) => edge.node);
  const [imageIndex, setImageIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const selectedImage = images[imageIndex] ?? images[0] ?? null;
  const price = product.priceRange.minVariantPrice;
  const meta = getProductCatalogMeta(product);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  const sizes = getQuickAddSizes(product);
  const anyAvailable = sizes.some((size) => size.variant);
  const categoryLine = [meta.collection, meta.subcategory ? formatMetaLabel(meta.subcategory) : formatMetaLabel(meta.category)].filter(Boolean).join(' · ');

  async function quickAdd(variantId: string, label: string) {
    if (!COMMERCE_ENABLED) return;
    setAdding(label);
    try {
      await addToCart(variantId, 1);
      setAdded(label);
      window.setTimeout(() => setAdded(null), 1400);
    } finally {
      setAdding(null);
    }
  }

  return (
    <article className="lp-panel lp-panel--interactive lp-reveal group flex flex-col" style={{ ['--i' as string]: Math.min(index, 12) }}>
      <div className="relative">
      <Link href={`/products/${product.handle}`} className="lp-focus-ring block" aria-label={`${product.title} — open item record`}>
        <div
          className="lp-media relative aspect-[4/5] w-full touch-pan-y overflow-hidden border-0 border-b border-[var(--lp-color-border-subtle)]"
          onPointerDown={(event) => {
            swiped.current = false;
            swipeStart.current = event.pointerType === 'touch' ? event.clientX : null;
          }}
          onPointerUp={(event) => {
            if (swipeStart.current === null || images.length < 2) return;
            const delta = event.clientX - swipeStart.current;
            swipeStart.current = null;
            if (Math.abs(delta) < 40) return;
            // a swipe changes the photo; the click that follows must not open the item
            swiped.current = true;
            setImageIndex((i) => (delta < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length));
          }}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
          onClickCapture={(event) => {
            if (!swiped.current) return;
            swiped.current = false;
            event.preventDefault();
          }}
        >
          {selectedImage ? (
            <Image
              src={selectedImage.url}
              alt={selectedImage.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--lp-color-bg-2)]">
              <span className="lp-log">NO IMAGE ON FILE</span>
            </div>
          )}

          <span className={`lp-chip absolute left-0 top-0 max-w-[60%] truncate border-l-0 border-t-0 ${compact ? 'hidden md:inline-flex' : ''}`}>{product.lpMeta?.itemCode ?? product.handle.toUpperCase()}</span>
          {/* availability is only worth a tag when it is news */}
          {meta.status !== 'AVAILABLE' ? (
            <span className="lp-chip lp-chip--dot absolute right-0 top-0 border-r-0 border-t-0" data-tone={statusTone(meta.status)}>
              {statusLabel(meta.status)}
            </span>
          ) : null}

          {/* desktop quick-add overlay */}
          {COMMERCE_ENABLED && sizes.length > 0 && anyAvailable ? (
            <div className="absolute inset-x-0 bottom-0 hidden translate-y-full border-t border-[var(--lp-color-primary-700)] bg-[rgba(5,5,5,0.94)] p-2 transition-transform duration-200 ease-lp group-hover:translate-y-0 group-focus-within:translate-y-0 md:block">
              <p className="lp-log m-0 mb-[6px] text-[var(--lp-color-text-muted)]">QUICK ADD · SELECT SIZE</p>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-1">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    disabled={!size.variant || adding !== null}
                    onClick={(event) => {
                      event.preventDefault();
                      if (size.variant) quickAdd(size.variant.id, size.value);
                    }}
                    className="lp-toggle min-h-[38px] px-2 disabled:line-through disabled:opacity-40"
                    data-active={added === size.value ? 'true' : undefined}
                    aria-label={`Add size ${size.value} to cart`}
                  >
                    {adding === size.value ? '…' : added === size.value ? '✓' : size.value}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Link>
      {images.length > 1 ? (
        <div className="absolute bottom-0 right-0 flex items-center border-l border-t border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)]" role="group" aria-label={`${product.title} photos`}>
          <button type="button" className="lp-btn lp-btn--icon min-h-[44px] min-w-[44px] border-0" aria-label={`Previous photo of ${product.title}`} onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}>&lt;</button>
          <span className="lp-log lp-tabular px-1" aria-live="polite" aria-atomic="true">{imageIndex + 1}/{images.length}</span>
          <button type="button" className="lp-btn lp-btn--icon min-h-[44px] min-w-[44px] border-0" aria-label={`Next photo of ${product.title}`} onClick={() => setImageIndex((i) => (i + 1) % images.length)}>&gt;</button>
        </div>
      ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
        <div className="min-w-0">
          <Link href={`/products/${product.handle}`} className="lp-focus-ring block">
            <h3 className={`lp-title m-0 text-[var(--lp-color-text-strong)] transition-colors duration-150 group-hover:text-[var(--lp-color-primary-300)] ${compact ? 'text-[16px] md:text-[20px]' : 'text-[20px] md:text-[22px]'}`}>
              {product.title}
            </h3>
          </Link>
          <p className="lp-log m-0 mt-[6px] truncate">{categoryLine || formatMetaLabel(meta.category)}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-[var(--lp-color-border-subtle)] pt-3">
          <p className="lp-label lp-label-lg lp-tabular m-0 text-[var(--lp-color-text-strong)]">{formatPrice(price.amount, price.currencyCode)}</p>
          {sizes.length > 1 ? (
            <div className={`flex-wrap justify-end gap-[3px] ${compact ? 'hidden md:flex' : 'flex'}`} aria-label="Size availability">
              {sizes.map((size) => (
                <span
                  key={size.value}
                  title={`${size.value}${size.variant ? '' : ' sold out'}`}
                  className={`lp-ui-sm inline-flex h-[20px] min-w-[22px] items-center justify-center border px-[4px] ${
                    size.variant ? 'border-[var(--lp-color-border-default)] text-[var(--lp-color-text-muted)]' : 'border-[var(--lp-color-border-subtle)] text-[var(--lp-color-text-dim)] line-through'
                  }`}
                >
                  {size.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* mobile quick add */}
        {COMMERCE_ENABLED && sizes.length > 0 && anyAvailable ? (
          <div className="md:hidden">
            {quickOpen ? (
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    disabled={!size.variant || adding !== null}
                    onClick={() => size.variant && quickAdd(size.variant.id, size.value)}
                    className="lp-toggle min-h-[44px] min-w-[44px] flex-1 disabled:line-through disabled:opacity-40"
                    data-active={added === size.value ? 'true' : undefined}
                  >
                    {adding === size.value ? '…' : added === size.value ? '✓' : size.value}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => setQuickOpen(true)} className="lp-btn lp-btn--sm lp-btn--block min-h-[44px]">
                QUICK ADD
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
