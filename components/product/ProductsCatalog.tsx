'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';
import { getProductCatalogMeta } from '@/lib/site';
import type { Product } from '@/lib/types';

type CategoryId = 'all' | 'tops' | 'bottoms' | 'accessories' | 'custom-jackets';
type StatusFilter = 'all' | 'available' | 'limited' | 'sold-out' | 'coming-soon';
type SortMode = 'latest' | 'low-high' | 'high-low';

const SUBCATEGORY_MAP: Record<Exclude<CategoryId, 'all'>, { value: string; label: string }[]> = {
  tops: [
    { value: 'tees', label: 'TEES' },
    { value: 'long-sleeves', label: 'LONG SLEEVES' },
    { value: 'hoodies', label: 'HOODIES' },
    { value: 'jerseys', label: 'JERSEYS' },
    { value: 'outerwear', label: 'OUTERWEAR' },
  ],
  bottoms: [
    { value: 'pants', label: 'PANTS' },
    { value: 'shorts', label: 'SHORTS' },
    { value: 'denim', label: 'DENIM' },
  ],
  accessories: [
    { value: 'hats', label: 'HATS' },
    { value: 'bags', label: 'BAGS' },
    { value: 'patches', label: 'PATCHES' },
    { value: 'small-goods', label: 'SMALL GOODS' },
  ],
  'custom-jackets': [
    { value: 'gallery', label: 'GALLERY' },
    { value: 'request-form', label: 'REQUEST FORM' },
  ],
};

const FILTER_KEY = {
  category: 'c',
  subcategory: 'sc',
  status: 's',
  sort: 'o',
  collection: 'cl',
  query: 'q',
} as const;

function productPrice(product: Product): number {
  return parseFloat(product.priceRange.minVariantPrice.amount);
}

function parseCategory(value: string | null): CategoryId {
  if (value === 'tops' || value === 'bottoms' || value === 'accessories' || value === 'custom-jackets') return value;
  return 'all';
}

function parseStatus(value: string | null): StatusFilter {
  if (value === 'available' || value === 'limited' || value === 'sold-out' || value === 'coming-soon') return value;
  return 'all';
}

function parseSort(value: string | null): SortMode {
  if (value === 'low-high' || value === 'high-low') return value;
  return 'latest';
}

function normalizeString(value: string): string {
  return value.trim().toLowerCase();
}

function FilterButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`lp-focus-ring lp-log min-h-[40px] border px-2 py-[5px] text-center text-[10px] leading-[1.3] ${
        active
          ? 'border-[var(--lp-color-border-accent-bright)] text-[var(--lp-color-primary-100)]'
          : 'border-[var(--lp-color-border-default)] text-[var(--lp-color-text-muted)] hover:border-[var(--lp-color-border-accent)] hover:text-[var(--lp-color-text-strong)]'
      }`}
    >
      {children}
    </button>
  );
}

interface ProductsCatalogProps {
  products: Product[];
}

