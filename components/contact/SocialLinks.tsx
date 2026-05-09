import { CTA_LINKS } from '@/lib/site';

export default function SocialLinks() {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
      {CTA_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-focus-ring lp-log inline-flex min-h-[44px] items-center justify-center border border-[var(--lp-color-border-default)] px-3 py-2 text-center text-[10px] hover:border-[var(--lp-color-border-accent)] hover:text-[var(--lp-color-primary-100)]"
        >
          &gt; {link.label.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
