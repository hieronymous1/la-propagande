export interface CommandSuggestion {
  label: string;
  route: string;
  hint?: string;
}

export type ParsedCommand =
  | { kind: 'empty' }
  | { kind: 'help' }
  | { kind: 'cart' }
  | { kind: 'route'; route: string; label: string }
  | { kind: 'unknown'; query: string; suggestions: CommandSuggestion[] };

const COMMAND_ROUTES: Record<string, CommandSuggestion> = {
  store: { label: 'Store', route: '/products' },
  '/store': { label: 'Store', route: '/products' },
  products: { label: 'Store', route: '/products' },
  '/products': { label: 'Store', route: '/products' },
  shop: { label: 'Store', route: '/products' },
  events: { label: 'Blog', route: '/blog' },
  '/events': { label: 'Blog', route: '/blog' },
  blog: { label: 'Blog', route: '/blog' },
  '/blog': { label: 'Blog', route: '/blog' },
  contact: { label: 'Contact us', route: '/contact' },
  '/contact': { label: 'Contact us', route: '/contact' },
  connect: { label: 'Contact us', route: '/contact' },
  locations: { label: 'Locations', route: '/locations' },
  '/locations': { label: 'Locations', route: '/locations' },
  showroom: { label: 'Locations', route: '/locations' },
  about: { label: 'About', route: '/about' },
  '/about': { label: 'About', route: '/about' },
  custom: { label: 'Custom Jackets', route: '/custom-jackets' },
  jackets: { label: 'Custom Jackets', route: '/custom-jackets' },
  '/custom-jackets': { label: 'Custom Jackets', route: '/custom-jackets' },
  archive: { label: 'Archive', route: '/archive' },
  '/archive': { label: 'Archive', route: '/archive' },
  dir: { label: 'Archive', route: '/archive' },
  index: { label: 'Archive', route: '/archive' },
  access: { label: 'Archive', route: '/archive' },
  home: { label: 'Home', route: '/' },
  root: { label: 'Home', route: '/' },
  '/': { label: 'Home', route: '/' },
};

const CART_ALIASES = new Set(['cart', 'buffer', 'bag']);

const HELP_ALIASES = new Set(['help', '?', 'man']);

export const ROUTE_SUGGESTIONS: CommandSuggestion[] = [
  { label: 'Store', route: '/products', hint: 'store' },
  { label: 'Blog', route: '/blog', hint: 'blog' },
  { label: 'Custom Jackets', route: '/custom-jackets', hint: 'custom' },
  { label: 'About', route: '/about', hint: 'about' },
  { label: 'Locations', route: '/locations', hint: 'locations' },
  { label: 'Contact us', route: '/contact', hint: 'contact' },
  { label: 'Home', route: '/', hint: 'home' },
];

export const HIDDEN_SUGGESTIONS: CommandSuggestion[] = [{ label: 'Archive', route: '/archive', hint: 'archive' }];

export const KEY_SHORTCUTS: Record<string, string> = {
  s: '/products',
  b: '/blog',
  e: '/blog',
  a: '/archive',
  c: '/contact',
  h: '/',
};

export function parseCommand(raw: string): ParsedCommand {
  const query = raw.trim().toLowerCase();

  if (!query) {
    return { kind: 'empty' };
  }

  if (HELP_ALIASES.has(query)) {
    return { kind: 'help' };
  }

  if (CART_ALIASES.has(query)) {
    return { kind: 'cart' };
  }

  const commandMatch = COMMAND_ROUTES[query];
  if (commandMatch) {
    return { kind: 'route', route: commandMatch.route, label: commandMatch.label };
  }

  const suggestions = [...ROUTE_SUGGESTIONS, ...HIDDEN_SUGGESTIONS].filter((entry) => {
    const label = entry.label.toLowerCase();
    const route = entry.route.toLowerCase();
    return label.includes(query) || route.includes(query);
  });

  return {
    kind: 'unknown',
    query,
    suggestions: suggestions.slice(0, 3),
  };
}
