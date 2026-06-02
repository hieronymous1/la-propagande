# Shopify CMS Setup (Archive, Blog, Products)

This project now supports Shopify-backed content for:
- Products (`/products`) via product metafields in namespace `lp`
- Blog (`/blog`) via article metafields in namespace `lp`
- Archive (`/archive`) via metaobjects (default type: `archive_entry`)
- About (`/about`) via metaobjects (default type: `about_section`)
- Locations (`/locations`) via metaobjects (default type: `location_entry`)

## 1) MCP + CLI prerequisites

1. `~/.codex/config.toml` includes:
   - `[mcp_servers.shopify-dev-mcp]`
   - `command = "npx"`
   - `args = ["-y", "@shopify/dev-mcp@latest"]`
2. Restart Codex to load the new MCP server.
3. Authenticate Shopify CLI:
   - `shopify auth logout` (optional cleanup)
   - `shopify auth login`

## 2) Environment variables

Set these in `.env.local`:

```bash
SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_ACCESS_TOKEN=...
# Optional compatibility alias:
# SHOPIFY_ADMIN_ACCESS_TOKEN=...
SHOPIFY_CONTENT_NAMESPACE=lap
SHOPIFY_ARCHIVE_METAOBJECT_TYPE=archive_entry
SHOPIFY_ABOUT_METAOBJECT_TYPE=about_section
SHOPIFY_LOCATION_METAOBJECT_TYPE=location_entry
SHOPIFY_STOREFRONT_API_VERSION=2024-01
SHOPIFY_ADMIN_API_VERSION=2024-01
SHOPIFY_SITE_ORIGIN=https://lapropagande.com
```

Notes:
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` is required for runtime storefront queries.
- `SHOPIFY_ADMIN_API_ACCESS_TOKEN` (or compatibility alias `SHOPIFY_ADMIN_ACCESS_TOKEN`) is required for creating definitions/content in Admin API.

## 3) Product fields (namespace: `lap`)

Create product metafield definitions:
- `item_code` (single_line_text_field)
- `status` (single_line_text_field) values: `AVAILABLE`, `LIMITED`, `SOLD_OUT`, `COMING_SOON`, `ARCHIVE`
- `origin` (single_line_text_field)
- `summary` (multi_line_text_field)
- `category` (single_line_text_field) values: `tops`, `bottoms`, `accessories`, `custom-jackets`
- `subcategory` (single_line_text_field)
- `collection` (single_line_text_field)
- `short_description` (multi_line_text_field)
- `featured` (boolean)
- `transmission` (single_line_text_field)
- `drop` (single_line_text_field)
- `file_notes` (multi_line_text_field)

## 4) Article fields (namespace: `lap`)

Create article metafield definitions:
- `transmission_id` (single_line_text_field)
- `channel` (single_line_text_field)
- `status` (single_line_text_field)
- `location` (single_line_text_field)
- `source` (single_line_text_field)
- `gallery` (list.file_reference, optional) for additional event images on the detail page

## 5) Archive metaobject type

Create metaobject definition `archive_entry` with fields:
- `title` (single_line_text_field)
- `folder` (single_line_text_field) values: `fragments`, `media`, `logs`, `links`
- `type` (single_line_text_field)
- `status` (single_line_text_field) values: `AVAILABLE`, `DEGRADED`, `LOCKED`, `MIRROR`, `CORRUPTED`
- `summary` (multi_line_text_field)
- `thumbnail` (file_reference preferred; legacy URL/path text is still supported as fallback)
- `href` (single_line_text_field, optional)
- `behavior` (single_line_text_field, optional) values: `delayed`, `permission`, `broken-valid-link`, `sub-index`, `locked-teaser`, `repairable`
- `sort_order` (number_integer, optional)

Then create entries for each archive record used by the page.

## 6) About metaobject type

Create metaobject definition `about_section` with fields:
- `label` (single_line_text_field)
- `body` (multi_line_text_field)
- `sort_order` (number_integer, optional)

Then create one entry per About module block.

## 7) Locations metaobject type

Create metaobject definition `location_entry` with fields:
- `title` (single_line_text_field)
- `kind` (single_line_text_field) values: `showroom`, `selling_point`
- `address` (multi_line_text_field)
- `note` (multi_line_text_field, optional)
- `date_range` (single_line_text_field, optional)
- `hours` (single_line_text_field, optional)
- `sort_order` (number_integer, optional)

Then create entries for the current showroom and selling-point list.

## 8) Placeholder product media sync

After deployment, assign placeholder media to products missing images:

```bash
npm run shopify:sync-placeholders
```

Notes:
- The script only targets products with zero media entries.
- It uses `SHOPIFY_SITE_ORIGIN` plus the deployed `/public/images/placeholders/*.svg` assets as the source URLs.

## 9) Runtime behavior implemented

- Products: queries read `lp` metafields and map into `product.lpMeta`, then fallback to existing local seed logic if fields are missing.
- Products: description HTML is cleaned so inline `FILE NOTES:` paragraphs are extracted into a dedicated `file_notes` field/panel.
- Blog: queries read `lp` metafields, generate an excerpt when one is missing, and optionally render a `gallery` file list on the event detail page.
- Archive: page reads Shopify metaobjects (`archive_entry`) at request-time, supports Shopify-managed media for `thumbnail`, and falls back to local `ARCHIVE_ENTRIES` if unavailable/empty.
- About: page reads Shopify metaobjects (`about_section`) at request-time and falls back to local blocks if unavailable/empty.
- Locations: page reads Shopify metaobjects (`location_entry`) at request-time and falls back to local entries if unavailable/empty.
