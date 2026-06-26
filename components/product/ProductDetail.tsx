'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product, ProductVariant, ShopifyImage } from '@/lib/types';
import { useCart } from '@/components/store/CartProvider';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

interface ProductDetailProps {
  product: Product;
  relatedProducts?: Product[];
}

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)} ${currencyCode}`;
}

function productStatus(product: Product, selectedVariant: ProductVariant | null): 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' | 'COMING_SOON' | 'ARCHIVE' {
  if (product.lpMeta?.status) return product.lpMeta.status;
  if (!selectedVariant) return 'SOLD_OUT';
  return selectedVariant.availableForSale ? 'AVAILABLE' : 'SOLD_OUT';
}

function formatStatus(status: ReturnType<typeof productStatus>): string {
  switch (status) {
    case 'AVAILABLE':
    case 'LIMITED':
      return 'In Stock';
    case 'SOLD_OUT':
      return 'Sold Out';
    case 'ARCHIVE':
      return 'Limited';
    case 'COMING_SOON':
      return 'Made to Order';
    default:
      return status;
  }
}

function itemCode(product: Product): string {
  return product.lpMeta?.itemCode ?? `LP-${product.handle.slice(0, 8).toUpperCase()}`;
}

function formatCategory(category: string | undefined): string | undefined {
  if (!category) return undefined;
  if (category === 'custom-jackets') return 'Custom Jackets';
  return category.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
}

function summaryBullets(summary?: string): string[] {
  const cleaned = summary?.trim();
  if (!cleaned) return ['No summary available.'];

  return cleaned
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean);
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const images: ShopifyImage[] = product.images.edges.map((edge) => edge.node);
  const variants: ProductVariant[] = product.variants.edges.map((edge) => edge.node);

  const [selectedImage, setSelectedImage] = useState<ShopifyImage>(
    images[0] ?? { url: '', altText: null, width: null, height: null }
  );
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const summary = product.lpMeta?.summary?.trim();
  const summaryItems = summaryBullets(summary);
  const fileNotes = product.lpMeta?.fileNotes?.trim();
  const status = productStatus(product, selectedVariant);
  const friendlyStatus = formatStatus(status);

  const metadata = useMemo(
    () => [
      { label: 'Collection', value: product.lpMeta?.collection ?? product.lpMeta?.drop ?? 'Unassigned' },
      { label: 'Category', value: formatCategory(product.lpMeta?.category) ?? product.productType ?? 'Unassigned' },
      { label: 'Item Code', value: itemCode(product) },
      { label: 'Status', value: friendlyStatus },
      { label: 'Origin', value: product.lpMeta?.origin ?? 'Hybrid Node' },
    ],
    [product, friendlyStatus]
  );

  const secondaryMeta = useMemo(
    () =>
      [
        { label: 'Transmission', value: product.lpMeta?.transmission ?? 'Not available' },
        { label: 'Drop', value: product.lpMeta?.drop ?? 'Not available' },
        fileNotes ? { label: 'File Notes', value: fileNotes } : null,
      ].filter((field): field is { label: string; value: string } => Boolean(field)),
    [fileNotes, product]
  );

  async function handleAddToCart() {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, quantity);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-3">
      <StatusStrip>ITEM DOSSIER / HANDLE: {product.handle.toUpperCase()} / STATUS: {friendlyStatus.toUpperCase()} / PRICE: {formatPrice(price.amount, price.currencyCode)}</StatusStrip>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="overflow-hidden">
          <PanelTitleBar title="MEDIA.GALLERY" meta={`ASSETS: ${images.length}`} />
          {selectedImage.url ? (
            <div className="space-y-2 p-[10px]">
              <div className="relative h-[360px] w-full overflow-hidden border border-[var(--lp-color-border-subtle)] bg-[var(--lp-color-bg-1)] md:h-[560px]">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.altText ?? product.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
              {images.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={`${img.url}-${idx}`}
                      onClick={() => setSelectedImage(img)}
                      aria-label={img.altText ?? `View image ${idx + 1}`}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden border ${
                        selectedImage.url === img.url
                          ? 'border-[var(--lp-color-border-accent-bright)]'
                          : 'border-[var(--lp-color-border-default)] hover:border-[var(--lp-color-border-accent)]'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText ?? `${product.title} ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-[360px] items-center justify-center p-[10px] md:h-[560px]">
              <span className="lp-log">NO IMAGE AVAILABLE</span>
            </div>
          )}
        </Panel>

        <div className="space-y-3">
          <Panel>
            <PanelTitleBar title="ITEM.RECORD" meta="PURCHASE NODE" />
            <div className="space-y-3 p-[10px]">
              <h1 className="font-lp-ui m-0 text-[30px] uppercase leading-[1.02] text-[var(--lp-color-text-strong)] md:text-[34px]">{product.title}</h1>
              <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">
                Collection:{' '}
                <span className="text-[var(--lp-color-text-main)]">{product.lpMeta?.collection ?? product.lpMeta?.drop ?? 'Unassigned'}</span> / Status:{' '}
                <span className="text-[var(--lp-color-primary-100)]">{friendlyStatus}</span>
              </p>
              <p className="lp-log m-0 text-[11px] text-[var(--lp-color-primary-100)]">SUMMARY: {summaryItems.join(' / ')}</p>

              <p className="lp-log m-0 text-[12px] text-[var(--lp-color-primary-100)]">PRICE: {formatPrice(price.amount, price.currencyCode)}</p>

              <div className="space-y-2">
                <p className="lp-log m-0 text-[10px]">VARIANT / SIZE</p>
                <div className="flex flex-wrap gap-1">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => variant.availableForSale && setSelectedVariant(variant)}
                      disabled={!variant.availableForSale}
                      className={`lp-focus-ring lp-log border px-2 py-[5px] text-[10px] ${
                        !variant.availableForSale
                          ? 'cursor-not-allowed border-[var(--lp-color-border-subtle)] text-[var(--lp-color-text-dim)]'
                          : selectedVariant?.id === variant.id
                            ? 'border-[var(--lp-color-border-accent-bright)] text-[var(--lp-color-primary-100)]'
                            : 'border-[var(--lp-color-border-default)] hover:border-[var(--lp-color-border-accent)]'
                      }`}
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="lp-log m-0 text-[10px]">QUANTITY</p>
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
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || !selectedVariant.availableForSale || adding}
                className="lp-focus-ring lp-log w-full border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.22)] px-3 py-3 text-[11px] text-[var(--lp-color-text-strong)] hover:border-[var(--lp-color-border-accent-bright)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adding ? 'ADDING TO CART...' : 'ADD TO CART'}
              </button>
              {product.lpMeta?.category === 'custom-jackets' ? (
                <Link
                  href="/custom-jackets"
                  className="lp-focus-ring lp-log inline-flex w-full items-center justify-center border border-[var(--lp-color-border-default)] px-3 py-3 text-[11px] hover:border-[var(--lp-color-border-accent)]"
                >
                  VIEW CUSTOM JACKETS INQUIRY TRACK {'>'}
                </Link>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <PanelTitleBar title="METADATA.BLOCK" meta="DOSSIER FIELDS" />
            <div className="space-y-1 p-[10px]">
              {metadata.map((field) => (
                <p key={field.label} className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">
                  {field.label}:{' '}
                  <span className="text-[var(--lp-color-text-main)]">
                    {field.value}
                  </span>
                </p>
              ))}
              <div className="pt-2">
                {secondaryMeta.map((field) => (
                  <p key={field.label} className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">
                    {field.label}:{' '}
                    <span className="text-[var(--lp-color-text-main)]">
                      {field.value}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <PanelTitleBar title="SUMMARY.LOG" meta="SHORT FORM" />
        <div className="space-y-2 p-[10px] text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
          <ul className="m-0 list-disc space-y-1 pl-5">
            {summaryItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel>
        <PanelTitleBar title="DESCRIPTION.LOG" meta="LONG FORM" />
        <div className="space-y-2 p-[10px] text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
          {product.descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          ) : (
            <p className="m-0">{product.description || 'No long description available.'}</p>
          )}
        </div>
      </Panel>

      {fileNotes ? (
        <Panel>
          <PanelTitleBar title="FILE NOTES" meta="GRAPHIC DOSSIER" />
          <div className="space-y-2 p-[10px] text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
            <p className="m-0 whitespace-pre-line">{fileNotes}</p>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <PanelTitleBar title="RELATED ITEMS" meta="NEXT DOSSIERS" />
        <div className="flex flex-wrap gap-2 p-[10px]">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.handle}`}
                className="lp-focus-ring lp-log border border-[var(--lp-color-border-default)] px-2 py-2 text-[10px] hover:border-[var(--lp-color-border-accent)]"
              >
                {item.title.toUpperCase()} {'>'}
              </Link>
            ))
          ) : (
            <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">NO RELATED ITEMS AVAILABLE.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}
