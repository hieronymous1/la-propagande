import { expect, test } from '@playwright/test';

test.describe('LA PROPAGANDE smoke', () => {
  test('home route renders command-driven landing shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('LA PROPAGANDE', { exact: true })).toBeVisible();
    await expect(page.getByText('PARIS <-> BEIRUT', { exact: true })).toBeVisible();
    await expect(page.getByText(/FASTEST PATH/i)).toHaveCount(0);
    await expect(page.getByRole('button', { name: /ENTER STORE/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /VIEW EVENTS/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ABOUT/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /CONNECT/i })).toBeVisible();
    await expect(page.getByText(/archive/i)).toHaveCount(0);
    await expect(page.getByPlaceholder('SEARCH PRODUCTS OR EVENTS').first()).toBeVisible();

    await page.getByRole('button', { name: /ABOUT/i }).first().click();
    await expect(page).toHaveURL('/about');
  });

  test('about remains reachable from navbar and contact channels are consolidated', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('link', { name: 'ABOUT' }).first().click();
    await expect(page).toHaveURL('/about');

    await page.goto('/contact');
    await expect(page.getByRole('link', { name: /VIEW LOCATIONS/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /> COMMUNITY/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /> ARCHIVE INSTA/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /> WHATSAPP/i })).toHaveCount(2);
    await expect(page.getByText(/OPEN ABOUT PAGE/i)).toHaveCount(0);
    await expect(page.getByText(/COLLABORATION/i)).toHaveCount(0);
    await expect(page.getByText(/Hidden access:/i)).toHaveCount(0);
    await expect(page.getByText(/Signal request format/i)).toHaveCount(0);
    await expect(page.getByText(/About La Propagande/i)).toHaveCount(0);
  });

  test('products filters update querystring and reset', async ({ page }) => {
    await page.goto('/products');

    await page.getByRole('button', { name: 'BOTTOMS' }).click();
    await expect(page).toHaveURL(/[?&]c=bottoms/);

    await page.getByRole('button', { name: 'PANTS' }).click();
    await expect(page).toHaveURL(/[?&]sc=pants/);

    await page.getByRole('button', { name: 'LIMITED' }).click();
    await expect(page).toHaveURL(/[?&]s=limited/);

    await page.getByRole('button', { name: 'PRICE: LOW TO HIGH' }).click();
    await expect(page).toHaveURL(/[?&]o=low-high/);

    await page.getByRole('button', { name: 'RESET FILTERS' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('store listing shows placeholder-ready dossier cards', async ({ page }) => {
    await page.goto('/products');

    const productLinks = page.locator('a[href^="/products/"]');
    const totalCards = await productLinks.count();
    expect(totalCards).toBeGreaterThanOrEqual(8);

    await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Increase quantity' }).first()).toBeVisible();
    await expect(page.getByText('INVENTORY DOSSIER', { exact: true })).toBeVisible();
  });

  test('catalog card quantity controls add multiple units to cart', async ({ page }) => {
    await page.goto('/products');

    await page.getByRole('button', { name: 'Increase quantity' }).first().click();
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await page.getByRole('button', { name: 'Open cart' }).first().click();

    await expect(page.getByRole('dialog', { name: 'Cart' })).toBeVisible();
    await expect(page.getByText('2').first()).toBeVisible();
  });

  test('product detail route renders full dossier metadata and controls', async ({ page }) => {
    await page.goto('/products/signal-uniform-tee');

    await expect(page.getByText('ITEM DOSSIER', { exact: false })).toBeVisible();
    await expect(page.getByText('ITEM.RECORD')).toBeVisible();
    await expect(page.getByText('METADATA.BLOCK')).toBeVisible();
    await expect(page.getByText('DESCRIPTION.LOG')).toBeVisible();
    await expect(page.getByText('RELATED ITEMS')).toBeVisible();
    await expect(page.getByText('Daily field tee with route print.')).toBeVisible();

    const metadataPanel = page.locator('.lp-panel', { hasText: 'METADATA.BLOCK' });
    await expect(metadataPanel.getByText(/Item Code:/i)).toBeVisible();
    await expect(metadataPanel.getByText(/Status:/i)).toBeVisible();
    await expect(metadataPanel.getByText(/Origin:/i)).toBeVisible();
    await expect(metadataPanel.getByText(/Transmission:/i)).toBeVisible();
    await expect(metadataPanel.getByText(/Drop:/i)).toBeVisible();
    await expect(metadataPanel.getByText(/File Notes:/i)).toBeVisible();

    await expect(page.getByText('VARIANT / SIZE')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' })).toBeVisible();
    await expect(page.getByText('SUMMARY.LOG')).toBeVisible();
    const summaryPanel = page.locator('.lp-panel', { hasText: 'SUMMARY.LOG' });
    await expect(summaryPanel.locator('li')).toHaveCount(1);
    await expect(page.getByText('FILE NOTES', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /> RETURN TO CATALOG/i })).toBeVisible();

    const mediaPanel = page.locator('.lp-panel', { hasText: 'MEDIA.GALLERY' });
    await expect(mediaPanel).toBeVisible();
    await expect(mediaPanel.locator('img').first()).toBeVisible();
  });

  test('primary navigation exposes Connect and routes to locations', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('link', { name: 'CONNECT' }).first()).toBeVisible();

    await page.goto('/locations');
    await expect(page.getByText('PHYSICAL LOCATIONS', { exact: true })).toBeVisible();
    await expect(page.getByText(/SHOWROOM BADARO/i)).toBeVisible();
    await expect(page.getByText(/ABC ASHRAFIEH/i)).toBeVisible();
  });

  test('events feed route renders pinned transmission list with metadata labels', async ({ page }) => {
    await page.goto('/blog');

    await expect(page.getByText('EVENTS.log', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('TRANSMISSION FEED', { exact: true })).toBeVisible();
    await expect(page.getByText(/PINNED \/\//)).toBeVisible();

    const transmissionLinks = page.locator('a[href^="/blog/"]');
    const totalRows = await transmissionLinks.count();
    expect(totalRows).toBeGreaterThanOrEqual(6);

    await expect(page.getByText(/RECEIVED:/).first()).toBeVisible();
    await expect(page.getByText(/CHANNEL:/).first()).toBeVisible();
    await expect(page.getByText(/STATUS:/).first()).toBeVisible();
    await expect(page.getByText(/LOCATION:/).first()).toBeVisible();
    await expect(page.getByText(/TRANSMISSION ID:/).first()).toBeVisible();
    await expect(page.locator('a[href^="/blog/"] img').first()).toBeVisible();
  });

  test('transmission detail route renders record sections, utility block, and related links', async ({ page }) => {
    await page.goto('/blog/la-propagande-x-maddina-market');

    await expect(page.getByText(/LA PROPAGANDE X MADDINA MARKET/i).first()).toBeVisible();
    await expect(page.getByText('UTILITY METADATA BLOCK', { exact: true })).toBeVisible();
    await expect(page.getByText('RELATED TRANSMISSIONS', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /> RETURN TO EVENTS FEED/i })).toBeVisible();

    const utilityPanel = page.locator('.lp-panel', { hasText: 'UTILITY METADATA BLOCK' });
    await expect(utilityPanel.getByText(/^TRANSMISSION ID:/)).toBeVisible();
    await expect(utilityPanel.getByText(/^RECEIVED:/)).toBeVisible();
    await expect(utilityPanel.getByText(/^CATEGORY:/)).toBeVisible();
    await expect(utilityPanel.getByText(/^SOURCE:/)).toBeVisible();
    await expect(utilityPanel.getByText(/^STATUS:/)).toBeVisible();
    await expect(utilityPanel.getByText(/^LOCATION:/)).toBeVisible();
    const mainPanel = page.getByTestId('event-detail-main');
    await expect(mainPanel.getByText(/^CHANNEL:/)).toHaveCount(0);
    await expect(mainPanel.getByText(/^CATEGORY:/)).toHaveCount(0);
    await expect(mainPanel.getByText(/^STATUS:/)).toHaveCount(0);
    await expect(mainPanel.getByText(/^LOCATION:/)).toHaveCount(0);

    const articlePanel = page.locator('.lp-panel').first();
    await expect(articlePanel.locator('img').first()).toBeVisible();
    await expect(page.getByText(/entered Maddina Market as a live node|Where chaotic harmony meets creation/i)).toBeVisible();
  });

  test('cart drawer opens and closes', async ({ page }) => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Open cart' }).first().click();
    await expect(page.getByRole('dialog', { name: 'Cart' })).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await page.getByRole('button', { name: 'Close cart' }).click();
    await expect(page.getByRole('dialog', { name: 'Cart' })).toBeHidden();
  });

  test('archive remains command-line access only', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByLabel('Search or command input').first().fill('archive');
    await page.getByRole('button', { name: 'GO' }).first().click();
    await expect(page).toHaveURL('/archive');

    await page.getByLabel('Archive command input').fill('help');
    await page.getByRole('button', { name: 'RUN' }).first().click();

    await expect(page.getByText('HIDDEN PATH: /archive/logs/deep-index')).toBeVisible();
  });
});
