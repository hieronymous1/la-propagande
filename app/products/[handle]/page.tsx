import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import { StatusStrip } from '@/components/system/Primitives';
import { getProductByHandle, getProducts } from '@/lib/queries/products';

interface ProductPageProps {
  params: { handle: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, allProducts] = await Promise.all([getProductByHandle(params.handle), getProducts()]);

  if (!product) {
    notFound();
  }

  const related = allProducts.filter((item) => item.handle !== product.handle).slice(0, 4);

  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>MODULE: ITEM VIEW / NODE: {product.handle.toUpperCase()} / SOURCE: STORE.exe / MODE: DOSSIER</StatusStrip>
      <ProductDetail product={product} relatedProducts={related} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/products"
          className="lp-focus-ring lp-log border border-[var(--lp-color-border-accent)] px-2 py-2 text-[10px] text-[var(--lp-color-primary-100)]"
        >
          {'>'} RETURN TO CATALOG
        </Link>

        <Link
          href="/custom-jackets"
          className="lp-focus-ring lp-log border border-[var(--lp-color-border-default)] px-2 py-2 text-[10px] hover:border-[var(--lp-color-border-accent)]"
        >
          {'>'} CUSTOM JACKETS: VIEW REQUEST TRACK
        </Link>
      </div>
    </div>
  );
}
