import type { Product, ProductVariant } from '@/lib/types';

export interface OptionGroup {
  name: string;
  values: string[];
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL', 'OS', 'ONE SIZE'];

export function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)} ${currencyCode}`;
}

export function getVariants(product: Product): ProductVariant[] {
  return product.variants.edges.map((edge) => edge.node);
}

function isSizeOption(name: string) {
  return /size|taille/i.test(name);
}

function isColorOption(name: string) {
  return /colou?r|couleur/i.test(name);
}

export function getOptionGroups(product: Product): OptionGroup[] {
  const groups = new Map<string, Set<string>>();
  for (const variant of getVariants(product)) {
    for (const option of variant.selectedOptions ?? []) {
      if (option.name.toLowerCase() === 'title' && option.value.toLowerCase() === 'default title') continue;
      if (!groups.has(option.name)) groups.set(option.name, new Set());
      groups.get(option.name)!.add(option.value);
    }
  }
  return Array.from(groups.entries()).map(([name, values]) => {
    const list = Array.from(values);
    if (isSizeOption(name)) {
      list.sort((a, b) => {
        const ia = SIZE_ORDER.indexOf(a.toUpperCase());
        const ib = SIZE_ORDER.indexOf(b.toUpperCase());
        if (ia === -1 && ib === -1) return a.localeCompare(b, undefined, { numeric: true });
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    return { name, values: list };
  });
}

export function findVariant(product: Product, selection: Record<string, string>): ProductVariant | null {
  const variants = getVariants(product);
  return (
    variants.find((variant) =>
      (variant.selectedOptions ?? []).every((option) => selection[option.name] === undefined || selection[option.name] === option.value)
    ) ?? null
  );
}

export function isValueAvailable(product: Product, selection: Record<string, string>, name: string, value: string): boolean {
  const variants = getVariants(product);
  return variants.some((variant) => {
    if (!variant.availableForSale) return false;
    return (variant.selectedOptions ?? []).every((option) => {
      if (option.name === name) return option.value === value;
      const chosen = selection[option.name];
      return chosen === undefined || chosen === option.value;
    });
  });
}

export function getSizeGroup(product: Product): OptionGroup | null {
  return getOptionGroups(product).find((group) => isSizeOption(group.name)) ?? null;
}

export function getColorGroup(product: Product): OptionGroup | null {
  return getOptionGroups(product).find((group) => isColorOption(group.name)) ?? null;
}

/** For the catalog quick-add: sizes with availability regardless of colour (first available colour wins). */
export function getQuickAddSizes(product: Product): { value: string; variant: ProductVariant | null }[] {
  const sizeGroup = getSizeGroup(product);
  const variants = getVariants(product);
  if (!sizeGroup) {
    const first = variants[0] ?? null;
    return first ? [{ value: 'ADD', variant: first }] : [];
  }
  return sizeGroup.values.map((value) => {
    const match =
      variants.find((variant) => variant.availableForSale && (variant.selectedOptions ?? []).some((o) => o.name === sizeGroup.name && o.value === value)) ??
      null;
    return { value, variant: match };
  });
}

const SWATCH_MAP: Record<string, string> = {
  black: '#101010',
  white: '#ece7da',
  beige: '#cbbc9c',
  oatmeal: '#cfc4ad',
  cream: '#e6dcc3',
  sand: '#c9b58f',
  mocha: '#5d4634',
  brown: '#4b3a2c',
  green: '#3d5a3a',
  ivy: '#2f4a33',
  'dark ivy green': '#2b4630',
  olive: '#5b5f3a',
  khaki: '#8a8560',
  navy: '#1c2540',
  blue: '#2b4c7e',
  grey: '#7a7a7a',
  gray: '#7a7a7a',
  red: '#8e1111',
  camo: '#4f5a3b',
  denim: '#3b4c6b',
};

export function swatchColor(value: string): string {
  const key = value.trim().toLowerCase();
  if (SWATCH_MAP[key]) return SWATCH_MAP[key];
  for (const [name, hex] of Object.entries(SWATCH_MAP)) {
    if (key.includes(name)) return hex;
  }
  return '#3a3a3a';
}
