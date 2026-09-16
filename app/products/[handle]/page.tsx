import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/product/ProductDetail';
import { getProductByHandle, getProducts } from '@/lib/queries/products';
import { getProductCatalogMeta } from '@/lib/site';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { handle: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  if (!product) return { title: 'Item not found' };
  const image = product.images.edges[0]?.node.url;
  const summary = (product.lpMeta?.shortDescription ?? product.lpMeta?.summary ?? product.description ?? '').slice(0, 160);
  return {
    title: product.title,
    description: summary || `${product.title} — La Propagande`,
    openGraph: { title: product.title, description: summary, images: image ? [{ url: image }] : undefined },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, allProducts] = await Promise.all([getProductByHandle(params.handle), getProducts()]);

  if (!product) {
    notFound();
  }

  const meta = getProductCatalogMeta(product);
  const related = allProducts
    .filter((item) => item.handle !== product.handle)
    .sort((a, b) => {
      const am = getProductCatalogMeta(a);
      const bm = getProductCatalogMeta(b);
      const score = (m: typeof am) => Number(m.collection === meta.collection) * 2 + Number(m.category === meta.category);
      return score(bm) - score(am);
    })
    .slice(0, 4);

  return (
    <div className="lp-shell lp-page-pad">
      <ProductDetail product={product} relatedProducts={related} />
    </div>
  );
}
