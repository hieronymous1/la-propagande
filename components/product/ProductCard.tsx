import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
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
  const price = product.priceRange.minVariantPrice;
  const meta = getProductCatalogMeta(product);

  const categoryLine = [meta.collection, meta.subcategory ? formatMetaLabel(meta.subcategory) : formatMetaLabel(meta.category)]
    .filter(Boolean)
    .join(' · ');
  const statusLabel = meta.status === 'ARCHIVE' ? 'LIMITED' : meta.status;

  return (
    <Link href={`/products/${product.handle}`} className="group block w-full lp-focus-ring">
      <Panel className="overflow-hidden transition-[border-color,box-shadow] duration-100 group-hover:border-[var(--lp-color-border-accent-bright)] group-hover:shadow-[var(--lp-shadow-red-soft)]">
        <PanelTitleBar title={product.lpMeta?.itemCode ?? product.handle.toUpperCase()} meta={formatMetaLabel(meta.category)} />

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

          <div className="flex items-end justify-between gap-2 pt-[2px]">
            <p className="m-0 text-[16px] leading-none text-[var(--lp-color-primary-100)]">{formatPrice(price.amount, price.currencyCode)}</p>
            <span className="lp-log text-[10px] text-[var(--lp-color-text-muted)]">ADD TO CART</span>
          </div>
        </div>
      </Panel>
    </Link>
  );
}
