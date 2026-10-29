import { test, expect } from './fixtures';

test('navbar and catalog filters stay reachable after scrolling on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 720 });
  await page.goto('/products');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect.poll(() => page.locator('.lp-topbar').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(0);
  const filters = page.locator('aside');
  await expect.poll(() => filters.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(68);
  await filters.getByRole('button', { name: 'HIGH-LOW', exact: true }).click();
  await expect(page).toHaveURL(/o=high-low/);
  await filters.getByRole('button', { name: 'RESET FILTERS', exact: true }).click();
  await expect(page).not.toHaveURL(/o=/);
});

for (const width of [320, 390]) {
  test(`mobile filters stay available and can be applied and closed at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/products');
    await page.evaluate(() => window.scrollTo(0, 700));
    await expect.poll(() => page.locator('.lp-topbar').evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(0);
    const toggle = page.getByRole('button', { name: /^FILTERS/ });
    await expect.poll(() => toggle.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(64);
    await toggle.click();
    const panel = page.locator('#catalog-filters');
    await expect(panel).toBeVisible();
    await expect(page.getByRole('button', { name: 'Demo · Notify me at launch' })).toBeHidden();
    await expect(panel.locator('input')).toHaveCSS('font-size', '16px');
    await panel.getByRole('button', { name: 'TOPS', exact: true }).click();
    await expect(page).toHaveURL(/c=tops/);
    await page.getByRole('button', { name: /SHOW \d+ RECORD/ }).click();
    await expect(panel).toBeHidden();
    await expect(page.getByRole('button', { name: 'Demo · Notify me at launch' })).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await page.getByRole('button', { name: 'One column', exact: true }).click();
    await expect(page.getByRole('button', { name: 'One column', exact: true })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
