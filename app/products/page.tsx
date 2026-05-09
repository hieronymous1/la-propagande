import { Suspense } from 'react';
import Link from 'next/link';
import ProductsCatalog from '@/components/product/ProductsCatalog';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';
import { getProducts } from '@/lib/queries/products';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="lp-shell py-4">
      <Panel>
        <PanelTitleBar title="STORE.exe" meta="CATALOG SOFTWARE" />
        <div className="space-y-3 p-[10px]">
          <StatusStrip>CATALOG STATUS: ACTIVE / CHECKOUT: CART / INVENTORY NODE: LP-STORE</StatusStrip>
          <p className="m-0 max-w-[920px] text-[14px] leading-[1.5] text-[var(--lp-color-text-main)]">
            Browse Tops, Bottoms, Accessories, and Custom Jackets. Use search, category filters, and collection filters to find item records quickly.
          </p>
          <Link
            href="/custom-jackets"
            className="lp-focus-ring block border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.16)] p-3 hover:border-[var(--lp-color-border-accent-bright)]"
          >
            <p className="font-lp-ui m-0 text-[15px] uppercase leading-[1.2] text-[var(--lp-color-text-strong)]">Custom Jackets</p>
            <p className="m-0 pt-1 text-[13px] text-[var(--lp-color-text-main)]">
              One-off and small-run jackets. Review the gallery and submit a request to start your build.
            </p>
            <p className="lp-log m-0 pt-2 text-[10px] text-[var(--lp-color-primary-100)]">OPEN CUSTOM JACKETS &gt;</p>
          </Link>
        </div>
      </Panel>

      <div className="pt-3">
        <Suspense fallback={<p className="lp-log m-0 text-[11px]">LOADING CATALOG MODULE...</p>}>
          <ProductsCatalog products={products} />
        </Suspense>
      </div>
    </div>
  );
}
