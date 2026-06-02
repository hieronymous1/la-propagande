import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-2)] py-3">
      <div className="lp-shell space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="lp-log text-[10px] text-[var(--lp-color-text-muted)]">LA PROPAGANDE / BEIRUT ↔ PARIS</span>
          <Link
            href="/contact"
            className="lp-focus-ring lp-log inline-flex min-h-[36px] items-center border border-[var(--lp-color-border-subtle)] px-3 py-1 text-[10px] text-[var(--lp-color-text-muted)] hover:border-[var(--lp-color-border-default)] hover:text-[var(--lp-color-text-main)]"
          >
            CONNECT
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-focus-ring lp-log inline-flex min-h-[30px] items-center px-1 py-1 text-[10px] text-[var(--lp-color-text-muted)] hover:text-[var(--lp-color-text-main)]"
            >
              {label.toUpperCase()}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/terms"
            className="lp-focus-ring lp-log inline-flex min-h-[40px] items-center border border-[var(--lp-color-border-subtle)] px-2 py-1 text-[10px] text-[var(--lp-color-text-muted)] hover:border-[var(--lp-color-border-default)]"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="lp-focus-ring lp-log inline-flex min-h-[40px] items-center border border-[var(--lp-color-border-subtle)] px-2 py-1 text-[10px] text-[var(--lp-color-text-muted)] hover:border-[var(--lp-color-border-default)]"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
