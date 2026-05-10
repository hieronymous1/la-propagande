# Shopify CMS Setup (Archive, Blog, Products)

This project now supports Shopify-backed content for:
- Products (`/products`) via product metafields in namespace `lp`
- Blog (`/blog`) via article metafields in namespace `lp`
- Archive (`/archive`) via metaobjects (default type: `archive_entry`)

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
SHOPIFY_STOREFRONT_API_VERSION=2024-01
SHOPIFY_ADMIN_API_VERSION=2024-01
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

## 6) Runtime behavior implemented

- Products: queries read `lp` metafields and map into `product.lpMeta`, then fallback to existing local seed logic if fields are missing.
- Blog: queries read `lp` metafields, generate an excerpt when one is missing, and optionally render a `gallery` file list on the event detail page.
- Archive: page reads Shopify metaobjects (`archive_entry`) at request-time, supports Shopify-managed media for `thumbnail`, and falls back to local `ARCHIVE_ENTRIES` if unavailable/empty.
