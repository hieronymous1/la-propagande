'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Panel, PanelTitleBar } from '@/components/system/Primitives';
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
    <button type="button" onClick={onClick} className="lp-toggle lp-focus-ring" aria-pressed={active}>
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
    const values = new Map<string, string>();
    for (const product of products) {
      const collection = getProductCatalogMeta(product).collection?.trim();
      if (!collection) continue;
      const key = collection.toLowerCase();
      if (!values.has(key)) values.set(key, collection);
    }
    return Array.from(values.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const [category, setCategory] = useState<CategoryId>('all');
  const [subcategory, setSubcategory] = useState<string>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [collection, setCollection] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);

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
      if (collection !== 'all' && (meta.collection ?? '').trim().toLowerCase() !== collection.toLowerCase()) return false;

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

  const resetAll = () => {
    setCategory('all');
    setSubcategory('all');
    setStatus('all');
    setSortMode('latest');
    setCollection('all');
    setQuery('');
    syncToUrl('all', 'all', 'all', 'latest', 'all', '');
  };

  const filterPanel = (
    <Panel>
      <PanelTitleBar title="FILTERS" meta={activeFilterCount ? `${activeFilterCount} ACTIVE` : 'CATALOG CONTROLS'} />
      <div className="space-y-4 p-3">
        <label className="block space-y-1">
          <span className="lp-log block">SEARCH</span>
          <span className="lp-field">
            <span className="lp-field__prefix">&gt;</span>
            <input
              value={query}
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                syncToUrl(category, subcategory, status, sortMode, collection, next);
              }}
              placeholder="Title, item code, collection"
              className="lp-field__input"
            />
          </span>
        </label>

        <FilterGroup label="CATEGORY">
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
        </FilterGroup>

        {selectedSubcategories ? (
          <FilterGroup label="SUBCATEGORY">
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
          </FilterGroup>
        ) : null}

        {collections.length > 0 ? (
          <FilterGroup label="COLLECTION">
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
                active={collection.toLowerCase() === name.toLowerCase()}
                onClick={() => {
                  setCollection(name);
                  syncToUrl(category, subcategory, status, sortMode, name, query);
                }}
              >
                {name.toUpperCase()}
              </FilterButton>
            ))}
          </FilterGroup>
        ) : null}

        <FilterGroup label="AVAILABILITY">
          {[
            { value: 'all', label: 'ALL' },
            { value: 'available', label: 'AVAILABLE' },
            { value: 'limited', label: 'LIMITED' },
            { value: 'sold-out', label: 'SOLD OUT' },
            { value: 'coming-soon', label: 'MADE TO ORDER' },
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
        </FilterGroup>

        <FilterGroup label="SORT">
          {[
            { value: 'latest', label: 'NEWEST' },
            { value: 'low-high', label: 'PRICE ↑' },
            { value: 'high-low', label: 'PRICE ↓' },
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
        </FilterGroup>

        <button type="button" onClick={resetAll} className="lp-btn lp-btn--ghost lp-btn--sm lp-btn--block" disabled={activeFilterCount === 0}>
          RESET FILTERS
        </button>
      </div>
    </Panel>
  );

  return (
    <div className="lp-grid-2">
      <aside className="space-y-2 md:sticky md:top-[calc(var(--lp-topbar-h)+12px)] md:self-start">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="lp-btn lp-btn--block justify-between md:hidden"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
        >
          <span>FILTERS{activeFilterCount ? ` · ${activeFilterCount} ACTIVE` : ''}</span>
          <span className={`transition-transform duration-200 ${filtersOpen ? 'rotate-90' : ''}`}>&gt;</span>
        </button>
        <div id="catalog-filters" className={`${filtersOpen ? 'block' : 'hidden'} md:block`}>
          {filterPanel}
        </div>
      </aside>

      <section className="space-y-3" aria-label="Catalog">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="lp-log m-0" aria-live="polite">
            {isPending ? 'UPDATING CATALOG…' : `${filteredProducts.length} RECORD${filteredProducts.length === 1 ? '' : 'S'}${activeFilterCount ? ` · ${activeFilterCount} FILTER${activeFilterCount === 1 ? '' : 'S'}` : ''}`}
          </p>
          <div className="flex gap-1 md:hidden" role="group" aria-label="Grid density">
            <FilterButton active={mobileColumns === 2} onClick={() => setMobileColumns(2)}>
              ▦
            </FilterButton>
            <FilterButton active={mobileColumns === 1} onClick={() => setMobileColumns(1)}>
              ▬
            </FilterButton>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={`grid gap-3 ${mobileColumns === 2 ? 'grid-cols-2' : 'grid-cols-1'} md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} compact={mobileColumns === 2} />
            ))}
          </div>
        ) : (
          <Panel>
            <PanelTitleBar title="NO RECORDS" meta="EMPTY RESULT" />
            <div className="space-y-3 p-4">
              <p className="lp-body m-0">Nothing in the inventory matches this query. Loosen a filter or clear them all.</p>
              <button type="button" onClick={resetAll} className="lp-btn lp-btn--sm">
                CLEAR FILTERS
              </button>
            </div>
          </Panel>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="lp-log m-0">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}
