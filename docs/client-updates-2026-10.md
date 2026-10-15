# October 2026 client updates

Implementation is in the local working tree. Deployment and live checkout activation are separate steps.

## Implemented

- Dismissible opening notice with the requested demo wording, launch email form, Escape/close controls and a persistent way to reopen it. Dismissal lasts for the browser session.
- Ordering defaults to disabled through `NEXT_PUBLIC_COMMERCE_ENABLED`. Product/cart controls and cart API routes respect the same flag.
- Product images use uncropped presentation with slideshow navigation where multiple photos exist.
- Main Instagram links use `_lapropagande`; archive Instagram links use `lapropagande.psyops`.
- Blog articles support selected Instagram posts/reels through Shopify article tags, with optional `lap.instagram_url` metafield support. Visitors choose when to load embeds.
- Selling points now show Fearlove Vintage Shop, St Lois Street, Beirut, Lebanon. Online platforms list Doora app (Lebanon / MENA), Sookit.co, BuyBuy lb (Lebanon), and Xhawi (Oman).
- Client document page 1 appears on the introduction and About pages, page 2 on Connect with its QR removed, and page 4 in Custom Jackets.
- About text reads Shopify `about_section` entries, including optional `Intro` and `Intro heading` entries for the hero. Marc can edit these through Shopify Admin.
- A real visitor counter is implemented using durable Redis storage and anonymous browser identification; it counts at most one visit per browser in a rolling 24-hour window.

### Full chat audit, 14 October 2026

Every text message, screenshot, voice note and the shared PDF from June to October was re-checked against the build. These earlier asks had been missed and are now fixed:

- "Events" is renamed to **Blog** in the navigation, footer, home commands and command palette (11 Oct). `/events` still redirects to `/blog`.
- "Connect" is renamed to **Contact us** everywhere (3 Jul).
- The contact channels now include **Email** (`lapropagandeparisbey@outlook.com`) (29 Jun).
- The "La Propagande" name now shows in the phone header next to the logo (29 Jun).
- Page 1 artwork no longer has a white background; its black type is recoloured cream so it stays readable (11 Jul voice note).
- Page 4 artwork is rotated to read horizontally (11 Jul voice note).
- Store grid photos can be swiped on touch screens, not only clicked (26 Aug voice note). Product pages already supported swiping.

## Configuration and content still required

| Item | Required action | Current behavior |
| --- | --- | --- |
| Launch emails | Configure a real `LAUNCH_SIGNUP_ENDPOINT` (HTTPS JSON form service) or `NEXT_PUBLIC_FORMSPREE_ID`; verify delivery to the owner with one authorized test. | With no provider configured, the form reports that notifications are unavailable. Emails are never reported as saved without provider acceptance. |
| Visitor count | Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or the documented KV aliases. | With no storage configured or a provider error, the counter stays hidden. No invented counts or automatic monthly inflation. |
| Selected Instagram posts | Marc supplies individual post/reel URLs or adds `instagram:https://www.instagram.com/p/POST_CODE/` tags to published Shopify articles. | The profile links work; individual posts appear only when explicitly connected. Automatic account synchronization needs a separate Meta authorization/integration. |
| Optional Instagram metafield | An administrator provisions `lap.instagram_url` as a URL metafield with Storefront access if the team prefers fields over tags. | Tags work without this schema change. |
| App links | Marc supplies official links for Doora, BuyBuy lb and Xhawi. | These names are displayed as text; Sookit.co is linked. |
| Fearlove address | Marc confirms the street spelling ("St Lois" as written, or "St Louis"). | Shows "St Lois Street" exactly as sent. |
| Contact email | Marc confirms `lapropagandeparisbey@outlook.com` is the public address. | Taken from the custom-jacket form recipient. |

See [Shopify editing instructions](client-shopify-content-guide.md) and [Instagram and visitor setup](instagram-and-visitors.md).

Read-only `vercel env ls` also confirmed that the linked hosting project currently
has no launch-form, Redis/KV or Instagram integration environment variables.
No hosting settings were changed.

## Read-only Shopify verification, 14 October 2026

Ran `node scripts/shopify-verify-cms.mjs` against the configured Shopify store, using existing credentials. No products, content, schema, payment settings or other store resources were changed.

- About definition exists and grants `PUBLIC_READ`; three About entries are visible through the Storefront API.
- The `news` blog has three visible articles. None has `lap.instagram_url` populated, and its metafield definition is currently missing. The article-tag option remains available.
- Existing Admin credentials include the CMS setup scopes. No new credentials were created or saved.
- All 24 visible products have image media.

Production build, lint and TypeScript checks passed. All 22 backend tests passed,
covering signup validation and provider failures, URL validation, visitor storage,
product variants and existing runtime checks. All eight focused Chrome browser
tests passed at desktop and mobile sizes; both gallery cases passed again after
the final demo purchase-bar adjustment. These cover notice dismissal/reopening,
uncropped slideshow navigation, variant selection, mobile overflow, all requested
artwork placements, locations/platforms and cart API restrictions. Screenshots
were visually inspected. The browser run used installed Chrome with video
recording disabled because the bundled Chromium/FFmpeg tools were unavailable.

## Payment, cart and delivery launch checklist

Keep `NEXT_PUBLIC_COMMERCE_ENABLED` unset or `false` until all launch checks pass.

1. Confirm the Shopify store's legal business details, selling currency and owner-approved payment provider. The owner completes provider onboarding, identity checks and payout banking in Shopify Admin.
2. Configure shipping origin, supported destinations, delivery zones, rates, packaging/weights and any pickup option. Confirm exclusions, delivery estimates, taxes/duties and how customs charges are communicated.
3. Review product prices, inventory, variants, sold-out behavior and which custom jackets require an inquiry instead of checkout. Publish shipping, returns/refunds, privacy and contact policies.
4. In a test environment with commerce enabled, verify add/update/remove cart actions, quantity bounds, sold-out products, currency and totals. Confirm Shopify checkout receives the correct variants and quantities.
5. Use the payment provider's supported test mode to exercise successful and failed payments, shipping eligibility/rates, order confirmation emails and order visibility in Shopify Admin. Verify the owner can fulfill, cancel and refund a test order.
6. Confirm notification signup delivery and visitor storage on the deployment environment. Complete desktop/mobile keyboard and checkout checks on the final preview.
7. Once the owner approves launch readiness, activate the payment provider through Shopify Admin, set `NEXT_PUBLIC_COMMERCE_ENABLED=true` and rebuild/deploy. This removes the demo notice and enables ordering together.
8. Check the production checkout with an owner-approved order and verify fulfillment communications. Return the commerce flag to `false` and redeploy if a launch-blocking issue appears.

No payment activation or production ordering was performed as part of this update.
