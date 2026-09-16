# LA PROPAGANDE — Deep Design Audit

**Date:** 2026-09-16
**Target:** `lapropagande-recovered` (Next 14 / Tailwind / Shopify Storefront), audited on `localhost:3000` at 390 / 820 / 1440 px
**Method:** impeccable `audit` (technical) + design-review (visual) + full-route screenshot sweep with layout/tap-target/font metrics. Screenshots in `../.playwright-mcp/audit/`.

---

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2/4 | ~70 % of all text is 10–11 px pixel font, all-caps; locked/red status text fails contrast (1.9:1 / 3.65:1); reduced-motion kills all feedback |
| 2 | Performance | 2/4 | Hero video streamed from a third-party Framer CDN with no poster; all catalog pages `force-dynamic`; 24 client-state cards per catalog render |
| 3 | Responsive | 2/4 | No horizontal overflow (good) — but mobile nav eats 165 px, home has ~350 px dead space, catalog is 18 k px tall, archive/filter tap targets 25–33 px, hover-only interactions on touch |
| 4 | Theming | 3/4 | Solid token system; duplicated/collapsed tokens (`primary-200..500` identical, `bg-1 == bg-2`), stale Tailwind palette (`lp-red #8d0202` ≠ token `#8e1111`), 4 raw hex values |
| 5 | Implementation integrity | 2/4 | Display font never used; 6 dead components; archive/gallery are placeholder boxes; empty "SUMMARY:" labels; "WAKE UP!" filter ×3; homepage is missing most of the PROJECT.md-mandated modules |
| | **Total** | **11/20** | **Acceptable — significant work needed** |

## Implementation Integrity Verdict — FAIL (coherent skeleton, missing body)

The system *idea* is right and the token layer is real. But the implementation expresses roughly 40 % of the approved direction:

- **Single-font site.** `Army Rust` (the mandated military display font) is referenced by exactly one class and rendered nowhere. Every one of ~950 text nodes across all desktop routes is `Retro Computer`. The "two font roles" principle in PROJECT.md is unimplemented, so headings, body, labels and logs all have the same voice — a 10 px log line and a 34 px product title differ only in size.
- **The brand's art is absent.** The brand has an unusually strong visual bank (linocut red/black heads, stencil wordmark, embroidered patches, Zapruder/war-footage video, Beirut street photography in `/Content`). On the site, the only imagery is Shopify product photos. Archive cards, custom-jacket gallery and event fallbacks all render empty bordered boxes.
- **Homepage ≠ approved OS shell.** PROJECT.md requires: archive index panel, command input, transmission queue, directory tree, user session panel, operator feed. Present: 4 command links, a log stream, a node strip and 3 status chips. Below the fold is 350–500 px of unused video.
- **Dead code:** `components/home/{Hero,About,Activations,LogoKey,SocialStrip}.tsx`, `components/product/FilterBar.tsx` (rounded-18px Framer-era leftover, off-system). `lib/site.ts` (1 082 lines) mixes fallback copy, archive seed data, product meta and footer config.
- **License risk:** `retro_computer_personal_use.ttf` is a personal-use font shipped on a commercial store.

---

## Executive Summary

- Score **11/20 (Acceptable)** — 3 × P0, 9 × P1, 11 × P2, 6 × P3.
- The site *reads* as the right thing (dark terminal, red signal, panels, logs) but *feels* thin: one font, tiny text, few images, generic states. It is currently a wireframe of the approved concept with product data plugged in.
- Biggest levers, in order: (1) typography system with the display font + a readable body size, (2) put the brand's own art into the shell (home, archive, events, empty states), (3) rebuild the mobile shell as a "handheld terminal" rather than a stacked desktop, (4) redesign the product card + PDP purchase flow (swatches, size grid, sticky buy bar), (5) make the "system" interactive for real (command palette with autocomplete, keyboard nav, live log, boot that only runs once).

---

## Detailed Findings

### P0 — Blocking

**[P0] Display font never rendered — single-voice typography**
- Location: `app/globals.css` (`--lp-font-display`), every component (`font-lp-ui` everywhere; `font-lp-display` 0 renders)
- Category: Implementation integrity / Typography
- Impact: No hierarchy beyond size; brand's "military" register is gone; violates PROJECT.md "two font roles".
- Fix: Assign `Army Rust` to panel titles, product titles, route headings, command links; keep pixel font for UI/meta/logs. Define a real type scale (display 56/40/28, body 15/14, ui 12/11) and stop using 8–10 px for anything that must be read.
- Command: `$impeccable typeset`

