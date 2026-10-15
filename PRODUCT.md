# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Design-literate streetwear buyers in Beirut and Paris (and the diaspora between them), mostly arriving on their phones from Instagram. They come to see the latest drop, buy a piece, find the next pop-up, or request a custom jacket. A smaller group digs into the culture side (events, archive) because they follow the label's politics and art.

## Product Purpose
La Propagande is a Paris ↔ Beirut streetwear and culture label born from protest and war imagery. The site sells the clothing (Shopify store), announces and documents pop-ups, raves and collaborations (events feed), takes custom-jacket requests, and hides an archive of source material (CIA files, war footage, flyers) behind discoverable entry points. Success: visitors buy, show up to events, and remember the label as unlike any other store.

## Positioning
A clothing label that behaves like an underground broadcast / cultural archive rather than a shop: its garments carry linocut protest art and slogans, its events are transmissions, and its archive is part of the product.

## Operating Context
Instagram link-in-bio traffic on mobile; physical showrooms (Badaro, Ashrafieh) and pop-ups (Afkart, Mzaar, Colonel Reef Batroun, Maddina Market); content managed in Shopify (products, articles, metaobjects).

## Capabilities and Constraints
- Next.js 14 + Shopify Storefront; cart via Shopify; content from metafields/metaobjects with fallbacks.
- Routes are fixed: /, /products, /products/[handle], /blog, /blog/[handle], /archive (hidden), /about, /contact, /locations, /custom-jackets, legal pages.
- Archive must stay hidden from primary nav but discoverable (home index panel, `archive` command, shortcut).
- Nothing deploys to lapropagande.net without the user's review and client approval.

## Brand Commitments
- Name, stencil wordmark (`public/images/lp-text-logo*.png`), red emblem logo.
- Voice: system/broadcast language (ROOT, TRANSMISSION, LOGGED, ACCESS LIMITED) and protest slogans ("The old world is dying…", "Designed · Marketed · Manipulated").
- Existing fonts on hand: Dirty War, Army Rust (stencils), Retro Computer (pixel, personal-use licence: open issue), VHS Gothic.
- Which of OS metaphor / palette / fonts / art are untouchable is undecided: the user wants several directions to test live.

## Evidence on Hand
Real product photography (Shopify), event photos, slogan artwork (`public/images/brand/slogan-*.webp`), linocut head art, archival footage stills (`public/images/brand/frame-*`), home video loop (`public/media/home-loop.mp4`), jacket/pop-up photos. No testimonials, press or sales figures; do not invent them.

## Product Principles
- Commerce stays fast and obvious inside the strangeness: product, price, size, add to cart are never hidden.
- Street and print grit over digital gloss; never a generic Shopify theme or SaaS layout.
- Avoid the hacker costume (Matrix green, cyberpunk neon) and avoid boxing every piece of content in a bordered window.
- The archive and events are culture, not marketing filler; they earn equal craft.

## Accessibility & Inclusion
Mobile-first; 44px touch targets; readable body text (no tiny all-caps paragraphs); reduced-motion alternatives.
