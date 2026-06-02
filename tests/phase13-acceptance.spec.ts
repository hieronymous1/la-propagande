import { expect, test } from '@playwright/test';
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

  test('navigation keeps archive out of primary UI and only reachable via command input', async ({ page }) => {
    await page.goto('/products');
    const nav = page.locator('nav').first();
    await expect(nav.getByRole('link', { name: 'STORE' }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'EVENTS' }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'ABOUT' }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: 'CONNECT' }).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /archive/i })).toHaveCount(0);
    await expect(page.getByText(/archive/i)).toHaveCount(0);

    await page.getByRole('navigation').getByLabel('Search or command input').first().fill('archive');
    await page.getByRole('button', { name: 'GO' }).first().click();
    await expect(page).toHaveURL('/archive');
  });

  test('logo returns to home on content routes', async ({ page }) => {
    await page.goto('/blog');
    await page.getByRole('link', { name: 'La Propagande home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('LA PROPAGANDE', { exact: true })).toBeVisible();
  });

  test('all placeholder product and post detail routes are testable', async ({ page }) => {
    for (const product of PLACEHOLDER_PRODUCTS) {
      await page.goto(`/products/${product.handle}`);
      await expect(page.getByText('ITEM DOSSIER', { exact: false })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1, name: product.title })).toBeVisible();
      await expect(page.getByText('METADATA.BLOCK')).toBeVisible();
    }

    for (const post of FALLBACK_ARTICLES) {
      await page.goto(`/blog/${post.handle}`);
      await expect(page.getByText(new RegExp(escapeRegExp(post.title), 'i')).first()).toBeVisible();
      await expect(page.getByText('UTILITY METADATA BLOCK')).toBeVisible();
      await expect(page.getByRole('link', { name: /> RETURN TO EVENTS FEED/i })).toBeVisible();
    }
  });

  test('homepage shell modules and primary CTA set remain present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('LA PROPAGANDE', { exact: true })).toBeVisible();
    await expect(page.getByRole('navigation').getByLabel('Search or command input').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /ABOUT/i })).toBeVisible();
    await expect(page.getByText(/archive/i)).toHaveCount(0);
    await expect(page.getByText('ROOT.CONSOLE')).toBeVisible();
  });

  test('responsive shell keeps navigation and route content usable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/products');
    await expect(page.locator('nav').first().getByRole('link', { name: 'STORE' }).first()).toBeVisible();
    await expect(page.getByText('INVENTORY DOSSIER', { exact: true })).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/blog');
    await expect(page.getByText('TRANSMISSION FEED')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/products');
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible();
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await expect(page.getByText('COMMAND.SHEET')).toBeVisible();
    await expect(page.getByRole('link', { name: /> EVENTS/ })).toBeVisible();
  });
});