**[P0] Body text is unreadable at scale**
- Location: 118 × `text-[10px]`, 15 × `text-[9px]`, 5 × `text-[8px]`; all body copy set in an all-caps pixel font (`ProductDetail.tsx:279-300`, `blog/[handle]/page.tsx:52-55`, `contact/page.tsx`)
- Category: Accessibility (WCAG 1.4.4, 1.4.8) / Readability
- Impact: Product descriptions, event bodies and the about page are 14 px all-caps bitmap text — 2–3× slower to read than mixed case. Mobile product-card meta is 8 px.
- Fix: Body copy in a readable monospace or humanist face at 15–16 px mixed case (e.g. a real terminal mono for "documents"); pixel font reserved for ≤ 12 px labels. Nothing below 11 px on mobile.
- Command: `$impeccable typeset`

**[P0] Homepage is missing the approved OS dashboard**
- Location: `components/home/LandingOS.tsx`
- Category: Implementation integrity / Persuade surface
- Impact: The one surface meant to establish "you are entering a system" shows 4 links and empty video. No archive index panel (the primary hidden-route entry mandated by PROJECT.md), no on-page command input, no session/queue/directory modules. On mobile it's a logo, 4 links, 350 px of dark video, footer.
- Fix: Rebuild as a dense multi-panel shell: ROOT.CONSOLE (wordmark + commands + inline command input), ARCHIVE INDEX (degraded/24 %/limited → `/archive`), TRANSMISSION QUEUE (latest 3 events), FEATURED DROP (2–3 products), SYSTEM LOG (live-ticking), DIRECTORY TREE, SESSION panel, NODE STRIP; mobile = stacked handheld modules with a fixed bottom command bar.
- Command: `$impeccable shape` → `$impeccable overdrive`

### P1 — Major

**[P1] Status colours fail contrast** — `#6b2a2a` LOCKED text on `#0a0a0a` = 1.88:1; `#d11a1a` red on black = 3.65:1 used for 10 px text (`ProductCard.tsx:34`, `ArchivePageClient.tsx:154`, `.lp-command-link:hover`). Fix: lift locked to `#a03a3a`, use red for borders/glow and keep text ≥ `#e04545` or pale; run tokens through a contrast check. — Accessibility, WCAG 1.4.3.

**[P1] `prefers-reduced-motion` nukes all animation** — `globals.css:567` sets `animation:none` globally, so command execution flashes, panel reveal and status blink vanish with no alternative; the site's "step-based" motion is part of its usability language. Fix: per-animation fallbacks (instant state, keep colour change). — Accessibility.

**[P1] Mobile shell wastes the viewport** — Nav = 3 stacked rows (logo / CART+MENU / search) = 165 px before content; MENU sheet CLOSE button is 44 × 15 px; menu is a plain list. Fix: single 52 px top bar (logo · signal · cart) + fixed bottom "handheld" command bar (input + MENU); menu as a full-screen COMMAND.SHEET with large `> ROUTE` rows and swipe-to-close. — Responsive.

**[P1] Hover-only interactions on touch** — Archive "HOVER TO RESTORE FILE" (`ArchivePageClient.tsx:181`), logo tooltip, title flicker. Fix: tap/long-press equivalents; `@media (hover:hover)` guards. — Responsive.

**[P1] Catalog: 18 k px on mobile, every card carries a quantity stepper + add-to-cart** — `ProductCard.tsx` renders qty + CTA per card (24 × client state). Fix: card = image, title (display font), price, status chip, size-availability dots; quick-add on tap/hover opens a size sheet; 2-col default on mobile. — Responsive / Performance.

**[P1] PDP purchase flow is a `<select>`** — Colour and size are merged into one dropdown ("BEIGE / S"), no swatches, no size grid, no sticky buy bar on mobile, price shown as a 12 px log line. Three near-identical panels repeat the same summary (`ITEM.RECORD` summary line, `SUMMARY.LOG`, short description). Fix: colour swatches from variant images, size grid with sold-out strikes, price at display size, one description block with expandable FILE NOTES; sticky bottom ADD TO CART on mobile. — Implementation integrity / Persuade.

**[P1] Archive & custom gallery are empty boxes** — All 13 archive thumbnails point at identical `archive-0N.svg` "STATUS: DEGRADED" placeholders; custom gallery shows 6 empty gradient panels. Fix: seed from `/Content` + `la prop stock` (linocuts, Zapruder frames, war footage stills, patch renders) with degraded/scanline treatment. — Implementation integrity.

**[P1] Event metadata is wrong/duplicated** — `LOCATION` falls back to `PARIS` for Beirut/Batroun events (`blog/page.tsx:56`); the same 6 fields repeat in the pinned card, list row and detail page's UTILITY block; featured image box renders before the image resolves. Fix: metadata from Shopify article metafields only, `location` fallback `UNKNOWN`, single metadata block. — Clarify.

**[P1] No per-page metadata / SEO** — Only `app/layout.tsx` has `metadata`; every route is titled "La Propagande", no OG image. Fix: `generateMetadata` on products/blog/static routes with brand OG template. — Harden.

### P2 — Minor

