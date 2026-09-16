'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
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
  const firstImage = images[0] ?? null;
  const secondImage = images[1] ?? null;
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
      <Link href={`/products/${product.handle}`} className="lp-focus-ring block" aria-label={`${product.title} — open item record`}>
        <div className="lp-media relative aspect-[4/5] w-full overflow-hidden border-0 border-b border-[var(--lp-color-border-subtle)]">
          {firstImage ? (
            <>
              <Image
                src={firstImage.url}
                alt={firstImage.altText ?? product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className={`object-cover transition-[transform,opacity] duration-500 ease-lp group-hover:scale-[1.03] ${secondImage ? 'group-hover:opacity-0' : ''}`}
              />
              {secondImage ? (
                <Image
                  src={secondImage.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-opacity duration-500 ease-lp group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-[var(--lp-color-bg-2)]">
              <span className="lp-log">NO IMAGE ON FILE</span>
            </div>
          )}

          <span className={`lp-chip absolute left-2 top-2 max-w-[calc(100%-16px)] truncate bg-[rgba(5,5,5,0.7)] backdrop-blur-[2px] ${compact ? 'hidden md:inline-flex' : ''}`}>{product.lpMeta?.itemCode ?? product.handle.toUpperCase()}</span>
          <span className="lp-chip absolute right-2 top-2 bg-[rgba(5,5,5,0.7)] backdrop-blur-[2px]" data-tone={statusTone(meta.status)}>
            {statusLabel(meta.status)}
          </span>

          {/* desktop quick-add overlay */}
          {sizes.length > 0 && anyAvailable ? (
            <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-[rgba(5,5,5,0.9)] p-2 backdrop-blur-[3px] transition-transform duration-300 ease-lp group-hover:translate-y-0 group-focus-within:translate-y-0 md:block">
              <p className="lp-log m-0 mb-1 text-[var(--lp-color-text-dim)]">QUICK ADD</p>
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    disabled={!size.variant || adding !== null}
                    onClick={(event) => {
                      event.preventDefault();
                      if (size.variant) quickAdd(size.variant.id, size.value);
                    }}
                    className="lp-toggle min-h-[34px] min-w-[38px] px-2 disabled:line-through disabled:opacity-40"
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

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <Link href={`/products/${product.handle}`} className="lp-focus-ring block">
            <h3 className={`lp-display m-0 text-[var(--lp-color-text-strong)] transition-colors duration-150 group-hover:text-[var(--lp-color-primary-300)] ${compact ? 'text-[18px]' : 'text-[20px] md:text-[24px]'}`}>
              {product.title}
            </h3>
          </Link>
          <p className="lp-log m-0 mt-1 truncate">{categoryLine || formatMetaLabel(meta.category)}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <p className="lp-label lp-label-lg m-0 text-[var(--lp-color-text-strong)]">{formatPrice(price.amount, price.currencyCode)}</p>
          {sizes.length > 1 ? (
            <div className="flex flex-wrap justify-end gap-[3px]" aria-label="Size availability">
              {sizes.map((size) => (
                <span
                  key={size.value}
                  title={`${size.value}${size.variant ? '' : ' sold out'}`}
                  className={`lp-ui-sm inline-flex h-[18px] min-w-[18px] items-center justify-center border px-[3px] text-[10px] ${
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
        {sizes.length > 0 && anyAvailable ? (
          <div className="md:hidden">
            {quickOpen ? (
              <div className="flex flex-wrap gap-1">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    disabled={!size.variant || adding !== null}
                    onClick={() => size.variant && quickAdd(size.variant.id, size.value)}
                    className="lp-toggle min-h-[40px] min-w-[44px] flex-1 disabled:line-through disabled:opacity-40"
                    data-active={added === size.value ? 'true' : undefined}
                  >
                    {adding === size.value ? '…' : added === size.value ? '✓' : size.value}
                  </button>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => setQuickOpen(true)} className="lp-btn lp-btn--sm lp-btn--block">
                QUICK ADD
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
