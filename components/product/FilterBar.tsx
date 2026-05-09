'use client';

import { useState } from 'react';

const FILTERS = ['ALL PRODUCTS', 'T-SHIRTS', 'HOODIES', 'ACCESSORIES'] as const;
type Filter = (typeof FILTERS)[number];

interface FilterBarProps {
  total: number;
}

export default function FilterBar({ total }: FilterBarProps) {
  const [active, setActive] = useState<Filter>('ALL PRODUCTS');

  return (
    <div className="sticky top-[72px] z-40">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 rounded-[18px] border border-white/15 bg-lp-red/90 p-4 backdrop-blur-sm">
        <span className="font-retro-computer text-[12px] uppercase tracking-[0.18em] text-lp-white">
          SHOP BY CATEGORY
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={[
                'font-retro-computer text-[12px] uppercase tracking-[0.16em] transition-colors',
                active === filter ? 'text-lp-white' : 'text-lp-white/60 hover:text-lp-white',
              ].join(' ')}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-right">
          <span className="font-retro-computer text-[12px] uppercase tracking-[0.18em] text-lp-white/80">
            SORT: FEATURED
          </span>
          <span className="hidden h-3.5 w-px bg-white/25 md:block" />
          <span className="font-retro-computer text-[12px] uppercase tracking-[0.18em] text-lp-white/80">
            SIZE GUIDE AVAILABLE
          </span>
          <span className="hidden h-3.5 w-px bg-white/25 md:block" />
          <span className="font-retro-computer text-[12px] uppercase tracking-[0.18em] text-lp-white/80">
            {total} PRODUCTS
          </span>
        </div>
      </div>
    </div>
  );
}
