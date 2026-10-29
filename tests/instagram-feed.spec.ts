import { expect, test } from './fixtures';

test('blog displays real posts from both accounts with working original-post links and images', async ({ page }) => {
  await page.goto('/blog');
  const feed = page.getByRole('region', { name: 'Posts from both Instagram accounts' });
  await expect(feed).toBeVisible();
  const cards = feed.locator('[data-blog-card]');
  await expect(cards).toHaveCount(4);
  for (const id of ['DetnyicjaNJ', 'DejgQ1WjX2N', 'De9VY1KOZ98', 'De4HNsmDsi1']) {
    await expect(feed.locator(`a[href="https://www.instagram.com/p/${id}/"]`).first()).toBeVisible();
  }
  await expect(feed.getByText('@_lapropagande', { exact: true }).first()).toBeVisible();
  await expect(feed.getByText('@lapropagande.psyops', { exact: true }).first()).toBeVisible();
  for (const image of await feed.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    await expect(image).toHaveCSS('object-fit', 'contain');
  }
});