- **Redundant double status strips** on PDP (`products/[handle]/page.tsx` + `ProductDetail.tsx:137`) and store header (`products/page.tsx` + `ProductsCatalog.tsx`). Keep one per surface.
- **Collection filter duplicates** ("WAKE UP!" ×3) — `ProductsCatalog.tsx` collects collections without normalising case/whitespace.
- **Empty labels render** — `SUMMARY:` with no value on most cards (`ProductCard.tsx:97`); `LINK STATE: DEAD` on every archive card.
- **Panel title bar is fixed 26 px** and wraps on tablet/mobile (`STORE FILTERS / CATALOG CONTROLS`, `MK ULTRA…`); allow 2 lines or truncate the meta.
- **Root landing has two page chromes**: `LandingOS` is `min-h-screen` inside `GlobalShell` (nav + footer), producing 1 108 px at 900 px viewport with the footer floating under dead video.
- **`.lp-page` gradient seam** — `GlobalShell` and `OSShell` both apply `lp-page`; contact/about show a visible band where `body` background meets the page gradient (desktop_contact.png bottom).
- **Boot overlay replays every visit** and blocks the page for ~1 s; should run once per session (`sessionStorage`) and never on in-app navigation back to `/`.
- **Video hero from `framerusercontent.com`** — third-party dependency, no `poster`, no `preload="none"` on mobile. Self-host a 6–8 s loop (720p, ≤ 2 MB) + poster.
- **Cart drawer** ignores design tokens for z-index (`z-[199]/[200]`), has no focus trap, no line-item total, no empty-state CTA into the store.
- **Related items are text chips** — should be mini product cards with images.
- **`retro_computer_personal_use.ttf`** licence — replace with a commercially licensed pixel face (e.g. *Silkscreen*, *Pixelify Sans*, *VT323*, or purchase the Retro Computer commercial licence).

### P3 — Polish

- Tokens: `primary-200/300/400/500` identical; `bg-1 == bg-2`; `border-strong == border-default`; Tailwind `lp-red/#8d0202` diverges from `--lp-color-primary-700`.
- 4 raw hex values in TSX (`ProductCard.tsx:34-38`, `ArchivePageClient.tsx:154`).
- Dead components: `home/Hero`, `home/About`, `home/Activations`, `home/LogoKey`, `home/SocialStrip`, `product/FilterBar` — delete.
- `README.md` is the create-next-app default.
- Footer is three loose rows; should be a single system strip (node · uptime · links · legal).
- Command input placeholder says "SEARCH PRODUCTS OR EVENTS" but only routes commands — no live search results; on store it does not drive the catalog search.

---

## Patterns & Systemic Issues

1. **"Small = system"**: the implementation equates terminal feel with tiny all-caps text. Real terminals are *dense*, not small. Density should come from information layering and panel count, not 10 px type.
2. **Structure without content**: nearly every "system" module is a static string (`VISITOR COUNT: 00291`, `RUNTIME` from a fake seed). Interactive value is low; the only real interactivity is the command router.
3. **Brand assets unused**: the strongest visual property (linocut art, stencil wordmark, patches, archival footage) is missing from the interface.
4. **Copy repetition**: the same metadata is printed 2–3× per surface (strips + panel + block) — noise, not depth.

## Positive Findings (preserve)

- The token layer (`globals.css`) is complete and named sensibly; hard borders, 0 radius, 2 px offset panel shadow are exactly right.
- Step-based motion (`steps()` everywhere, 80–240 ms) is on-brief and already avoids "SaaS easing".
- The command router (`lib/command.ts`) with hidden `archive/dir/index/access` aliases is a good foundation.
- No horizontal overflow at any viewport; `lp-shell` safe-area padding; `overflow-wrap:anywhere` guards.
- Panel/TitleBar/StatusStrip primitives are a clean component base to grow the system from.
- Shopify integration works end-to-end (products, articles, metaobjects, cart).

---

## Recommended Actions (priority order)

1. **[P0] `$impeccable typeset`** — two-font system + type scale; kill sub-11 px body text; readable document face for descriptions.
2. **[P0] `$impeccable shape` → `overdrive`** — homepage OS shell rebuild with all approved modules, brand art layer, mobile handheld layout.
3. **[P1] `$impeccable adapt`** — mobile nav/command bar, touch equivalents, tap targets ≥ 44 px, catalog density.
4. **[P1] `$impeccable layout`** — product card + PDP purchase flow (swatches, size grid, sticky buy), single status strip per surface, events feed as real transmissions with flyers.
5. **[P1] `$impeccable delight`** — command palette with autocomplete + keyboard shortcuts, boot once per session, live log fed by real events/products, archive media.
6. **[P1] `$impeccable harden`** — contrast tokens, reduced-motion fallbacks, per-page metadata, cart focus trap, font licence.
7. **[P2] `$impeccable clarify`** — de-duplicate metadata, fix location fallback, empty-state copy.
8. **[P3] `$impeccable distill`** — delete dead components, reconcile tokens, split `lib/site.ts`.
9. **`$impeccable polish`** — final pass.
