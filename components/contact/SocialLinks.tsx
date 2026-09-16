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
          className="lp-btn"
        >
          {link.label} <span className="lp-btn__arrow">&gt;</span>
        </a>
      ))}
    </div>
  );
}
