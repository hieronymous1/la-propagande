# Instagram posts and visitor counter

## Instagram

The main profile is `_lapropagande`; the archive profile is `lapropagande.psyops`.
The blog links to the main profile and supports individual posts and reels on
both its listing and article pages. Posts load only when a visitor clicks
“Load Instagram post”; a direct link remains available if Instagram cannot embed it.

To connect a post, edit its Shopify `news` blog article and add a tag:

```text
instagram:https://www.instagram.com/p/POST_CODE/
```

Reel URLs work too. Alternatively, use the `lap.instagram_url` URL metafield
after running the existing CMS setup script with the required Admin permissions.
The metafield takes priority over the tag. Keep the article published and provide
its title, excerpt and featured image as usual. Only Instagram post/reel HTTPS
URLs are accepted. Profile links, scripts and other domains are rejected.

The blog now includes four verified public posts, two from each account, with
stable local thumbnails and direct links to the originals. The source records
are in `lib/instagram-posts.ts`; the image provenance is recorded in
`public/images/instagram/SOURCES.md`. Each card also supports the same optional
embed, so the full original post can be loaded without copying its caption.
The records were checked against both public profiles and individual post
timestamps on 27 October 2026.

This is a curated connection, not automatic account synchronization. The owner
still selects posts in Shopify. Automatic import needs the owner's Meta account
authorization and a separate token-refresh/sync integration. No posts have been
invented or imported from an unauthenticated scrape.

## Visitor counter — disabled

The owner chose to keep the counter hidden on 27 October 2026. It is not
mounted in the site layout, so browsing the site makes no visitor-count
requests and sets no counter cookie. No database, paid service or simulated
visitor count is needed for launch. The optional implementation below is
retained for a future decision to enable real counting.

### Optional real counting

Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` on the hosting
project, or their `KV_REST_API_URL` and `KV_REST_API_TOKEN` aliases. Use a durable
database owned by the client, not an expiring trial database. Keep tokens server-only.

The site uses the Redis REST API and one atomic Lua operation. An anonymous
HttpOnly browser cookie prevents repeated page loads or route changes from
increasing the count more than once within 24 hours. Redis stores only a hashed
browser identifier for that window and the cumulative total. No IP or email is
stored by the counter. The anonymous browser cookie lasts up to one year.

The displayed label is “Visits”; it measures browser visits rather than distinct
people. Clearing cookies or using another device counts again. Tracking begins
when configured; it does not reconstruct historical traffic. Missing credentials
or provider errors hide the counter instead of showing an invented number.

Implementation reference: https://upstash.com/docs/redis/features/restapi
