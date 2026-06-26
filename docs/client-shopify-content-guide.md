# LA PROPAGANDE Shopify Content Guide

This guide is for updating the site in Shopify without touching code.

## Before you start
- Log in to Shopify Admin.
- Keep image files easy to find before uploading them.
- Save after every major edit.
- After publishing, refresh the site and allow a short delay for Shopify to update.

## Products / Store

### Change product text or price
1. Open `Products` in Shopify Admin.
2. Click the product you want to edit.
3. Update the main product fields:
   - `Title`: product name on store cards and product pages
   - `Description`: main product text on the product page
   - `Media`: product photos
   - `Pricing`: product price
4. Scroll to the LA PROPAGANDE metafields and update as needed:
   - `item_code`: small product code shown in the UI
   - `status`: availability label such as `AVAILABLE`, `LIMITED`, or `SOLD_OUT`
   - `origin`: origin line on the product page
   - `summary`: product page summary bullets; enter one bullet point per line
   - `category`: `tops`, `bottoms`, `accessories`, or `custom-jackets`
   - `subcategory`: smaller category like `hoodies` or `tees`
   - `collection`: collection name
   - `short_description`: short support text
   - `featured`: feature flag
   - `transmission`: optional transmission label
   - `drop`: optional drop label
   - `file_notes`: optional extra product notes; leave blank to hide the file notes panel
5. Click `Save`.

### Replace or add product images
1. Open the product.
2. In `Media`, upload a new image or drag images into the order you want.
3. The first image is usually the lead image shown first on the site.
4. Click `Save`.

## Events / Blog

### Add a new event or post
1. Open `Content` or `Online Store > Blog posts`.
2. Open the `news` blog.
3. Click `Add blog post`.
4. Fill in:
   - `Title`: main post title
   - `Content`: full post body
   - `Excerpt`: short preview text for the events listing
   - `Featured image`: main post image
5. Add tags if needed. The first tag can appear like a category or channel label.
6. In the LA PROPAGANDE metafields section, fill in:
   - `transmission_id`
   - `channel`
   - `status`
   - `location`
   - `source`
   - `gallery`: optional extra images for the post detail page
7. Set the post to visible/published.
8. Click `Save`.

### Change blog text
1. Open the `news` blog.
2. Open the post you want to edit.
3. Update `Title`, `Content`, or `Excerpt`.
4. Click `Save`.

### Replace blog images
1. Open the blog post.
2. Replace the `Featured image` if you want to change the main listing/detail image.
3. Update the `gallery` metafield if you want extra images lower on the detail page.
4. Click `Save`.

### What each blog field controls
- `Title`: headline on listing and detail page
- `Content`: full post body
- `Excerpt`: preview text on `/blog`
- `Featured image`: main blog image
- `transmission_id`: transmission code in metadata
- `channel`: channel label
- `status`: status label
- `location`: location label
- `source`: source label
- `gallery`: extra images on the event detail page

## Archive

Important: the Archive is not managed from Blog Posts. It uses a separate content type called `archive_entry`.

### Add a new archive item
1. Open `Content` in Shopify Admin.
2. Open the metaobject area.
3. Open the definition named `archive_entry`.
4. Click `Add entry`.
5. Fill in:
   - `title`: archive card title
   - `folder`: `fragments`, `media`, `logs`, or `links`
   - `type`: short type label shown on the card
   - `status`: `AVAILABLE`, `DEGRADED`, `LOCKED`, `MIRROR`, or `CORRUPTED`
   - `summary`: archive card text
   - `thumbnail`: archive image
   - `href`: optional link
   - `behavior`: optional special interaction behavior
   - `sort_order`: optional number for display order
6. Click `Save`.

### Replace an archive image
1. Open the `archive_entry` item.
2. Find `thumbnail`.
3. Replace the selected media file.
4. Click `Save`.

### Change archive text or metadata
1. Open the `archive_entry` item.
2. Update the fields you want to change.
3. Click `Save`.

### What each archive field controls
- `title`: card heading
- `folder`: archive section/filter
- `type`: small type label
- `status`: colored status badge
- `summary`: description text on the card
- `thumbnail`: card image
- `href`: link destination
- `behavior`: optional special card behavior
- `sort_order`: card order

## Contact / Direct Channels
- Current WhatsApp and social links are hard-coded in the site.
- If you want those editable in Shopify too, that would be a separate CMS change.

## Common mistakes to avoid
- Do not add Archive items as Blog posts. They will not appear on the Archive page.
- Always add a `Featured image` to blog posts if you want a main image on the events listing.
- Keep `status` values exact.
- Keep archive `folder` values exact.
- If you want extra event images, add them to `gallery`.

## If something does not appear on the site
1. Confirm the item was saved.
2. Confirm the item is published/visible.
3. Confirm you edited the correct content type:
   - Blog post for `/blog`
   - `archive_entry` for `/archive`
   - Product for `/products`
4. Refresh the site after a short wait.
5. If it still does not appear, send the title or handle of the item to the site team.
