import { Suspense } from 'react';
import type { Metadata } from 'next';
import { COMMERCE_ENABLED } from '@/lib/commerce';
import Image from 'next/image';
import Link from 'next/link';
import ProductsCatalog from '@/components/product/ProductsCatalog';
import { PageHeader } from '@/components/system/Primitives';
import { getProducts } from '@/lib/queries/products';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Store',
  description: 'Tops, bottoms, accessories and custom jackets from La Propagande. Catalog software, Paris ↔ Beirut.',
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="STORE.exe" title="Catalog" strip={`INVENTORY NODE LP-STORE · ${products.length} RECORDS · ${COMMERCE_ENABLED ? 'CHECKOUT VIA CART' : 'DEMO · ORDERING COMING SOON'}`}>
        <Link href="/custom-jackets" className="group lp-panel lp-panel--interactive lp-panel--accent flex items-center gap-3 p-2 pr-4 lp-focus-ring">
          <span className="lp-media relative block h-12 w-12 shrink-0">
            <Image src="/images/brand/photo-jacket-rack.webp" alt="" fill sizes="48px" className="object-cover" />
          </span>
          <span>
            <span className="lp-label block text-[var(--lp-color-text-strong)]">Custom Jackets</span>
            <span className="lp-log block">ONE-OFF BUILDS · OPEN REQUEST TRACK</span>
          </span>
          <span className="lp-btn__arrow ml-2 text-[var(--lp-color-primary-400)]">&gt;</span>
        </Link>
      </PageHeader>

      <Suspense fallback={<p className="lp-log m-0">LOADING CATALOG MODULE...</p>}>
        <ProductsCatalog products={products} />
      </Suspense>
    </div>
  );
}
