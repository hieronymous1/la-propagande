import { expect, test } from './fixtures';

test('original emblem, clean homepage and both Instagram channels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('nav[aria-label="Primary"] img')).toHaveAttribute('src', /lp-logo-red/);
  await expect(page.locator('[data-artifact], img[src*="old-web"]')).toHaveCount(0);
  await page.goto('/blog');
  await expect(page.locator('main a[href*="instagram.com/_lapropagande"]')).toBeVisible();
  await expect(page.locator('main a[href*="instagram.com/lapropagande.psyops"]')).toBeVisible();
  expect(await page.locator('[data-blog-card]').count()).toBeGreaterThan(1);
  await expect(page.locator('[data-blog-card] h2')).toHaveCount(await page.locator('[data-blog-card]').count());
});

test('catalog photos fit the image frame and compact controls remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/products');
  const next = page.getByRole('button', { name: /^Next photo of/ }).first();
  const group = page.getByRole('group', { name: /photos$/ }).first();
  await expect(next).toBeVisible();
  expect(await group.evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(108);
  const image = page.locator('main a[href^="/products/"] img').first();
  await expect(image).toHaveCSS('object-fit', 'contain');
  const before = await image.getAttribute('src');
  await next.click();
  await expect(image).not.toHaveAttribute('src', before!);
});
