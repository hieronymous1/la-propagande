import { expect, test } from './fixtures';

test.describe('LA PROPAGANDE smoke', () => {
  test('home route renders command-driven landing shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'La Propagande' })).toBeAttached();
    await expect(page.getByRole('img', { name: 'La Propagande', exact: true })).toBeVisible();
    await expect(page.getByText('PARIS ↔ BEIRUT · BORN FROM REVOLT AND WAR')).toBeVisible();
    await expect(page.getByText(/FASTEST PATH/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /ENTER STORE/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /VIEW BLOG/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ABOUT/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /CONTACT US/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open the archive — access limited' })).toBeVisible();
    await expect(page.getByText('ARCHIVE INDEX', { exact: true })).toBeVisible();
    await expect(page.getByText('FEATURED DROP', { exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Open command palette' })).toBeVisible();

    await page.getByRole('button', { name: /ABOUT/i }).first().click();
    await expect(page).toHaveURL('/about');
  });

  test('about remains reachable from navbar and contact channels are consolidated', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');

    await page.goto('/contact');
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: /ACCESS POINTS/i })).toHaveAttribute('href', '/locations');
    await expect(main.getByRole('link', { name: /^Community/i })).toBeVisible();
    await expect(main.getByRole('link', { name: /^Archive Insta/i })).toBeVisible();
    // one WhatsApp link in the contact channels, one in the footer
    await expect(page.getByRole('link', { name: /whatsapp/i })).toHaveCount(2);
    await expect(page.getByText(/OPEN ABOUT PAGE/i)).toHaveCount(0);
    await expect(page.getByRole('link', { name: /collaboration/i })).toHaveCount(0);
    await expect(page.getByText(/Hidden access:/i)).toHaveCount(0);
    await expect(page.getByText(/Signal request format/i)).toHaveCount(0);
    await expect(page.getByText(/About La Propagande/i)).toHaveCount(0);
  });

  test('products filters update querystring and reset', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('button', { name: 'RESET FILTERS' })).toBeDisabled();

    await page.getByRole('button', { name: 'BOTTOMS' }).click();
    await expect(page).toHaveURL(/[?&]c=bottoms/);

    await page.getByRole('button', { name: 'PANTS' }).click();
    await expect(page).toHaveURL(/[?&]sc=pants/);

    await page.getByRole('button', { name: 'LIMITED' }).click();
    await expect(page).toHaveURL(/[?&]s=limited/);

    await page.getByRole('button', { name: 'LOW-HIGH' }).click();
    await expect(page).toHaveURL(/[?&]o=low-high/);

    await page.getByRole('button', { name: 'RESET FILTERS' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('store listing shows seeded product cards in demo mode (no ordering controls)', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { level: 1, name: 'Catalog' })).toBeVisible();

    const cards = page.getByRole('region', { name: 'Catalog' }).locator('article');
    expect(await cards.count()).toBeGreaterThanOrEqual(8);
    await expect(cards.first().getByRole('link', { name: /open item record/ })).toHaveAttribute('href', /^\/products\//);
    await expect(cards.first().getByRole('button', { name: /^Next photo of / })).toBeVisible();

    // NEXT_PUBLIC_COMMERCE_ENABLED is false: catalog is browse-only
    await expect(page.getByRole('button', { name: 'ADD TO CART' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toHaveCount(0);
  });

  test('product detail route renders full dossier metadata and demo-disabled controls', async ({ page }) => {
    await page.goto('/products/eyes');

    await expect(page.getByRole('heading', { level: 1, name: 'Eyes Behind My Back - OVERSIZE T-Shirt' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'STORE.exe' })).toBeVisible();
    await expect(page.getByText('MEDIA.GALLERY')).toBeVisible();
    await expect(page.getByText('ITEM.RECORD')).toBeVisible();
    await expect(page.getByText('55 EUR').first()).toBeVisible();

    const gallery = page.getByRole('region', { name: 'Eyes Behind My Back - OVERSIZE T-Shirt images' });
    await expect(gallery.locator('img')).toBeVisible();

    await expect(page.getByRole('group', { name: /^SIZE/ })).toBeVisible();
    await expect(page.getByRole('group', { name: /^COLOR/ })).toBeVisible();

    await expect(page.getByText('SPEC', { exact: true })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Made in Lebanon' }).first()).toBeVisible();

    await expect(page.getByText('DOSSIER', { exact: true })).toBeVisible();
    for (const term of ['Item code', 'Collection', 'Category', 'Origin', 'Transmission', 'Drop']) {
      await expect(page.getByRole('term').filter({ hasText: new RegExp(`^${term}$`) })).toBeVisible();
    }
    await expect(page.getByRole('definition').filter({ hasText: /^LP-EYES$/ })).toBeVisible();

    await expect(page.getByText('DESCRIPTION.LOG')).toBeVisible();
    await expect(page.getByText('RELATED RECORDS', { exact: true })).toBeVisible();

    // demo mode: ordering is disabled, never offered
    await expect(page.getByRole('button', { name: 'DEMO · ORDERING COMING SOON' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'ADD TO CART' })).toHaveCount(0);
  });

  test('primary navigation exposes Contact us and routes to locations', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact us' })).toBeVisible();

    await page.goto('/locations');
    await expect(page.getByRole('heading', { level: 1, name: 'Find La Propagande' })).toBeVisible();
    await expect(page.getByText('Showroom Badaro')).toBeVisible();
    await expect(page.getByText('Showroom Ashrafieh')).toBeVisible();
  });

  test('blog feed route renders pinned transmission and feed list with metadata', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.getByText('BLOG.log', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Transmissions' })).toBeVisible();
    await expect(page.getByText(/^PINNED · TX-\d+/)).toBeVisible();
    await expect(page.getByText(/^FEED/).first()).toBeVisible();

    const feedRows = page.getByRole('list').locator('a[href^="/blog/"]');
    expect(await feedRows.count()).toBeGreaterThanOrEqual(6);

    // each row carries a TX id, category/location/status chips, title, excerpt and cover image
    const firstRow = feedRows.first();
    await expect(firstRow).toContainText(/TX-\d+/);
    await expect(firstRow).toContainText(/LOGGED/);
    await expect(firstRow.getByRole('heading', { level: 3 })).toBeVisible();
    await expect(firstRow.getByRole('img')).toBeVisible();

    await expect(page.getByRole('link', { name: /FOLLOW @_LAPROPAGANDE/ })).toBeVisible();
  });

  test('transmission detail route renders record sections, metadata block, and related links', async ({ page }) => {
    await page.goto('/blog/channel-open-spring-broadcast');

    await expect(page.getByRole('heading', { level: 1, name: 'Channel Open: Spring Broadcast' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'BLOG.log' })).toBeVisible();
    await expect(page.getByText('RELATED TRANSMISSIONS')).toBeVisible();
    await expect(page.getByRole('link', { name: /RETURN TO FEED/i })).toHaveAttribute('href', '/blog');

    const record = page.getByRole('complementary');
    for (const term of ['Transmission', 'Received', 'Channel', 'Category', 'Status', 'Location', 'Source']) {
      await expect(record.getByRole('term').filter({ hasText: new RegExp(`^${term}$`) })).toBeVisible();
    }
    await expect(record.getByRole('definition').filter({ hasText: /^TX-8801$/ })).toBeVisible();

    // body carries the article text; record metadata lives only in the sidebar
    const article = page.getByRole('article');
    await expect(article.getByText(/Spring Broadcast opened with a hard reset/)).toBeVisible();
    await expect(article.getByText(/^TRANSMISSION ID:/)).toHaveCount(0);
    await expect(article.getByRole('term')).toHaveCount(0);
    await expect(page.getByRole('img', { name: 'Flyer' })).toBeVisible();
  });

  test('cart drawer opens in demo mode and closes', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Open cart, 0 items' }).click();
    await expect(page.getByRole('dialog', { name: 'Cart' })).toBeVisible();
    // demo mode: the drawer explains ordering is unavailable instead of listing lines/checkout
    await expect(page.getByText('Demo version — ordering is not available yet.')).toBeVisible();
    await expect(page.getByRole('link', { name: /CHECKOUT/i })).toHaveCount(0);
    await page.getByRole('button', { name: 'Close cart' }).click();
    await expect(page.getByRole('dialog', { name: 'Cart' })).toBeHidden();
  });

  test('archive remains command-line access only', async ({ page }) => {
    // direct visit without an access token bounces to root
    await page.goto('/archive');
    await expect(page.getByText('ACCESS DENIED')).toBeVisible();
    await expect(page).toHaveURL('/');

    // the command palette (nav search) grants access
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Open command palette' }).click();
    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette).toBeVisible();
    await palette.getByRole('textbox', { name: 'Command input' }).fill('archive');
    await palette.getByRole('button', { name: 'RUN' }).click();
    await expect(page).toHaveURL('/archive');

    await page.getByLabel('Archive command input').fill('help');
    await page.getByRole('button', { name: 'RUN' }).first().click();

    await expect(page.getByText('HIDDEN PATH: /archive/logs/deep-index')).toBeVisible();
  });
});
