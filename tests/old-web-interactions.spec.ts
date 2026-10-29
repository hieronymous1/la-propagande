import { test, expect } from './fixtures';

test('the original console remains navigable without stickers or GIF ornaments', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('THE INTERNET IS STILL ON FIRE.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'La Propagande sticker wall' })).toHaveCount(0);
  for (const title of ['ROOT.CONSOLE', 'SYSTEM LOG', 'TRANSMISSION QUEUE', 'DIRECTORY', 'SESSION']) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-artifact], img[data-old-web]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open the archive — access limited' }).click();
  await expect(page).toHaveURL(/\/archive/);
});

test('effects preference persists and respects reduced motion', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Animated effects' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-effects', 'off');
  await expect(page.locator('.lp-home-stage video')).toHaveJSProperty('paused', true);
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-effects', 'off');
  await expect(page.locator('img[data-old-web]')).toHaveCount(0);
});

test('the original photography feed keeps manual next, previous and pause controls', async ({ page }) => {
  await page.goto('/');
  const feed = page.getByRole('figure', { name: 'La Propagande photography' });
  await feed.getByRole('button', { name: 'Pause photography' }).click();
  const caption = (await feed.locator('figcaption').textContent()) ?? '';
  await feed.getByRole('button', { name: 'Next photograph' }).click();
  await expect(feed.locator('figcaption')).not.toHaveText(caption);
  await feed.getByRole('button', { name: 'Previous photograph' }).click();
  await expect(feed.locator('figcaption')).toHaveText(caption);
});

test('mobile keeps its existing command layout and its effects control stays reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const name of [/ENTER STORE/i, /VIEW BLOG/i, /ABOUT/i, /CONTACT US/i]) await expect(page.getByRole('button', { name })).toBeVisible();
  await page.getByRole('button', { name: 'Animated effects' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-effects', 'off');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('.lp-console').evaluate((node) => node.getBoundingClientRect().right <= innerWidth)).toBe(true);
  expect(await page.locator('.lp-console .lp-wordmark').evaluate((node) => node.getBoundingClientRect().right <= innerWidth)).toBe(true);
});