export default function ProductsCatalog({ products }: ProductsCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const collections = useMemo(() => {
    const values = new Set<string>();
    for (const product of products) {
      const collection = getProductCatalogMeta(product).collection;
      if (collection) values.add(collection);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const [category, setCategory] = useState<CategoryId>('all');
  const [subcategory, setSubcategory] = useState<string>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [collection, setCollection] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(1);

  useEffect(() => {
    setCategory(parseCategory(searchParams.get(FILTER_KEY.category)));
    setSubcategory(searchParams.get(FILTER_KEY.subcategory) ?? 'all');
    setStatus(parseStatus(searchParams.get(FILTER_KEY.status)));
    setSortMode(parseSort(searchParams.get(FILTER_KEY.sort)));
    setCollection(searchParams.get(FILTER_KEY.collection) ?? 'all');
    setQuery(searchParams.get(FILTER_KEY.query) ?? '');
  }, [searchParams]);

  function syncToUrl(
    nextCategory: CategoryId,
    nextSubcategory: string,
    nextStatus: StatusFilter,
    nextSort: SortMode,
    nextCollection: string,
    nextQuery: string
  ) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (nextCategory === 'all') nextParams.delete(FILTER_KEY.category);
    else nextParams.set(FILTER_KEY.category, nextCategory);

    if (nextSubcategory === 'all') nextParams.delete(FILTER_KEY.subcategory);
    else nextParams.set(FILTER_KEY.subcategory, nextSubcategory);

    if (nextStatus === 'all') nextParams.delete(FILTER_KEY.status);
    else nextParams.set(FILTER_KEY.status, nextStatus);

    if (nextSort === 'latest') nextParams.delete(FILTER_KEY.sort);
    else nextParams.set(FILTER_KEY.sort, nextSort);

    if (nextCollection === 'all') nextParams.delete(FILTER_KEY.collection);
    else nextParams.set(FILTER_KEY.collection, nextCollection);

    if (!nextQuery.trim()) nextParams.delete(FILTER_KEY.query);
    else nextParams.set(FILTER_KEY.query, nextQuery.trim());

    const nextSearch = nextParams.toString();
    startTransition(() => {
      router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, { scroll: false });
    });
  }

  const selectedSubcategories = category !== 'all' ? SUBCATEGORY_MAP[category] : null;

  const filteredProducts = useMemo(() => {
    const queryNeedle = normalizeString(query);

    const list = products.filter((product) => {
      const meta = getProductCatalogMeta(product);

      if (category !== 'all' && meta.category !== category) return false;
      if (subcategory !== 'all' && meta.subcategory !== subcategory) return false;
      if (status !== 'all' && meta.status.toLowerCase().replace('_', '-') !== status) return false;
      if (collection !== 'all' && meta.collection !== collection) return false;

      if (queryNeedle) {
        const haystack = [
          product.title,
          product.handle,
          product.productType,
          product.lpMeta?.itemCode,
          meta.collection,
          meta.category,
          meta.subcategory,
          meta.shortDescription,
          product.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(queryNeedle)) return false;
      }

      return true;
    });

    const sorted = [...list];
    if (sortMode === 'low-high') sorted.sort((a, b) => productPrice(a) - productPrice(b));
    if (sortMode === 'high-low') sorted.sort((a, b) => productPrice(b) - productPrice(a));
    return sorted;
  }, [category, collection, products, query, sortMode, status, subcategory]);

  const activeFilterCount =
    Number(category !== 'all') +
    Number(subcategory !== 'all') +
    Number(status !== 'all') +
    Number(sortMode !== 'latest') +
    Number(collection !== 'all') +
    Number(Boolean(query.trim()));

  return (
    <div className="space-y-3">
      <div className="lp-grid-2">
        <div className="order-2 space-y-2 md:order-1 md:max-w-[290px]">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="lp-focus-ring lp-log flex w-full items-center justify-between border border-[var(--lp-color-border-default)] px-3 py-3 text-[10px] text-[var(--lp-color-text-main)] hover:border-[var(--lp-color-border-accent)] md:hidden"
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
          >
            <span>FILTERS / {activeFilterCount} ACTIVE</span>
            <span>{filtersOpen ? 'CLOSE' : 'OPEN'}</span>
          </button>
          <div id="catalog-filters" className={filtersOpen ? 'block' : 'hidden md:block'}>
            <Panel>
              <PanelTitleBar title="STORE FILTERS" meta="CATALOG CONTROLS" />
              <div className="space-y-3 p-[10px]">
            <div className="space-y-2">
              <p className="lp-log m-0 text-[10px]">SEARCH</p>
              <input
                value={query}
                onChange={(event) => {
                  const next = event.target.value;
                  setQuery(next);
                  syncToUrl(category, subcategory, status, sortMode, collection, next);
                }}
                placeholder="Search products, item code, or collection"
                className="lp-focus-ring w-full border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] px-2 py-2 text-[12px] text-[var(--lp-color-text-main)] placeholder:text-[var(--lp-color-text-muted)]"
              />
            </div>

            <div className="space-y-2">
              <p className="lp-log m-0 text-[10px]">CATEGORY</p>
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 'all', label: 'ALL' },
                  { value: 'tops', label: 'TOPS' },
                  { value: 'bottoms', label: 'BOTTOMS' },
                  { value: 'accessories', label: 'ACCESSORIES' },
                  { value: 'custom-jackets', label: 'CUSTOM JACKETS' },
                ].map((item) => (
                  <FilterButton
                    key={item.value}
                    active={category === item.value}
                    onClick={() => {
                      const next = item.value as CategoryId;
                      setCategory(next);
                      setSubcategory('all');
                      syncToUrl(next, 'all', status, sortMode, collection, query);
                    }}
                  >
                    {item.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            {selectedSubcategories ? (
              <div className="space-y-2">
                <p className="lp-log m-0 text-[10px]">SUBCATEGORY</p>
                <div className="flex flex-wrap gap-1">
                  <FilterButton
                    active={subcategory === 'all'}
                    onClick={() => {
                      setSubcategory('all');
                      syncToUrl(category, 'all', status, sortMode, collection, query);
                    }}
                  >
                    ALL
                  </FilterButton>
                  {selectedSubcategories.map((item) => (
                    <FilterButton
                      key={item.value}
                      active={subcategory === item.value}
                      onClick={() => {
                        setSubcategory(item.value);
                        syncToUrl(category, item.value, status, sortMode, collection, query);
                      }}
                    >
                      {item.label}
                    </FilterButton>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="lp-log m-0 text-[10px]">COLLECTION</p>
              <div className="flex flex-wrap gap-1">
                <FilterButton
                  active={collection === 'all'}
                  onClick={() => {
                    setCollection('all');
                    syncToUrl(category, subcategory, status, sortMode, 'all', query);
                  }}
                >
                  ALL
                </FilterButton>
                {collections.map((name) => (
                  <FilterButton
                    key={name}
                    active={collection === name}
                    onClick={() => {
                      setCollection(name);
                      syncToUrl(category, subcategory, status, sortMode, name, query);
                    }}
                  >
                    {name.toUpperCase()}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="lp-log m-0 text-[10px]">AVAILABILITY</p>
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 'all', label: 'ALL' },
                  { value: 'available', label: 'AVAILABLE' },
                  { value: 'limited', label: 'LIMITED' },
                  { value: 'sold-out', label: 'SOLD OUT' },
                  { value: 'coming-soon', label: 'COMING SOON' },
                ].map((item) => (
                  <FilterButton
                    key={item.value}
                    active={status === item.value}
                    onClick={() => {
                      const next = item.value as StatusFilter;
                      setStatus(next);
                      syncToUrl(category, subcategory, next, sortMode, collection, query);
                    }}
                  >
                    {item.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="lp-log m-0 text-[10px]">SORT</p>
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 'latest', label: 'NEWEST' },
                  { value: 'low-high', label: 'PRICE: LOW TO HIGH' },
                  { value: 'high-low', label: 'PRICE: HIGH TO LOW' },
                ].map((item) => (
                  <FilterButton
                    key={item.value}
                    active={sortMode === item.value}
                    onClick={() => {
                      const next = item.value as SortMode;
                      setSortMode(next);
                      syncToUrl(category, subcategory, status, next, collection, query);
                    }}
                  >
                    {item.label}
                  </FilterButton>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setCategory('all');
                setSubcategory('all');
                setStatus('all');
                setSortMode('latest');
                setCollection('all');
                setQuery('');
                syncToUrl('all', 'all', 'all', 'latest', 'all', '');
              }}
              className="lp-focus-ring lp-log w-full border border-[var(--lp-color-border-default)] px-2 py-[7px] text-[10px] hover:border-[var(--lp-color-border-accent)]"
            >
              RESET FILTERS
            </button>
              </div>
            </Panel>
          </div>
        </div>

        <div className="order-1 space-y-3 md:order-2">
          <StatusStrip>CATALOG STATUS: ACTIVE / ITEMS: {filteredProducts.length} / FILTERS: {activeFilterCount}</StatusStrip>
          <Panel>
            <PanelTitleBar title="STORE.exe" meta="INVENTORY DOSSIER" />
            <div className="space-y-3 p-[10px]">
              {filteredProducts.length > 0 ? (
                <div className="md:hidden">
                  <p className="lp-log m-0 pb-1 text-[10px] text-[var(--lp-color-text-muted)]">MOBILE VIEW</p>
                  <div className="flex gap-1">
                    <FilterButton active={mobileColumns === 2} onClick={() => setMobileColumns(2)}>
                      2 COLUMNS
                    </FilterButton>
                    <FilterButton active={mobileColumns === 1} onClick={() => setMobileColumns(1)}>
                      1 COLUMN
                    </FilterButton>
                  </div>
                </div>
              ) : null}

              {filteredProducts.length > 0 ? (
                <div className={`grid gap-[14px] ${mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'} md:grid-cols-2 xl:grid-cols-3`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="m-0 text-[13px] text-[var(--lp-color-text-muted)]">
                  No products match your current filters. Try another category, collection, or search query.
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {isPending ? <p className="lp-log m-0 text-[10px]">UPDATING CATALOG...</p> : null}
    </div>
  );
}
