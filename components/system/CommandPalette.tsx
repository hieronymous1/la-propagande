'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { HIDDEN_SUGGESTIONS, KEY_SHORTCUTS, ROUTE_SUGGESTIONS, parseCommand } from '@/lib/command';
import { useCart } from '@/components/store/CartProvider';

interface IndexEntry {
  kind: 'product' | 'event';
  title: string;
  handle: string;
  href: string;
  meta: string;
  image: string | null;
}

interface PaletteContextValue {
  open: (seed?: string) => void;
  close: () => void;
  isOpen: boolean;
}

const PaletteContext = createContext<PaletteContextValue>({ open: () => {}, close: () => {}, isOpen: false });

export function usePalette() {
  return useContext(PaletteContext);
}

type Row =
  | { kind: 'route'; label: string; href: string; hint: string; hidden?: boolean }
  | { kind: 'action'; label: string; hint: string; run: () => void }
  | { kind: 'entry'; entry: IndexEntry };

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { openCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [cursor, setCursor] = useState(0);
  const [output, setOutput] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback((seed?: string) => {
    setQuery(seed ?? '');
    setOutput(null);
    setCursor(0);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  // lazy-load the search index the first time the palette opens
  useEffect(() => {
    if (!isOpen || index !== null) return;
    let cancelled = false;
    fetch('/api/index')
      .then((response) => (response.ok ? response.json() : { entries: [] }))
      .then((data: { entries: IndexEntry[] }) => {
        if (!cancelled) setIndex(data.entries ?? []);
      })
      .catch(() => {
        if (!cancelled) setIndex([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, index]);

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 20);
      document.body.style.overflow = 'hidden';
      return () => {
        window.clearTimeout(id);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // global shortcuts
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (isOpen) close();
        else open();
        return;
      }
      if (isOpen) {
        if (event.key === 'Escape') close();
        return;
      }
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === '/') {
        event.preventDefault();
        open();
        return;
      }
      const route = KEY_SHORTCUTS[event.key.toLowerCase()];
      if (route && !event.shiftKey) {
        if (route === '/archive') window.sessionStorage.setItem('lp_archive_access', 'granted');
        router.push(route);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, open, close, router]);

  const rows = useMemo<Row[]>(() => {
    const needle = query.trim().toLowerCase();
    const routes: Row[] = ROUTE_SUGGESTIONS.map((item) => ({ kind: 'route', label: item.label, href: item.route, hint: item.hint ?? '' }));
    const hidden: Row[] = HIDDEN_SUGGESTIONS.map((item) => ({ kind: 'route', label: item.label, href: item.route, hint: item.hint ?? '', hidden: true }));
    const actions: Row[] = [{ kind: 'action', label: 'Open cart', hint: 'cart', run: openCart }];

    if (!needle) {
      return [...routes, ...actions];
    }

    const parsed = parseCommand(needle);
    const matchedRoutes = [...routes, ...hidden].filter((row) => {
      if (row.kind !== 'route') return false;
      if (row.hidden) return parsed.kind === 'route' && parsed.route === row.href;
      return row.label.toLowerCase().includes(needle) || row.hint.includes(needle) || (parsed.kind === 'route' && parsed.route === row.href);
    });
    const matchedActions = actions.filter((row) => row.kind === 'action' && (row.label.toLowerCase().includes(needle) || row.hint.includes(needle)));
    const entries: Row[] = (index ?? [])
      .filter((entry) => `${entry.title} ${entry.handle} ${entry.meta}`.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((entry) => ({ kind: 'entry', entry }));

    return [...matchedRoutes, ...matchedActions, ...entries];
  }, [query, index, openCart]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  function run(row: Row) {
    if (row.kind === 'action') {
      close();
      window.setTimeout(row.run, 60);
      return;
    }
    const href = row.kind === 'route' ? row.href : row.entry.href;
    setOutput(`EXECUTING ${href.toUpperCase()} ...`);
    if (href === '/archive') window.sessionStorage.setItem('lp_archive_access', 'granted');
    window.setTimeout(() => {
      close();
      router.push(href);
    }, 160);
  }

  function submit() {
    if (rows[cursor]) {
      run(rows[cursor]);
      return;
    }
    const parsed = parseCommand(query);
    if (parsed.kind === 'help') {
      setOutput('COMMANDS: STORE, EVENTS, CUSTOM, ABOUT, LOCATIONS, CONNECT, CART, HOME. KEYS: S E A C H, ⌘K, /');
      return;
    }
    if (parsed.kind === 'cart') {
      run({ kind: 'action', label: 'Open cart', hint: 'cart', run: openCart });
      return;
    }
    setOutput(`NO MATCH FOR "${query.toUpperCase()}". TYPE HELP.`);
  }

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-[var(--lp-z-palette)] flex items-start justify-center bg-[rgba(0,0,0,0.78)] px-3 pt-[12vh] backdrop-blur-[3px]" onClick={close} role="presentation">
          <div
            className="lp-panel lp-panel--ticks lp-reveal w-full max-w-[640px] border-[var(--lp-color-border-accent)]"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lp-panel-title">
              <span className="lp-panel-title__name">ROOT://LP</span>
              <span className="lp-panel-title__meta">ESC TO CLOSE · ↑↓ TO MOVE · ↵ TO RUN</span>
            </div>
            <form
              className="lp-field m-[10px] mb-0"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <span className="lp-field__prefix">&gt;</span>
              <input
                ref={inputRef}
                className="lp-field__input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setCursor((current) => Math.min(rows.length - 1, current + 1));
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setCursor((current) => Math.max(0, current - 1));
                  }
                }}
                placeholder="Type a command, product or event"
                aria-label="Command input"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" className="lp-field__action">
                RUN
              </button>
            </form>

            <div className="max-h-[52vh] overflow-y-auto p-[10px]" role="listbox" aria-label="Results">
              {rows.length === 0 ? (
                <p className="lp-log m-0 px-2 py-3">{index === null ? 'LOADING INDEX...' : 'NO RESULTS. TYPE HELP.'}</p>
              ) : (
                rows.map((row, i) => {
                  const active = i === cursor;
                  const key = row.kind === 'entry' ? row.entry.href : `${row.kind}-${row.label}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => run(row)}
                      className={`flex w-full items-center gap-3 border px-3 py-2 text-left transition-colors duration-100 ${
                        active ? 'border-[var(--lp-color-primary-500)] bg-[rgba(142,17,17,0.18)]' : 'border-transparent hover:border-[var(--lp-color-border-subtle)]'
                      }`}
                    >
                      {row.kind === 'entry' ? (
                        <span className="lp-media relative block h-10 w-10 shrink-0">
                          {row.entry.image ? <Image src={row.entry.image} alt="" fill sizes="40px" className="object-cover" /> : null}
                        </span>
                      ) : (
                        <span className="lp-ui-sm flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--lp-color-border-subtle)] text-[var(--lp-color-primary-400)]">
                          {row.kind === 'action' ? '::' : '>'}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="lp-label block truncate text-[var(--lp-color-text-strong)]">{row.kind === 'entry' ? row.entry.title : row.label}</span>
                        <span className="lp-log block truncate">
                          {row.kind === 'entry' ? `${row.entry.kind.toUpperCase()} / ${row.entry.meta}` : row.kind === 'route' ? row.href : 'ACTION'}
                        </span>
                      </span>
                      <span className="lp-ui-sm hidden text-[var(--lp-color-text-dim)] sm:block">{active ? '↵' : ''}</span>
                    </button>
                  );
                })
              )}
            </div>

            {output ? <p className="lp-command-output lp-log m-0 border-t border-[var(--lp-color-border-subtle)] px-[14px] py-2 text-[var(--lp-color-primary-300)]">{output}</p> : null}
          </div>
        </div>
      ) : null}
    </PaletteContext.Provider>
  );
}
