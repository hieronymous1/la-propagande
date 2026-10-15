import { expect, test } from './fixtures';
import { ARCHIVE_ENTRIES, FALLBACK_ARTICLES, PLACEHOLDER_PRODUCTS } from '../lib/site';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('Phase 13 acceptance checklist', () => {
  test('Phase 12 placeholders are fully seeded with required minimums', async () => {
    expect(PLACEHOLDER_PRODUCTS.length).toBeGreaterThanOrEqual(8);
    expect(FALLBACK_ARTICLES.length).toBeGreaterThanOrEqual(6);
    expect(ARCHIVE_ENTRIES.length).toBeGreaterThanOrEqual(12);

    for (const product of PLACEHOLDER_PRODUCTS) {
      expect(product.title).toBeTruthy();
      expect(product.handle).toBeTruthy();
      expect(product.lpMeta?.itemCode).toMatch(/^LP-26-\d{3}$/);
      expect(product.lpMeta?.status).toBeTruthy();
      expect(product.lpMeta?.origin).toBeTruthy();
      expect(product.lpMeta?.summary).toBeTruthy();
      expect(product.descriptionHtml).toBeTruthy();
      expect(product.images.edges.length).toBeGreaterThanOrEqual(2);
      expect(product.images.edges.length).toBeLessThanOrEqual(4);
    }

    for (const post of FALLBACK_ARTICLES) {
      expect(post.title).toBeTruthy();
      expect(post.handle).toBeTruthy();
      expect(post.publishedAt).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
      expect(post.contentHtml).toBeTruthy();
      expect(post.lpMeta?.channel).toBeTruthy();
      expect(post.lpMeta?.transmissionId).toBeTruthy();
      const imageCount = post.lpGallery?.length ?? (post.image ? 1 : 0);
      expect(imageCount).toBeGreaterThanOrEqual(1);
      expect(imageCount).toBeLessThanOrEqual(3);
    }

    const folderCounts = ARCHIVE_ENTRIES.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.folder] = (acc[entry.folder] ?? 0) + 1;
      return acc;
    }, {});

    expect(folderCounts.fragments ?? 0).toBeGreaterThan(0);
    expect(folderCounts.media ?? 0).toBeGreaterThan(0);
    expect(folderCounts.logs ?? 0).toBeGreaterThan(0);
    expect(folderCounts.links ?? 0).toBeGreaterThan(0);
  });

  test('events fallback feed includes required Framer reference posts with recovered imagery', async () => {
    const requiredPosts = [
      {
        handle: 'la-propagande-x-maddina-market',
        title: 'La Propagande x Maddina Market',
        image: '/images/events/maddina_market_01.webp',
      },
      {
        handle: 'colonel-reef-popup',
        title: 'Colonel Reef Popup',
        image: '/images/events/colonel_reef_01.webp',
      },
      {
        handle: 'la-propagande-x-beatretreat',
        title: 'La Propagande x Beatretreat',
        image: '/images/events/beatretreat_01.webp',
      },
    ];

    for (const requiredPost of requiredPosts) {
      const post = FALLBACK_ARTICLES.find((entry) => entry.handle === requiredPost.handle);
      expect(post, `${requiredPost.handle} should exist`).toBeTruthy();
      expect(post?.title).toBe(requiredPost.title);
      expect(post?.image?.url).toBe(requiredPost.image);
      expect(post?.lpMeta?.status).toBeTruthy();
      expect(post?.lpMeta?.channel).toBeTruthy();
      expect(post?.contentHtml).toBeTruthy();
    }
  });

  test('navigation keeps archive out of primary UI and only reachable via the command palette', async ({ page }) => {
    await page.goto('/products');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Store' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact us' })).toBeVisible();
    await expect(nav.getByRole('link', { name: /archive/i })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: /events/i })).toHaveCount(0);

    await nav.getByRole('button', { name: 'Open command palette' }).click();
    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette).toBeVisible();
    // archive is not advertised in the palette's default suggestions
    await expect(palette.getByRole('option', { name: /archive/i })).toHaveCount(0);
    await palette.getByRole('textbox', { name: 'Command input' }).fill('archive');
    await palette.getByRole('button', { name: 'RUN' }).click();
    await expect(page).toHaveURL('/archive');
  });

  test('logo returns to home on content routes', async ({ page }) => {
    await page.goto('/blog');
    await page.getByRole('link', { name: 'La Propagande — return to root' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: 'La Propagande' })).toBeAttached();
    await expect(page.getByRole('img', { name: 'La Propagande', exact: true })).toBeVisible();
  });

  test('all placeholder product and post detail routes are testable', async ({ page }) => {
    test.setTimeout(180_000);
    for (const product of PLACEHOLDER_PRODUCTS) {
      await page.goto(`/products/${product.handle}`);
      await expect(page.getByRole('heading', { level: 1, name: product.title })).toBeVisible();
      await expect(page.getByText('ITEM.RECORD')).toBeVisible();
      await expect(page.getByText('DOSSIER', { exact: true })).toBeVisible();
    }

    for (const post of FALLBACK_ARTICLES) {
      await page.goto(`/blog/${post.handle}`);
      // the rendered title can be overridden by the live content source, so assert the record renders rather than the fallback title
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'BLOG.log' })).toBeVisible();
      await expect(page.getByRole('complementary').getByText('Record', { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: /RETURN TO FEED/i })).toBeVisible();
    }
  });

  test('homepage shell modules and primary CTA set remain present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('img', { name: 'La Propagande', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Open command palette' })).toBeVisible();
    for (const cta of [/ENTER STORE/i, /VIEW BLOG/i, /ABOUT/i, /CONTACT US/i]) {
      await expect(page.getByRole('button', { name: cta })).toBeVisible();
    }
    await expect(page.getByText('ARCHIVE INDEX', { exact: true })).toBeVisible();
    await expect(page.getByText('ROOT.CONSOLE')).toBeVisible();
    await expect(page.getByText('FEATURED DROP', { exact: true })).toBeVisible();
  });

  test('responsive shell keeps navigation and route content usable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/products');
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Store' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Catalog' }).locator('article').first()).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/blog');
    await expect(page.getByRole('heading', { level: 1, name: 'Transmissions' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products');
    await expect(page.getByRole('button', { name: 'MENU' })).toBeVisible();
    await page.getByRole('button', { name: 'MENU' }).click();
    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu.getByText('COMMAND.SHEET')).toBeVisible();
    await expect(menu.getByRole('link', { name: '> Blog' })).toBeVisible();
    await expect(menu.getByRole('link', { name: '> Store' })).toBeVisible();
  });
});
