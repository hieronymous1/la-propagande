export interface CommandSuggestion {
  label: string;
  route: string;
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
  events: { label: 'Events', route: '/blog' },
  '/events': { label: 'Events', route: '/blog' },
  blog: { label: 'Events', route: '/blog' },
  '/blog': { label: 'Events', route: '/blog' },
  contact: { label: 'Connect', route: '/contact' },
  '/contact': { label: 'Connect', route: '/contact' },
  connect: { label: 'Connect', route: '/contact' },
  locations: { label: 'Locations', route: '/locations' },
  '/locations': { label: 'Locations', route: '/locations' },
  about: { label: 'About', route: '/about' },
  '/about': { label: 'About', route: '/about' },
  archive: { label: 'Archive', route: '/archive' },
  '/archive': { label: 'Archive', route: '/archive' },
  dir: { label: 'Archive', route: '/archive' },
  index: { label: 'Archive', route: '/archive' },
  access: { label: 'Archive', route: '/archive' },
  home: { label: 'Home', route: '/' },
  root: { label: 'Home', route: '/' },
  '/': { label: 'Home', route: '/' },
};

const CART_ALIASES = new Set(['cart', 'buffer']);

const HELP_ALIASES = new Set(['help', '?']);

const ROUTE_SUGGESTIONS: CommandSuggestion[] = [
  { label: 'Store', route: '/products' },
  { label: 'Events', route: '/blog' },
  { label: 'Connect', route: '/contact' },
  { label: 'Locations', route: '/locations' },
  { label: 'About', route: '/about' },
  { label: 'Archive', route: '/archive' },
  { label: 'Home', route: '/' },
];

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

  const suggestions = ROUTE_SUGGESTIONS.filter((entry) => {
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
