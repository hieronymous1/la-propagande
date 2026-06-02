# Deploy Runbook

## Environment Contract
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_ACCESS_TOKEN`
- `NEXT_PUBLIC_FORMSPREE_ID`
- `NEXT_PUBLIC_CUSTOM_JACKETS_FORM_ENDPOINT` (optional override; defaults to `https://formsubmit.co/ajax/lapropagandeparisbey@outlook.com`)

## Pre-Deploy Checklist
1. Copy `.env.example` keys into production environment variables.
2. Run `npm ci`.
3. Run `npm run qa:check`.
4. Confirm product, about, locations, blog, and contact pages load with production data.

## Release Steps
1. Deploy commit to production target.
2. Run `npm run shopify:sync-placeholders` if any Shopify products still have missing media.
3. Verify `/`, `/products`, `/products/[handle]`, `/about`, `/locations`, `/blog`, `/blog/[handle]`, `/contact`, `/archive`.
4. Validate cart add/update/remove and checkout redirect.
5. Validate filters:
   - category
   - price range
   - availability
   - tags
   - URL persistence
6. Submit a contact/archive form transmission.
7. Confirm smoke tests pass in CI (`npm run test:smoke`).

## SEO/Indexing Checks
1. Confirm `https://lapropagande.com/sitemap.xml` returns 200.
2. Confirm `https://lapropagande.com/robots.txt` returns expected rules.
3. Spot-check metadata title/description on home and products.

## Rollback
1. Roll back to previous successful deployment.
2. Re-verify cart and product detail route integrity.
3. If Shopify env values changed, revert env set and redeploy previous release.

## Post-Deploy Log
- Release version:
- Date/time:
- Operator:
- Issues found:
- Hotfix needed:
