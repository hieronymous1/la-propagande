'use client';

import { useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCommand } from '@/lib/command';

interface CommandInputProps {
  className?: string;
  label?: string;
  compact?: boolean;
  showLabel?: boolean;
  onOpenCart?: () => void;
  onSearch?: (query: string) => void;
}

export default function CommandInput({
  className = '',
  label = 'ROOT://LP>',
  compact = false,
  showLabel = true,
  onOpenCart,
  onSearch,
}: CommandInputProps) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const trimmed = useMemo(() => value.trim().toLowerCase(), [value]);

  function execute(input: string) {
    const parsed = parseCommand(input);

    if (parsed.kind === 'empty') {
      return;
    }

    if (parsed.kind === 'help') {
      window.setTimeout(() => {
        setFeedback('Try: store, events, contact, about, cart, archive, dir, index, access, home');
      }, 120);
      return;
    }

    if (parsed.kind === 'cart') {
      window.setTimeout(() => {
        if (onOpenCart) {
          onOpenCart();
          setFeedback('Opening Cart...');
          return;
        }
        setFeedback('Cart command available from the global header.');
      }, 120);
      return;
    }

    if (parsed.kind === 'route') {
      window.setTimeout(() => {
        setFeedback(`Opening ${parsed.label}...`);
      }, 120);
      window.setTimeout(() => {
        if (parsed.route === '/archive') {
          window.sessionStorage.setItem('lp_archive_access', 'granted');
          router.push('/archive');
          return;
        }
        router.push(parsed.route);
      }, 220);
      return;
    }

    if (onSearch) {
      onSearch(parsed.query);
      window.setTimeout(() => {
        setFeedback(`Searching for "${parsed.query}"...`);
      }, 120);
      return;
    }

    window.setTimeout(() => {
      if (parsed.suggestions.length > 0) {
        setFeedback(`No exact command. Try: ${parsed.suggestions.map((item) => item.label).join(', ')}`);
        return;
      }
      setFeedback(`No command found for "${parsed.query}". Try "help".`);
    }, 120);
  }

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {showLabel ? (
        <label className="lp-log block text-[10px] text-[var(--lp-color-text-muted)]" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          execute(trimmed);
        }}
        className={`lp-exec-hit flex items-center border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] ${
          compact ? 'h-[40px]' : 'h-[46px] md:h-[42px]'
        }`}
      >
        <span className="lp-log px-2 text-[10px] text-[var(--lp-color-primary-100)]">&gt;</span>
        <input
          id={inputId}
          name="command"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="SEARCH PRODUCTS OR EVENTS"
          className="h-full min-w-0 w-full bg-transparent px-1 text-[11px] tracking-[0.04em] text-[var(--lp-color-text-main)] placeholder:text-[var(--lp-color-text-dim)] focus:outline-none"
          autoComplete="off"
          aria-label="Search or command input"
        />
        <button
          type="submit"
          className="h-full min-w-[52px] border-l border-[var(--lp-color-border-default)] px-3 lp-log text-[10px] hover:text-[var(--lp-color-primary-100)]"
        >
          GO
        </button>
      </form>
      {feedback ? <p className="lp-command-output lp-log m-0 break-words text-[10px] text-[var(--lp-color-primary-100)]">{feedback}</p> : null}
    </div>
  );
}
