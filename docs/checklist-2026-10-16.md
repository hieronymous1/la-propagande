# La Propagande: remaining work checklist (2026-10-16)

Sources: WhatsApp export with Marc (22 Jun to 15 Oct), `docs/client-updates-2026-10.md`, live-site audit of 16 Oct.
Rule: build locally, you review, client approves, then live (only on explicit instruction).

## A. Client requests still open

- [ ] **A1. Blog linked to BOTH Instagram accounts** (15 Oct, supersedes 11 Oct item)
  - Visitor clicks a post and goes to Instagram, or sees a copy of photos and caption.
  - Needs a decision: Behold (or similar) feed per account vs. manual tagged articles.
  - Add a link to `lapropagande.psyops` on the blog (only `_lapropagande` is linked now).
  - Done when `/blog` shows real posts from both accounts on desktop and mobile.
- [ ] **A2. Visitor counter actually works** (11 Oct)
  - Configure Upstash Redis on Vercel (client-owned DB), then redeploy.
  - Decision: build Marc's fallback (slow automatic monthly increase) or keep real-only.
  - Done when `/api/visitors` returns a number and the counter shows on the site.
- [ ] **A3. Launch signup works end to end** (11 Oct)
  - One authorized test signup.
  - Client clicks the one-time FormSubmit activation email.
  - Confirm the recipient address (`lapropagande@` vs `lapropagandeparisbey@outlook.com`).

## B. Needs answers from Marc

- [ ] Doora, BuyBuy lb and Xhawi links (shown as text now; Sookit is linked)
- [ ] "St Lois" or "St Louis" Street
- [ ] Is `lapropagandeparisbey@outlook.com` the public email?
- [ ] What "the checklist" he asked about on 15 Oct refers to
- [ ] 11 Jul "the 4th in the contact page (without the QR)": confirm page placement
- [ ] Instagram authorization for both accounts (if auto-feed)

## C. Re-verify on a real phone (June/July asks)

- [ ] Store filters are a collapsible tab and the filter button is visible
- [ ] Text is not broken in the 2-column product grid
- [ ] The "simplify this" screen from 29 Jun (identify which screen, then confirm)
- [ ] Filters/metadata work with real Shopify product data

## D. Site fixes from the audit

- [ ] **D1. Hydration errors on `/`** (React #425, #418, #423). Console must be clean.
- [ ] **D2. Unique titles** for `/archive`, `/privacy`, `/terms`, `/returns`
- [ ] **D3. JSON-LD** (Organization on home, Product on product pages) and canonical tags
- [ ] **D4. Alt text** on product and brand images (about 28 of 33 homepage images lack it)
- [ ] **D5. Hero image weight** (manifesto.webp is about 1 MB at 1920px)
- [ ] **D6. Not yet assessed:** mobile Lighthouse, keyboard/screen-reader pass, contrast, visual mobile check, blog post title issue noted 15 Oct

## E. Shopify setup (confirm with you before writing to the store)

- [ ] Fill product metafields (`lap` namespace) so fallback data is not used
- [ ] Create the article `lap.instagram_url` metafield definition (if tags are not enough)
- [ ] Run `npm run shopify:sync-placeholders`

## F. Next phase, after client approval of this round

- [ ] Payment provider, shipping zones, policies, test orders
  (see launch checklist in `docs/client-updates-2026-10.md`)
- [ ] Set `NEXT_PUBLIC_COMMERCE_ENABLED=true` and redeploy; demo popup goes away

## Suggested order

1. D1, D2 (quick, low risk), then A2 and A3 config (blocks nothing else).
2. Decide A1 and the A2 fallback, then build.
3. Send Marc the section B questions in one message.
4. C and D6 verification pass on real devices.
5. Your review, client approval, then deploy on your instruction.
