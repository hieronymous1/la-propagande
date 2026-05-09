import { expect, test } from '@playwright/test';

const BREAKPOINTS = [
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 414, height: 896 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
  { width: 320, height: 568 },
] as const;

const ROUTES = ['/', '/products', '/blog', '/contact', '/custom-jackets'] as const;

test.describe('Responsive QA matrix', () => {
  for (const viewport of BREAKPOINTS) {
    test(`no horizontal overflow and command/search access at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const route of ROUTES) {
        await page.goto(route);

        const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(hasOverflow, `${route} overflows at ${viewport.width}px`).toBe(false);

        if (viewport.width >= 768) {
          await expect(page.getByRole('navigation').getByLabel('Search or command input').first()).toBeVisible();
        } else {
          const menuToggle = page.getByRole('button', { name: 'Toggle menu' });
          await expect(menuToggle).toBeVisible();
          await menuToggle.click();
          await expect(page.getByText('SEARCH / COMMAND')).toBeVisible();
          await page.getByRole('button', { name: 'CLOSE' }).click();
        }
      }
    });
  }

  test('homepage hides desktop-only modules on mobile and keeps home CTA set focused', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.getByText('SYSTEM LOG STREAM')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible();
    await expect(page.getByRole('button', { name: /ABOUT/i })).toBeVisible();
    await expect(page.getByText(/archive/i)).toHaveCount(0);
  });
});
