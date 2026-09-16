'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ShopifyImage } from '@/lib/types';
import { useCart } from '@/components/store/CartProvider';
import { MetaList, Panel, PanelTitleBar, StatusChip, StatusStrip } from '@/components/system/Primitives';
import type { ChipTone } from '@/components/system/Primitives';
import { getProductCatalogMeta } from '@/lib/site';
import { findVariant, formatPrice, getOptionGroups, getVariants, isValueAvailable, swatchColor } from '@/lib/product-options';

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

function statusInfo(status: string): { label: string; tone: ChipTone } {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'IN STOCK', tone: 'success' };
    case 'LIMITED':
    case 'ARCHIVE':
      return { label: 'LIMITED', tone: 'warning' };
    case 'COMING_SOON':
      return { label: 'MADE TO ORDER', tone: 'info' };
    default:
      return { label: 'SOLD OUT', tone: 'locked' };
  }
}

function itemCode(product: Product): string {
  return product.lpMeta?.itemCode?.trim() || `LP-${product.handle.slice(0, 8).toUpperCase()}`;
}

function formatCategory(category: string | undefined): string | undefined {
  if (!category) return undefined;
  return category.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function summaryBullets(summary?: string): string[] {
  const cleaned = summary?.trim();
  if (!cleaned) return [];
  return cleaned
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function isColorName(name: string) {
  return /colou?r|couleur/i.test(name);
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const images: ShopifyImage[] = product.images.edges.map((edge) => edge.node);
  const variants = getVariants(product);
  const groups = useMemo(() => getOptionGroups(product), [product]);
  const { addToCart, openCart } = useCart();

  const initialSelection = useMemo(() => {
    const firstAvailable = variants.find((variant) => variant.availableForSale) ?? variants[0];
    const selection: Record<string, string> = {};
    for (const option of firstAvailable?.selectedOptions ?? []) selection[option.name] = option.value;
    return selection;
  }, [variants]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [buyBarVisible, setBuyBarVisible] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);

  const selectedVariant = useMemo(() => findVariant(product, selection), [product, selection]);
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const catalogMeta = useMemo(() => getProductCatalogMeta(product), [product]);
  const status = product.lpMeta?.status ?? (selectedVariant?.availableForSale ? 'AVAILABLE' : 'SOLD_OUT');
  const statusMeta = statusInfo(status);
  const canBuy = Boolean(selectedVariant?.availableForSale);

  const shortDescription = (product.lpMeta?.shortDescription ?? '').trim();
  const summaryItems = summaryBullets(product.lpMeta?.summary ?? catalogMeta.shortDescription);
  const fileNotes = product.lpMeta?.fileNotes?.trim();
  const selectedImage = images[imageIndex] ?? images[0] ?? null;

  // mobile sticky buy bar when the main CTA scrolls away
  useEffect(() => {
    const node = buyRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setBuyBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (images.length < 2) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.key === 'ArrowRight') setImageIndex((i) => (i + 1) % images.length);
      if (event.key === 'ArrowLeft') setImageIndex((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length]);

  async function handleAddToCart() {
    if (!selectedVariant || !canBuy) return;
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, quantity);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1800);
      window.setTimeout(openCart, 260);
    } finally {
      setAdding(false);
    }
  }

  function select(name: string, value: string) {
    setSelection((current) => ({ ...current, [name]: value }));
  }

  const metadata = [
    { label: 'Item code', value: itemCode(product) },
    { label: 'Collection', value: product.lpMeta?.collection ?? product.lpMeta?.drop ?? catalogMeta.collection ?? 'Unassigned' },
    { label: 'Category', value: formatCategory(product.lpMeta?.category ?? catalogMeta.category) ?? product.productType ?? 'Unassigned' },
    { label: 'Origin', value: product.lpMeta?.origin ?? 'Paris ↔ Beirut' },
    ...(product.lpMeta?.transmission ? [{ label: 'Transmission', value: product.lpMeta.transmission }] : []),
    ...(product.lpMeta?.drop ? [{ label: 'Drop', value: product.lpMeta.drop }] : []),
  ];

  const buyButton = (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!canBuy || adding}
      className={`lp-btn lp-btn--primary lp-btn--lg lp-btn--block ${justAdded ? '!border-[var(--lp-color-status-online)]' : ''}`}
      aria-live="polite"
    >
      {adding ? 'ADDING…' : justAdded ? '✓ ADDED TO CART' : canBuy ? `ADD TO CART · ${formatPrice(price.amount, price.currencyCode)}` : statusMeta.label}
    </button>
  );

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="lp-log flex flex-wrap items-center gap-2">
        <Link href="/products" className="hover:text-[var(--lp-color-text-strong)]">
          STORE.exe
        </Link>
        <span className="text-[var(--lp-color-text-dim)]">/</span>
        <Link href={`/products?c=${product.lpMeta?.category ?? catalogMeta.category}`} className="hover:text-[var(--lp-color-text-strong)]">
          {(formatCategory(product.lpMeta?.category ?? catalogMeta.category) ?? 'ITEMS').toUpperCase()}
        </Link>
        <span className="text-[var(--lp-color-text-dim)]">/</span>
        <span className="text-[var(--lp-color-text-main)]">{itemCode(product)}</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start">
        {/* GALLERY */}
        <Panel ticks reveal={0} className="overflow-hidden lg:sticky lg:top-[calc(var(--lp-topbar-h)+12px)]">
          <PanelTitleBar title="MEDIA.GALLERY" meta={images.length ? `${String(imageIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}` : 'NO ASSETS'} />
          <div className="grid gap-2 p-2 md:grid-cols-[64px_1fr]">
            {images.length > 1 ? (
              <div className="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-visible" role="tablist" aria-label="Product images">
                {images.map((img, idx) => (
                  <button
                    key={`${img.url}-${idx}`}
                    role="tab"
                    aria-selected={imageIndex === idx}
                    onClick={() => setImageIndex(idx)}
                    aria-label={img.altText ?? `View image ${idx + 1}`}
                    className={`lp-media relative h-16 w-16 shrink-0 transition-[border-color,opacity] duration-150 ${
                      imageIndex === idx ? 'border-[var(--lp-color-primary-500)] opacity-100' : 'border-[var(--lp-color-border-default)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="lp-media relative order-1 aspect-[4/5] w-full md:order-2 md:aspect-auto md:min-h-[560px]">
              {selectedImage ? (
                <Image key={selectedImage.url} src={selectedImage.url} alt={selectedImage.altText ?? product.title} fill sizes="(max-width: 1024px) 100vw, 60vw" className="lp-command-output object-cover" priority />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center">
                  <span className="lp-log">NO IMAGE ON FILE</span>
                </div>
              )}
              {images.length > 1 ? (
                <>
                  <button type="button" onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)} className="lp-btn lp-btn--icon absolute left-2 top-1/2 -translate-y-1/2 bg-[rgba(5,5,5,0.7)]" aria-label="Previous image">
                    &lt;
                  </button>
                  <button type="button" onClick={() => setImageIndex((i) => (i + 1) % images.length)} className="lp-btn lp-btn--icon absolute right-2 top-1/2 -translate-y-1/2 bg-[rgba(5,5,5,0.7)]" aria-label="Next image">
                    &gt;
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </Panel>

        {/* RECORD */}
        <div className="space-y-3">
          <Panel reveal={1}>
            <PanelTitleBar title="ITEM.RECORD" meta={itemCode(product)} />
            <div className="space-y-5 p-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip label={statusMeta.label} tone={statusMeta.tone} dot />
                  {product.lpMeta?.collection ? <StatusChip label={product.lpMeta.collection} /> : null}
                </div>
                <h1 className="lp-display lp-display-lg m-0 text-[var(--lp-color-text-strong)]">{product.title}</h1>
                <p className="lp-display lp-display-md m-0 text-[var(--lp-color-primary-300)]">{formatPrice(price.amount, price.currencyCode)}</p>
                {shortDescription ? <p className="lp-body m-0">{shortDescription}</p> : null}
              </div>

              {groups.map((group) => {
                const chosen = selection[group.name];
                const color = isColorName(group.name);
                return (
                  <fieldset key={group.name} className="m-0 space-y-2 border-0 p-0">
                    <legend className="lp-log mb-1 flex w-full items-center justify-between p-0">
                      <span>{group.name.toUpperCase()}</span>
                      <span className="text-[var(--lp-color-text-main)]">{chosen}</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const available = isValueAvailable(product, selection, group.name, value);
                        const active = chosen === value;
                        if (color) {
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => select(group.name, value)}
                              aria-pressed={active}
                              aria-label={`${value}${available ? '' : ' — sold out'}`}
                              title={value}
                              className={`relative h-11 w-11 border p-[3px] transition-[border-color,transform] duration-150 ease-lp hover:-translate-y-[1px] ${
                                active ? 'border-[var(--lp-color-primary-500)]' : 'border-[var(--lp-color-border-default)]'
                              } ${available ? '' : 'opacity-40'}`}
                            >
                              <span className="block h-full w-full" style={{ background: swatchColor(value) }} />
                              {!available ? <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_47%,var(--lp-color-primary-500)_48%,var(--lp-color-primary-500)_52%,transparent_53%)]" /> : null}
                            </button>
                          );
                        }
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => select(group.name, value)}
                            className={`lp-toggle min-h-[44px] min-w-[52px] flex-1 sm:flex-none ${available ? '' : 'line-through opacity-50'}`}
                            aria-pressed={active}
                            aria-label={`${group.name} ${value}${available ? '' : ' — sold out'}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              <div ref={buyRef} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-[var(--lp-color-border-default)]" role="group" aria-label="Quantity">
                    <button type="button" onClick={() => setQuantity((c) => Math.max(1, c - 1))} className="lp-btn lp-btn--ghost h-11 w-11 border-0 border-r border-[var(--lp-color-border-default)]" aria-label="Decrease quantity">
                      −
                    </button>
                    <span className="lp-label lp-tabular w-12 text-center text-[var(--lp-color-text-strong)]" aria-live="polite">
                      {quantity}
                    </span>
                    <button type="button" onClick={() => setQuantity((c) => Math.min(20, c + 1))} className="lp-btn lp-btn--ghost h-11 w-11 border-0 border-l border-[var(--lp-color-border-default)]" aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <p className="lp-log m-0">{canBuy ? 'PURCHASE READY · SHIPS FROM PAR/BEY' : 'THIS COMBINATION IS UNAVAILABLE'}</p>
                </div>
                {buyButton}
                {product.lpMeta?.category === 'custom-jackets' ? (
                  <Link href="/custom-jackets" className="lp-btn lp-btn--block">
                    OPEN CUSTOM REQUEST TRACK <span className="lp-btn__arrow">&gt;</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </Panel>

          {summaryItems.length > 0 ? (
            <Panel reveal={2}>
              <PanelTitleBar title="SPEC" meta="SHORT FORM" />
              <ul className="lp-body m-0 list-none space-y-1 p-4">
                {summaryItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-[var(--lp-color-primary-500)]">■</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel reveal={3}>
            <PanelTitleBar title="DOSSIER" meta="RECORD FIELDS" />
            <div className="p-4">
              <MetaList fields={metadata} />
            </div>
          </Panel>
        </div>
      </div>

      <Panel reveal={4}>
        <PanelTitleBar title="DESCRIPTION.LOG" meta="LONG FORM" />
        <div className="grid gap-6 p-4 md:grid-cols-[minmax(0,68ch)_1fr]">
          {product.descriptionHtml ? (
            <div className="lp-body lp-prose" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          ) : (
            <p className="lp-body m-0">{product.description || 'No long description on file.'}</p>
          )}
          {fileNotes ? (
            <div className="border-t border-[var(--lp-color-border-subtle)] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <button type="button" onClick={() => setNotesOpen((o) => !o)} className="lp-label flex w-full items-center justify-between text-[var(--lp-color-primary-400)]" aria-expanded={notesOpen}>
                FILE NOTES
                <span className={`transition-transform duration-200 ${notesOpen ? 'rotate-90' : ''}`}>&gt;</span>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ease-lp ${notesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="lp-body lp-body-sm m-0 whitespace-pre-line pt-3 text-[var(--lp-color-text-muted)]">{fileNotes}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      {relatedProducts.length > 0 ? (
        <Panel reveal={5}>
          <PanelTitleBar title="RELATED RECORDS" meta="SAME COLLECTION / CATEGORY" />
          <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4">
            {relatedProducts.map((item) => {
              const image = item.images.edges[0]?.node ?? null;
              const itemPrice = item.priceRange.minVariantPrice;
              return (
                <Link key={item.id} href={`/products/${item.handle}`} className="group lp-focus-ring block min-w-0">
                  <span className="lp-media lp-media--zoom relative block aspect-[4/5]">
                    {image ? <Image src={image.url} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /> : null}
                  </span>
                  <span className="lp-label mt-2 block truncate text-[var(--lp-color-text-strong)] transition-colors group-hover:text-[var(--lp-color-primary-300)]">{item.title}</span>
                  <span className="lp-log block">{formatPrice(itemPrice.amount, itemPrice.currencyCode)}</span>
                </Link>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <StatusStrip>
        ITEM DOSSIER · {itemCode(product)} · {statusMeta.label} · {formatPrice(price.amount, price.currencyCode)}
      </StatusStrip>

      {/* mobile sticky buy bar */}
      <div className={`lp-dock md:hidden ${buyBarVisible ? 'translate-y-0' : 'pointer-events-none translate-y-full'} !bottom-[var(--lp-dock-h)] transition-transform duration-300 ease-lp`} aria-hidden={!buyBarVisible}>
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1">
            <span className="lp-label block truncate text-[var(--lp-color-text-strong)]">{product.title}</span>
            <span className="lp-log block">{Object.values(selection).join(' / ')}</span>
          </span>
          <button type="button" onClick={handleAddToCart} disabled={!canBuy || adding} className="lp-btn lp-btn--primary">
            {adding ? '…' : justAdded ? '✓' : `ADD · ${formatPrice(price.amount, price.currencyCode)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
