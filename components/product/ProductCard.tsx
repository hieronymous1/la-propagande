'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useCart } from '@/components/store/CartProvider';
import { getProductCatalogMeta } from '@/lib/site';
import { Panel, PanelTitleBar } from '@/components/system/Primitives';

interface ProductCardProps {
  product: Product;
}

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)} ${currencyCode}`;
}

function formatMetaLabel(value: string): string {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function statusClass(status: string): string {
  if (status === 'AVAILABLE') return 'border-[#768F61] text-[#768F61]';
  if (status === 'LIMITED') return 'border-[var(--lp-color-status-warning)] text-[var(--lp-color-status-warning)]';
  if (status === 'ARCHIVE') return 'border-[var(--lp-color-status-warning)] text-[var(--lp-color-status-warning)]';
  if (status === 'COMING_SOON') return 'border-[#788B9C] text-[#788B9C]';
  return 'border-[#6B2A2A] text-[#6B2A2A]';
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images.edges[0]?.node ?? null;
  const firstVariant = product.variants.edges[0]?.node ?? null;
  const price = product.priceRange.minVariantPrice;
  const meta = getProductCatalogMeta(product);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const categoryLine = [meta.collection, meta.subcategory ? formatMetaLabel(meta.subcategory) : formatMetaLabel(meta.category)]
    .filter(Boolean)
    .join(' · ');
  const statusLabel = meta.status === 'ARCHIVE' ? 'LIMITED' : meta.status;
  const canPurchase = Boolean(firstVariant?.availableForSale);

  async function handleAddToCart() {
    if (!firstVariant || !canPurchase) return;

    setAdding(true);
    try {
      await addToCart(firstVariant.id, quantity);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Panel className="overflow-hidden transition-[border-color,box-shadow] duration-100 hover:border-[var(--lp-color-border-accent-bright)] hover:shadow-[var(--lp-shadow-red-soft)]">
      <PanelTitleBar title={product.lpMeta?.itemCode ?? product.handle.toUpperCase()} meta={formatMetaLabel(meta.category)} />

      <Link href={`/products/${product.handle}`} className="group block w-full lp-focus-ring">
        {firstImage ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-[var(--lp-color-border-subtle)] bg-[var(--lp-color-bg-1)]">
            <Image
              src={firstImage.url}
              alt={firstImage.altText ?? product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-100 group-hover:translate-y-[-1px] group-hover:translate-x-[1px]"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center border-b border-[var(--lp-color-border-subtle)] bg-[var(--lp-color-bg-1)]">
            <span className="lp-log text-[10px]">NO PRODUCT IMAGE</span>
          </div>
        )}

        <div className="space-y-[7px] p-[10px]">
          <p className="m-0 font-lp-ui text-[18px] uppercase leading-[1.08] text-[var(--lp-color-text-strong)]">{product.title}</p>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="lp-log m-0 min-w-0 text-[10px] text-[var(--lp-color-text-muted)]">{categoryLine || formatMetaLabel(meta.category)}</p>
            <span className={`lp-log border px-1 py-[2px] text-[10px] ${statusClass(meta.status)}`}>
              {statusLabel.replace('_', ' ')}
            </span>
          </div>

          <p className="lp-log m-0 text-[10px] text-[var(--lp-color-primary-100)]">SUMMARY: {product.lpMeta?.summary ?? meta.shortDescription}</p>
        </div>
      </Link>

      <div className="space-y-2 border-t border-[var(--lp-color-border-subtle)] p-[10px]">
        <div className="flex items-end justify-between gap-2">
          <p className="m-0 text-[16px] leading-none text-[var(--lp-color-primary-100)]">{formatPrice(price.amount, price.currencyCode)}</p>
          <span className="lp-log text-[10px] text-[var(--lp-color-text-muted)]">{canPurchase ? 'PURCHASE READY' : 'UNAVAILABLE'}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center border border-[var(--lp-color-border-default)]">
            <button
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-9 w-9 border-r border-[var(--lp-color-border-default)] text-[var(--lp-color-text-main)] hover:text-[var(--lp-color-primary-100)]"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="lp-log w-9 text-center text-[11px]">{quantity}</span>
            <button
              onClick={() => setQuantity((current) => current + 1)}
              className="h-9 w-9 border-l border-[var(--lp-color-border-default)] text-[var(--lp-color-text-main)] hover:text-[var(--lp-color-primary-100)]"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canPurchase || adding}
            className="lp-focus-ring lp-log min-h-[36px] flex-1 border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.22)] px-3 py-2 text-[10px] text-[var(--lp-color-text-strong)] hover:border-[var(--lp-color-border-accent-bright)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="ADD TO CART"
          >
            {adding ? 'ADDING...' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </Panel>
  );
}
