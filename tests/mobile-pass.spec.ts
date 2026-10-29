import { expect, test } from './fixtures';

test.use({ hasTouch: true });

const routes = ['/', '/store', '/products', '/blog', '/events', '/about', '/contact', '/locations', '/custom-jackets', '/archive', '/privacy', '/terms', '/returns'];

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]) {
  test(`site routes and detail templates fit at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const details = new Set<string>();
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBeLessThan(400);
      await expect(page.locator('main')).toBeVisible();
      if (route === '/products' || route === '/blog') {
        const hrefs = await page.locator(`main a[href^="${route}/"]`).evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
        for (const href of viewport.width <= 390 ? hrefs : hrefs.slice(0, 1)) details.add(href);
      }
      await checkLayout(route);
    }
    for (const route of Array.from(details)) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBeLessThan(400);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await checkLayout(route);
    }

    async function checkLayout(route: string) {
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      // Body overflow clipping can hide oversized grids; check the actual panels too.
      const escapedPanels = await page.locator('main .lp-panel').evaluateAll((panels) => panels
        .filter((panel) => {
          const rect = panel.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
        }).map((panel) => panel.textContent?.slice(0, 60)));
      expect(escapedPanels, route).toEqual([]);
      const clippedControls = await page.locator('main .lp-btn').evaluateAll((controls) => controls
        .filter((control) => control.getBoundingClientRect().width > 0 && control.scrollWidth > control.clientWidth + 1)
        .map((control) => control.textContent?.trim()));
      expect(clippedControls, route).toEqual([]);
    }
  });
}

for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 320 }]) {
  test(`touch overlays remain operable at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'MENU', exact: true });
    await menu.click();
    const sheet = page.getByRole('dialog', { name: 'Menu', exact: true });
    await expect(sheet.getByRole('link').first()).toBeFocused();
    const closeMenu = sheet.getByRole('button', { name: 'CLOSE', exact: true });
    await closeMenu.focus();
    await page.keyboard.press('Tab');
    await expect(sheet.getByRole('link').first()).toBeFocused();
    await closeMenu.click();
    await expect(menu).toBeFocused();

    const search = page.getByRole('button', { name: 'Open command palette' });
    await search.click();
    const palette = page.getByRole('dialog', { name: 'Command palette' });
    await expect(palette.getByRole('textbox')).toBeFocused();
    const closeSearch = palette.getByRole('button', { name: 'Close command palette' });
    await expect(closeSearch).toBeInViewport();
    expect(await palette.evaluate((node) => node.getBoundingClientRect().bottom <= innerHeight)).toBe(true);
    await closeSearch.click();
    await expect(search).toBeFocused();

    await page.getByRole('button', { name: /Open cart/ }).click();
    const cart = page.getByRole('dialog', { name: 'Cart', exact: true });
    await expect(cart.getByRole('button', { name: 'Close cart' })).toBeInViewport();
    await cart.getByRole('button', { name: 'Close cart' }).click();
    await page.goto('/contact');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const returns = page.getByRole('contentinfo').getByRole('link', { name: 'RETURNS', exact: true });
    expect(await returns.evaluate((node) => node.getBoundingClientRect().bottom <= document.querySelector('.lp-dock')!.getBoundingClientRect().top)).toBe(true);
  });
}

test('resizing an open mobile menu releases scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'MENU', exact: true }).click();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.getByRole('dialog', { name: 'Menu', exact: true })).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('tablet navigation keeps search legible and all routes accessible', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/contact');
  const search = page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Open command palette' });
  expect(await search.evaluate((node) => node.getBoundingClientRect().width)).toBeGreaterThan(180);
  await page.getByRole('button', { name: 'MENU', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Menu', exact: true }).getByRole('link', { name: /Custom Jackets/ })).toBeVisible();
});
